# 🧾 ContractIQ

**ContractIQ** is an AI-powered OCR and clause risk analysis platform designed to scan contracts, extract key clauses, and highlight potentially risky or complex terms.  
It helps users — especially those unfamiliar with legal language — quickly identify important details and make informed decisions.

---

## 🚀 Overview

ContractIQ streamlines contract review by combining **Optical Character Recognition (OCR)** with **Natural Language Processing (NLP)**.  
It scans scanned or digital PDFs, identifies legal clauses (like indemnification, termination, arbitration, etc.), and ranks them by risk.  

This tool is built for:
- Legal teams and startups reviewing vendor or employment contracts
- Non-expert users who need plain-language summaries
- Accessibility-focused users who prefer simplified, high-contrast interfaces

---

## ✨ Features

✅ **OCR Extraction** – Converts scanned contracts and PDFs into searchable text using **Tesseract** and **PyMuPDF**  
✅ **Clause Analysis** – Detects and categorizes risky clauses using NLP and rule-based heuristics  
✅ **Risk Scoring** – Rates each clause from 1–10 based on severity or ambiguity  
✅ **Plain-Language Summaries** – Translates legal jargon into simple explanations  
✅ **Rate Limiting & Optimization** – Uses **SlowAPI** to manage concurrent OCR requests efficiently  
✅ **Responsive UI** – Built with **Next.js** and **TailwindCSS** for a modern, fast, and accessible front-end  
✅ **Accessibility Mode** – High contrast, large text, and clear highlighting for readability  
✅ **Export Options** – Copy, download, or export risk reports for easy sharing

---

## 🧠 Tech Stack

**Frontend:**  
- Next.js  
- TailwindCSS  

**Backend:**  
- FastAPI  
- SlowAPI (rate limiting)  

**OCR & NLP:**  
- Tesseract OCR  
- PyMuPDF (PDF parsing)  
- spaCy / Transformers (optional clause detection)

**Utilities:**  
- Docker  
- GitHub Actions (for CI/CD)  
- Python 3.11+

---

✅ Prerequisites

Python 3.11+

Node 18+ (for the frontend)

Tesseract OCR installed (skip if using Docker)

Windows: install Tesseract and add tesseract.exe to PATH

macOS: brew install tesseract

Linux: sudo apt-get install tesseract-ocr tesseract-ocr-eng

⚙️ Environment variables

Create Backend/.env (or copy from .env.example) and set:

# Backend/.env
ENV=development
PORT=8000
# If running locally (non-Docker) and you installed Tesseract yourself:
# On Windows, set to the tessdata folder you installed (adjust path)
# TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
# On Linux/macOS:
# TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata


Docker images already include tesseract-ocr + eng, so TESSDATA_PREFIX is not required in Docker.

🐍 Run backend (local, with venv)
# from repo root
cd Backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt

# start FastAPI (hot reload)
uvicorn app.main:app --reload --port 8000


Open docs: http://localhost:8000/docs

🌐 Run frontend (local)
# from repo root
cd Frontend/contractiq
npm install
npm run dev


Open app: http://localhost:3000

🐳 Run everything with Docker (recommended)
# from repo root (where docker-compose.yml lives)
docker compose up --build


Backend → http://localhost:8000/docs

Frontend → http://localhost:3000

For live reload in dev, the compose file mounts your code. Edit files locally and the servers refresh.

📤 Use the API directly (OCR + clause analysis)
1) Extract text from a PDF/image
# replace sample.pdf with your file
curl -X POST "http://localhost:8000/extract" \
  -F "file=@sample.pdf"


Response (example):

{
  "pages": 3,
  "text": "…full extracted text…"
}

2) Analyze clauses and risk
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{ "text": "Paste the contract text here" }'


Response (example):

{
  "avg_risk": 2.1,
  "clauses": [
    {
      "title": "Indemnification",
      "risk": 8,
      "summary": "You may be liable for third-party damages.",
      "snippet": "…"
    },
    {
      "title": "Termination",
      "risk": 6,
      "summary": "Other party can terminate with short notice.",
      "snippet": "…"
    }
  ]
}


In the UI, you can upload a file, see extracted text, sort by risk, and filter by min/max risk score.

🔎 Typical workflow

Upload contract (PDF/image) in the web app → backend does OCR (Tesseract + PyMuPDF).

Clause detection runs → risky clauses flagged and scored 1–10.

Review results → sort/filter by risk, click clauses to see the original snippet.

Export → copy or download the results report from the UI.

🧰 Troubleshooting

“Form data requires python-multipart”
Add to Backend/requirements.txt and reinstall:

python-multipart


Then restart uvicorn (or docker compose build api --no-cache && docker compose up).

Module not found: pydantic_settings
Add to Backend/requirements.txt:

pydantic-settings>=2.2


Reinstall and restart.

ASGI app not found
Make sure you start with:

uvicorn app.main:app --reload


and that Backend/app/__init__.py exists (can be empty).

Tesseract not found (local, non-Docker)
Install Tesseract and set TESSDATA_PREFIX in .env to your tessdata directory.
On Windows, Tesseract usually installs here:

C:\Program Files\Tesseract-OCR\tessdata

🧪 Quick test (end-to-end)

Start backend + frontend (venv or Docker).

Visit http://localhost:3000

Upload a small PDF (e.g., a one-page lease).

Click Analyze Clauses → you should see risk scores and summaries.

