from dotenv import load_dotenv
import os
import logging
import google.generativeai as genai

# -----------------------------
# Load .env
# -----------------------------
load_dotenv()

BASE_DIR = os.path.dirname(__file__)

vector_db = None
client = None

# -----------------------------
# Initialize Vector DB
# -----------------------------
try:
    vs_path = os.path.join(BASE_DIR, "vectorstore")
    vs_index = os.path.join(vs_path, "index.faiss")

    print("Checking vectorstore:", vs_index)

    if os.path.exists(vs_index):

        from langchain_community.vectorstores import FAISS
        from langchain_huggingface import HuggingFaceEmbeddings

        embedding = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        vector_db = FAISS.load_local(
            vs_path,
            embedding,
            allow_dangerous_deserialization=True
        )

        print("Vector DB loaded successfully")

    else:
        print("Vectorstore not found")

except Exception as e:
    logging.exception(
        "Vector DB error: %s",
        e
    )

    vector_db = None


# -----------------------------
# Initialize Gemini
# -----------------------------
try:

    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:

        genai.configure(
            api_key=api_key
        )

        client = genai.GenerativeModel(
            "models/gemini-2.5-flash"
        )

        print("Gemini initialized")

    else:

        print("No Gemini key")
        client = None

except Exception as e:

    logging.exception(
        "Gemini init error: %s",
        e
    )

    client = None


# -----------------------------
# Main Ask Function
# -----------------------------
def ask(question: str):

    print("=" * 50)
    print("Question:", question)

    if vector_db is None:
        return "Vector database not loaded"

    try:

        docs = vector_db.similarity_search(
            question,
            k=4
        )

        print(
            "Retrieved:",
            len(docs)
        )

        if len(docs) == 0:
            return "No matching information"

        context = "\n".join(
            [d.page_content for d in docs]
        )

        print(
            context[:1000]
        )

    except Exception as e:

        print(
            "Search Error:",
            e
        )

        return str(e)

    if client is None:
        return "Gemini client not initialized"

    prompt = f"""
You are Christo's AI Portfolio Assistant.

Answer only from the provided context.

If answer not available,
reply only:
I don't know

Context:
{context}

Question:
{question}
"""

    try:

        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3
            )
        )

        answer = response.text

        print("Answer:")
        print(answer)

        return answer

    except Exception as e:

        print(
            "Gemini Error:",
            e
        )

        return f"Gemini Error: {str(e)}"