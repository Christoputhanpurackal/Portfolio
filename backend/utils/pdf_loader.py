# utils/pdf_loader.py
from langchain_community.document_loaders import PyPDFLoader

def load_pdfs(files):

    docs=[]

    for file in files:
        loader=PyPDFLoader(file)
        docs.extend(loader.load())

    return docs