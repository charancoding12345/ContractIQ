# app/utils_ocr.py
from __future__ import annotations
import io, time
from typing import Dict, List

import fitz  # PyMuPDF
from PIL import Image
import pytesseract

def _ocr_image(img: Image.Image, lang: str = "eng") -> str:
    return pytesseract.image_to_string(img, lang=lang).strip()

def ocr_pdf_bytes(file_bytes: bytes, max_pages: int = 5, dpi: int = 150, lang: str = "eng") -> Dict:
    t0 = time.time()
    pages_text: List[str] = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        total_pages = doc.page_count
        for i, page in enumerate(doc):
            if i >= max_pages:
                pages_text.append(f"[Note] Stopped early at {max_pages} pages for speed.")
                break
            txt = (page.get_text("text") or "").strip()
            if len(txt) >= 10:
                pages_text.append(txt)
                continue
            pix = page.get_pixmap(dpi=dpi)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            pages_text.append(_ocr_image(img, lang=lang))

    return {
        "text": "\n\n".join(pages_text).strip(),
        "pages": pages_text,
        "page_count": total_pages,
        "elapsed_sec": round(time.time() - t0, 2),
    }

def ocr_image_bytes(file_bytes: bytes, lang: str = "eng") -> Dict:
    t0 = time.time()
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    txt = _ocr_image(img, lang=lang)
    return {"text": txt, "pages": [txt], "page_count": 1, "elapsed_sec": round(time.time() - t0, 2)}
