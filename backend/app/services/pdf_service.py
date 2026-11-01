import fitz  # PyMuPDF
from typing import BinaryIO

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract plain text from uploaded PDF document bytes using PyMuPDF.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        extracted_text = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text:
                extracted_text.append(f"--- Page {page_num + 1} ---\n{text}")
        doc.close()
        return "\n\n".join(extracted_text) if extracted_text else "No extractable text found in PDF."
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF document: {str(e)}")
