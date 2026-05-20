from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
from datetime import datetime, timedelta, date

from rag import ask
from database import engine, get_db, Base
from models import ChatHistory, Visitor, Activity, Comment

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Base directory for backend files (ensures paths resolve when running from project root)
BASE_DIR = os.path.dirname(__file__)

# If a built frontend exists at ../frontend/dist, serve it under /frontend
dist_dir = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))
if os.path.exists(dist_dir):
    try:
        app.mount('/frontend', StaticFiles(directory=dist_dir), name='frontend')
    except Exception:
        pass

# Ensure static directory exists
os.makedirs(os.path.join(BASE_DIR, 'static'), exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_QUESTIONS = [
    "Tell me about Christo",
    "What projects has Christo done?",
    "What AI skills does Christo have?",
    "Explain internship experience",
    "What certifications does Christo have?",
    "Which technologies does Christo know?"
]


class ChatRequest(BaseModel):
    question: str


class TrackRequest(BaseModel):
    visitor_id: str | None = None
    ip: str | None = None
    country: str | None = None
    city: str | None = None
    device: str | None = None
    browser: str | None = None
    os: str | None = None
    page: str | None = None
    section: str | None = None
    event: str | None = None
    timestamp: datetime | None = None
    session_duration: float | None = None


class CommentRequest(BaseModel):
    name: str | None = None
    comment: str
    rating: int | None = None


@app.get("/")
def home():

    return {
        "message": "Portfolio RAG Backend Running",
        "status": "active"
    }


@app.get("/profile")
def profile():

    return {
        "name": "Christo Puthanpurackal",
        "role": "AI / Data Science Graduate",
        "skills": [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "Flask",
            "FastAPI",
            "Data Science"
        ],
        "languages": [
            "English",
            "Malayalam"
        ]
    }


@app.post("/chat")
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db)
):

    result = ask(data.question)

    # supports either string or future dict response
    answer = result if isinstance(result, str) else result["answer"]

    save_chat = ChatHistory(
        question=data.question,
        answer=answer
    )

    db.add(save_chat)
    db.commit()

    # Log activity for analytics (visitor info should be tracked separately via /track)
    try:
        activity = Activity(
            visitor_id=None,
            type="chat",
            detail=data.question,
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    except Exception:
        db.rollback()

    return {"answer": answer}



@app.post("/track")
def track(
    data: TrackRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Resolve IP if not provided
    ip = data.ip or request.client.host

    # Use visitor_id if provided; otherwise create placeholder
    visitor = None
    if data.visitor_id:
        visitor = db.query(Visitor).filter(Visitor.visitor_id == data.visitor_id).first()

    if not visitor:
        visitor = Visitor(
            visitor_id=data.visitor_id or None,
            ip=ip,
            country=data.country,
            city=data.city,
            device=data.device,
            browser=data.browser,
            os=data.os,
            first_visit=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            session_duration=data.session_duration or 0.0
        )
        db.add(visitor)
        db.commit()
        db.refresh(visitor)
    else:
        # update visitor info
        visitor.ip = ip or visitor.ip
        visitor.country = data.country or visitor.country
        visitor.city = data.city or visitor.city
        visitor.device = data.device or visitor.device
        visitor.browser = data.browser or visitor.browser
        visitor.os = data.os or visitor.os
        visitor.last_activity = data.timestamp or datetime.utcnow()
        if data.session_duration is not None:
            visitor.session_duration = data.session_duration
        db.add(visitor)
        db.commit()

    # Create activity record for this event
    event_type = data.event or ("section" if data.section else ("page" if data.page else "visit"))
    detail = data.section or data.page or data.event or "visit"

    activity = Activity(
        visitor_id=visitor.id,
        type=event_type,
        detail=detail,
        timestamp=data.timestamp or datetime.utcnow()
    )

    db.add(activity)
    db.commit()

    return {"status": "ok", "visitor_id": visitor.visitor_id or visitor.id}



@app.post("/comment")
def post_comment(
    data: CommentRequest,
    db: Session = Depends(get_db)
):
    comment = Comment(
        name=data.name,
        comment=data.comment,
        rating=data.rating
    )
    db.add(comment)
    db.commit()

    # Log activity
    activity = Activity(
        visitor_id=None,
        type="comment",
        detail=data.comment,
        timestamp=datetime.utcnow()
    )
    db.add(activity)
    db.commit()

    return {"status": "ok", "id": comment.id}


@app.get("/comments")
def get_comments(db: Session = Depends(get_db)):
    comments = db.query(Comment).order_by(Comment.created_at.desc()).limit(50).all()
    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "name": c.name,
            "comment": c.comment,
            "rating": c.rating,
            "likes": c.likes,
            "created_at": c.created_at
        })
    return result


