from utils.pdf_loader import load_pdfs
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

pdfs = [
    r"data\Christo_Complete_RAG_Portfolio.pdf",
    r"data\Christo_RAG_Portfolio.pdf"
]

print("Loading PDFs...")
docs = load_pdfs(pdfs)

print("Splitting documents...")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(docs)

print(f"Created {len(chunks)} chunks")

print("Creating embeddings...")

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_db = FAISS.from_documents(
    chunks,
    embedding
)

vector_db.save_local("vectorstore")

print("Done")