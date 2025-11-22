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

🧠 Setup Guide

🗂️ Directory Structure
```bash
ContractIQ/
│
├── Backend/                        # FastAPI backend for OCR & clause analysis
│   ├── app/
│   │   ├── main.py                 # API entry point
│   │   ├── clause_analysis/        # Clause detection & risk scoring
│   │   ├── ocr/                    # OCR text extraction (Tesseract + PyMuPDF)
│   │   └── utils/                  # Helper utilities
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Backend Docker config
│   ├── .env.example                # Example environment config
│   └── tests/                      # Backend test suite
│
├── Frontend/
│   └── contractiq/                 # Next.js + TailwindCSS frontend
│       ├── pages/                  # App routes
│       ├── components/             # UI components
│       ├── public/                 # Static assets
│       └── package.json            # Frontend dependencies
│
└── docker-compose.yml              # Combined full-stack configuration