@app.get("/recent-activity")
def recent_activity(db: Session = Depends(get_db)):
    acts = db.query(Activity).order_by(Activity.timestamp.desc()).limit(100).all()
    out = []
    for a in acts:
        out.append({
            "id": a.id,
            "visitor_id": a.visitor_id,
            "type": a.type,
            "detail": a.detail,
            "timestamp": a.timestamp
        })
    return out


@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    total_visitors = db.query(func.count(Visitor.id)).scalar()

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    todays_visitors = db.query(func.count(Visitor.id)).filter(Visitor.first_visit >= today_start).scalar()

    total_chat_questions = db.query(func.count(ChatHistory.id)).scalar()

    # Most visited section
    section_counts = (
        db.query(Activity.detail, func.count(Activity.id).label("cnt"))
        .filter(Activity.type.in_(["page", "section"]))
        .group_by(Activity.detail)
        .order_by(func.count(Activity.id).desc())
        .limit(5)
        .all()
    )

    most_visited = [s[0] for s in section_counts]

    # Average session duration
    avg_session = db.query(func.avg(Visitor.session_duration)).scalar() or 0

    # Daily visitors for last 7 days
    daily = []
    for i in range(7, -1, -1):
        d = date.today() - timedelta(days=i)
        start = datetime.combine(d, datetime.min.time())
        end = datetime.combine(d, datetime.max.time())
        cnt = db.query(func.count(Visitor.id)).filter(Visitor.first_visit >= start, Visitor.first_visit <= end).scalar()
        daily.append({"date": d.isoformat(), "count": cnt})

    # Chat usage per day (last 7 days)
    chat_usage = []
    for i in range(7, -1, -1):
        d = date.today() - timedelta(days=i)
        start = datetime.combine(d, datetime.min.time())
        end = datetime.combine(d, datetime.max.time())
        cnt = db.query(func.count(ChatHistory.id)).filter(ChatHistory.created_at >= start, ChatHistory.created_at <= end).scalar()
        chat_usage.append({"date": d.isoformat(), "count": cnt})

    recent = db.query(Activity).order_by(Activity.timestamp.desc()).limit(10).all()
    recent_list = [{"type": r.type, "detail": r.detail, "timestamp": r.timestamp} for r in recent]

    return {
        "total_visitors": total_visitors,
        "todays_visitors": todays_visitors,
        "total_chat_questions": total_chat_questions,
        "most_visited": most_visited,
        "avg_session_duration": float(avg_session),
        "daily_visitors": daily,
        "chat_usage": chat_usage,
        "recent": recent_list
    }


@app.get("/recommendations")
def recommendations(
    db: Session = Depends(get_db)
):

    chats = db.query(ChatHistory).all()

    history_questions = []

    for chat in chats:
        history_questions.append(
            chat.question
        )

    all_questions = (
        DEFAULT_QUESTIONS +
        history_questions[::-1]
    )

    unique_questions = list(
        dict.fromkeys(
            all_questions
        )
    )

    return {
        "recommended_questions":
        unique_questions[:10]
    }


