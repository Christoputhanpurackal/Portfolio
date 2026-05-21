# utils/pdf_loader.py
from pypdf import PdfReader

class Document:
    def __init__(self, page_content, metadata=None):
        self.page_content = page_content
        self.metadata = metadata or {}

def load_pdfs(files):
    docs = []
    for file in files:
        try:
            reader = PdfReader(file)
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    docs.append(Document(
                        page_content=text,
                        metadata={"source": file, "page": i}
                    ))
        except Exception as e:
            print(f"[PDF_LOADER] Error loading {file}: {e}")
    return docs