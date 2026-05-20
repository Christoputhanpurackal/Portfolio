from utils.pdf_loader import load_pdfs

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

pdfs = [
    r"D:\portfolio2\backend\data\Christo_Complete_RAG_Portfolio.pdf",
    r"D:\portfolio2\backend\data\Christo_RAG_Portfolio.pdf"
]

print("Loading PDFs...")

docs = load_pdfs(pdfs)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

chunks = splitter.split_documents(docs)

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