@app.get("/history")
def history(
    db: Session = Depends(get_db)
):

    chats = db.query(
        ChatHistory
    ).all()

    result = []

    for chat in chats:

        result.append(
            {
                "id": chat.id,
                "question": chat.question,
                "answer": chat.answer,
                "time": chat.created_at
            }
        )

    return result


@app.get("/download-cv")
def cv():

    path = os.path.join(
        BASE_DIR,
        "static",
        "cv",
        "CHRISTO AI.pdf"
    )

    if not os.path.exists(path):

        raise HTTPException(
            status_code=404,
            detail="CV not found"
        )

    # Serve PDF inline so it can be embedded in iframes
    headers = {"Content-Disposition": 'inline; filename="ChristoCV.pdf"'}
    return FileResponse(
        path,
        media_type="application/pdf",
        headers=headers
    )


@app.get("/certificates")
def certificates():

    path = os.path.join(
        BASE_DIR,
        "static",
        "certificates"
    )

    if not os.path.exists(path):

        return {
            "certificates": []
        }

    files = []

    for file in os.listdir(path):

        if file.lower().endswith(".pdf"):

            files.append(file)

    return {
        "certificates": files
    }


@app.get("/certificate/{filename:path}")
def get_cert(filename: str):

    file_path = os.path.join(
        BASE_DIR,
        "static",
        "certificates",
        filename
    )

    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    # Determine media type by extension
    media = "application/pdf" if file_path.lower().endswith('.pdf') else None
    headers = {"Content-Disposition": f'inline; filename="{os.path.basename(file_path)}"'}
    return FileResponse(
        file_path,
        media_type=media,
        headers=headers
    )


### ADMIN + UPLOAD ENDPOINTS (simple token-based placeholder)


@app.post('/admin/login')
def admin_login(data: dict):
    username = data.get('username')
    password = data.get('password')
    if username == 'christo' and password == 'placeholder':
        return {'token': 'admin-token'}
    raise HTTPException(status_code=401, detail='Invalid credentials')


def verify_admin_token(auth: str | None):
    if not auth:
        return False
    if auth.startswith('Bearer '):
        token = auth.split(' ',1)[1]
        return token == 'admin-token'
    return False


@app.post('/upload/profile')
async def upload_profile(request: Request, authorization: str | None = Header(None)):
    if not verify_admin_token(authorization):
        raise HTTPException(status_code=403, detail='Forbidden')
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail='No file data provided')
    os.makedirs(os.path.join(BASE_DIR,'static'), exist_ok=True)
    dest = os.path.join(BASE_DIR,'static','profile.jpg')
    with open(dest,'wb') as f:
        f.write(body)
    return {'status':'ok', 'path': '/profile.jpg'}


@app.post('/upload/resume')
async def upload_resume(request: Request, authorization: str | None = Header(None)):
    if not verify_admin_token(authorization):
        raise HTTPException(status_code=403, detail='Forbidden')
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail='No file data provided')
    os.makedirs(os.path.join(BASE_DIR,'static','cv'), exist_ok=True)
    dest = os.path.join(BASE_DIR,'static','cv','CHRISTO AI.pdf')
    with open(dest,'wb') as f:
        f.write(body)
    return {'status':'ok', 'path': '/download-cv'}


@app.post('/upload/certificate')
async def upload_certificate(request: Request, authorization: str | None = Header(None)):
    if not verify_admin_token(authorization):
        raise HTTPException(status_code=403, detail='Forbidden')
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail='No file data provided')
    # filename can be provided via query param or header
    filename = request.query_params.get('filename') or request.headers.get('X-Filename')
    if not filename:
        # fallback to timestamped filename
        filename = f"certificate_{int(datetime.utcnow().timestamp())}.pdf"
    os.makedirs(os.path.join(BASE_DIR,'static','certificates'), exist_ok=True)
    dest = os.path.join(BASE_DIR,'static','certificates', filename)
    with open(dest,'wb') as f:
        f.write(body)
    return {'status':'ok', 'path': f'/certificate/{filename}'}