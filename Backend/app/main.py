# app/main.py
import os, io, re, time, asyncio, mimetypes
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
from PIL import Image, UnidentifiedImageError
import pytesseract

from app.config import settings
from app.logging import logger
from app.utils_ocr import ocr_pdf_bytes, ocr_image_bytes
from app.analyze import analyze_text

STARTED = time.time()

# ---------- helpers ----------
def clean_text_pretty(s: str) -> str:
    s = re.sub(r"(\w)-\n(\w)", r"\1\2", s)         # de-hyphenate line breaks
    s = re.sub(r"\n{3,}", "\n\n", s)               # collapse 3+ blank lines
    s = re.sub(r"[ \t]{2,}", " ", s)               # normalize long spaces
    s = "\n".join(line.rstrip() for line in s.splitlines())
    return s.strip()

def _set_tesseract_cmd_if_available():
    paths: List[str] = []
    if getattr(settings, "TESSERACT_PATH", None):
        paths.append(settings.TESSERACT_PATH)  # type: ignore[attr-defined]
    paths += [
        r"C:\Users\kalva\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    ]
    for p in paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            os.environ["PATH"] = os.path.dirname(p) + ";" + os.environ.get("PATH", "")
            td = os.path.join(os.path.dirname(p), "tessdata")
            if os.path.isdir(td):
                os.environ["TESSDATA_PREFIX"] = td
            break

if os.name == "nt":
    _set_tesseract_cmd_if_available()

def _is_allowed_mime(content_type: Optional[str], name: str) -> bool:
    guess = mimetypes.guess_type(name)[0] or ""
    ct = content_type or guess
    allowed_prefixes = ["application/pdf", "image/", "text/plain"]
    return bool(ct) and any(ct.startswith(prefix) for prefix in allowed_prefixes)

def _ext_ok(name: str) -> bool:
    allowed_exts = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".tiff", ".txt"]
    return any(name.lower().endswith(ext) for ext in allowed_exts)

async def _with_timeout(fn, *args, timeout: int):
    # run CPU-bound OCR in a thread with a server-side timeout
    return await asyncio.wait_for(asyncio.to_thread(fn, *args), timeout=timeout)

# ---------- app ----------
app = FastAPI(title="ContractIQ Backend", version="1.0")

# CORS: allow localhost and 127.0.0.1 (configurable via .env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# simple logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.time()
    try:
        resp = await call_next(request)
        logger.info(f"{request.client.host} {request.method} {request.url.path} {resp.status_code} {(time.time()-t0)*1000:.1f}ms")
        return resp
    except Exception as e:
        logger.error(f"ERR {request.method} {request.url.path} {type(e).__name__}: {e}")
        raise

# ---------- routes ----------
@app.get("/")
def root():
    return {
        "ok": True,
        "message": "ContractIQ backend running",
        "endpoints": ["/health", "/extract", "/analyze", "/docs"],
    }

@app.get("/health")
def health():
    try:
        version = str(pytesseract.get_tesseract_version())
    except Exception as e:
        version = f"not found ({type(e).__name__}: {e})"
    return {
        "status": "ok",
        "tesseract": version,
        "tesseract_cmd": getattr(pytesseract.pytesseract, "tesseract_cmd", None),
        "tessdata_prefix": os.getenv("TESSDATA_PREFIX"),
        "uptime_sec": round(time.time() - STARTED, 1),
    }

@app.post("/extract")
async def extract(
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    max_pages: int = Query(default=5, ge=1, le=50),
    dpi: int = Query(default=150, ge=100, le=300),
    lang: str = Query(default="eng"),
):
    # clamp to env limits
    max_pages = max(1, min(getattr(settings, "MAX_PAGES", 10), max_pages))
    dpi = max(getattr(settings, "MIN_DPI", 100), min(getattr(settings, "MAX_DPI", 300), dpi))
    timeout_sec = int(getattr(settings, "OCR_TIMEOUT_SEC", 45))

    # TEXT mode
    if text and text.strip():
        cleaned = clean_text_pretty(text)
        return JSONResponse({
            "filename": "pasted.txt",
            "text": cleaned,
            "pages": [cleaned],
            "page_count": 1,
            "elapsed_sec": 0.0,
        })

    # FILE mode
    if file is None:
        raise HTTPException(status_code=400, detail="Provide a file or text.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    # size guard
    size_mb = len(data) / (1024 * 1024)
    if size_mb > float(getattr(settings, "MAX_UPLOAD_MB", 12)):
        raise HTTPException(status_code=413, detail=f"File too large ({size_mb:.1f}MB)")

    name = (file.filename or "").lower()
    if not _ext_ok(name):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if not _is_allowed_mime(file.content_type, name):
        raise HTTPException(status_code=400, detail="Unsupported MIME type")

    try:
        if name.endswith(".pdf"):
            # precheck encrypted PDFs
            try:
                with fitz.open(stream=data, filetype="pdf") as doc:
                    if doc.needs_pass:
                        raise HTTPException(status_code=400, detail="Encrypted PDF not supported")
            except HTTPException:
                raise
            except Exception:
                pass  # let OCR try anyway

            result = await _with_timeout(ocr_pdf_bytes, data, max_pages, dpi, lang, timeout=timeout_sec)

        elif name.endswith(".txt"):
            raw = data.decode(errors="ignore")
            result = {"text": raw, "pages": [raw], "page_count": 1, "elapsed_sec": 0.0}

        else:
            # quick image integrity check
            try:
                Image.open(io.BytesIO(data)).verify()
            except UnidentifiedImageError:
                raise HTTPException(status_code=400, detail="Invalid image file")

            result = await _with_timeout(ocr_image_bytes, data, lang, timeout=timeout_sec)

        cleaned = clean_text_pretty(result.get("text", ""))
        pages = result.get("pages") if isinstance(result.get("pages"), list) else []
        return JSONResponse({
            "filename": file.filename,
            "text": cleaned,
            "pages": [str(p or "") for p in pages],
            "page_count": int(result.get("page_count") or len(pages)),
            "elapsed_sec": float(result.get("elapsed_sec") or 0.0),
        })

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail=f"OCR exceeded {timeout_sec}s timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")

@app.post("/analyze")
async def analyze(payload: Dict[str, str]):
    text = (payload.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' in request body.")
    result = analyze_text(text)
    return JSONResponse(result)
