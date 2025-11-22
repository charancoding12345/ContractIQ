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

🧰 Prerequisites

Node 18+ (for the frontend)

Tesseract OCR (skip this if you’re using Docker)

⚙️ Install Tesseract manually only for local (non-Docker) setups

Windows

Install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki
# Then add tesseract.exe to your PATH


macOS

brew install tesseract


Linux (Ubuntu/Debian)

sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-eng

⚙️ Environment Variables

Create a file called .env inside the Backend folder (or copy from .env.example):

cd Backend
copy .env.example .env   # Windows
# or
cp .env.example .env     # macOS/Linux


Edit .env and set the following values:

ENV=development
PORT=8000


If you’re running locally and installed Tesseract manually, set the TESSDATA_PREFIX variable:

🪟 On Windows
TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata

🐧 On Linux/macOS
TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata


🧱 Docker users:
The Docker image already includes Tesseract OCR + English language data, so TESSDATA_PREFIX isn’t required in Docker.

▶️ Run Backend (local with venv)
cd Backend
python -m venv venv
.\venv\Scripts\activate    # Windows
# or
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

▶️ Run Frontend
cd Frontend/contractiq
npm install
npm run dev


Open the app in your browser:
👉 http://localhost:3000

