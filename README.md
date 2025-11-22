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

:

🧩 Prerequisites

Before running ContractIQ, make sure you have the following installed:

System Requirements

Python 3.11+ — for the backend (FastAPI)

Node.js 18+ — for the frontend (Next.js)

Tesseract OCR — used for text extraction
(Skip if you plan to run with Docker — it’s preinstalled inside the container)

🧱 Installing Tesseract OCR (Local Only)
🪟 Windows

Download the Windows installer from the official Tesseract repo:
👉 Tesseract for Windows (UB Mannheim Build)

Run the installer and add tesseract.exe to your system PATH.
🍎 macOS
brew install tesseract
🐧 Linux (Ubuntu/Debian)
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng
⚙️ Environment Variables Setup

ContractIQ uses an .env file in the Backend directory to configure runtime settings.

Step 1: Create the .env file
cd Backend
copy .env.example .env    # On Windows
# or
cp .env.example .env      # On macOS/Linux
Step 2: Edit your .env file

Here’s a minimal example configuration:
ENV=development
PORT=8000

Step 3: Add Tesseract path (if running locally)

If you installed Tesseract manually, you need to specify where its tessdata files are stored.

🪟 Windows
TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
🐧 Linux/macOS
TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
💡 Note:
You don’t need to set TESSDATA_PREFIX when using Docker — it’s already preconfigured in the image.

▶️ Running the Backend (Local, with venv)
cd Backend
python -m venv venv
.\venv\Scripts\activate     # Windows
# or
source venv/bin/activate    # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Backend will start on:
👉 http://localhost:8000/docs
▶️ Running the Frontend
cd Frontend/contractiq
npm install
npm run dev
Frontend will start on:
👉 http://localhost:3000

🐳 Running Everything with Docker

If you have Docker installed, you can start both frontend and backend together:
docker compose up --build

Backend → http://localhost:8000

Frontend → http://localhost:3000

🧱 Docker images already include tesseract-ocr and tesseract-ocr-eng,
so no manual setup is needed.

