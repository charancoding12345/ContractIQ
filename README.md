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

🧾 ContractIQ — Setup Guide
📁 Directory Structure
ContractIQ/
│
├── Backend/                    # FastAPI backend for OCR & clause analysis
│   ├── app/
│   │   ├── main.py             # API entry point
│   │   ├── clause_analysis/    # Clause risk detection logic
│   │   ├── ocr/                # OCR extraction (Tesseract + PyMuPDF)
│   │   └── utils/              # Helper functions
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend Docker config
│   ├── .env.example            # Example environment file
│   └── tests/                  # Unit & integration tests
│
├── Frontend/
│   └── contractiq/             # Next.js + Tailwind frontend
│       ├── pages/              # Routes
│       ├── components/         # UI components
│       ├── public/             # Static assets
│       └── package.json        # Frontend dependencies
│
└── docker-compose.yml          # Combined full-stack setup

⚙️ Backend Setup
1️⃣ Install Dependencies
cd Backend
python -m venv venv
.\venv\Scripts\activate     # Windows
# or
source venv/bin/activate    # macOS/Linux

pip install -r requirements.txt

2️⃣ Configure Environment

Copy the example .env file:

cp .env.example .env    # macOS/Linux
# or
copy .env.example .env  # Windows


Then edit .env as needed:

ENV=development
PORT=8000


If running locally and you installed Tesseract manually:

Windows

TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata


Linux/macOS

TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata


⚠️ Docker users: skip this — Tesseract is already installed in the image.

3️⃣ Run the Server
uvicorn app.main:app --reload --port 8000


✅ Backend running at:

REST API → http://localhost:8000

Docs → http://localhost:8000/docs

💻 Frontend Setup
1️⃣ Install Dependencies
cd Frontend/contractiq
npm install

2️⃣ Run the Dev Server
npm run dev


✅ Frontend running at:
http://localhost:3000

🐳 Docker Setup (Full Stack)
1️⃣ Build and Run
docker compose up --build

2️⃣ Access

Backend: http://localhost:8000/docs

Frontend: http://localhost:3000

Docker automatically handles dependencies (Python, Node, and Tesseract).
