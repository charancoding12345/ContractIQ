# app/analyze.py
from __future__ import annotations
import os, re
from typing import Dict, List, Tuple

RISK_KEYWORDS: Dict[str, List[str]] = {
    "auto_renewal": [r"\bauto(matic|)-?renew(al|)\b", r"\brenews?\b", r"\brecurr(ing|ence)\b"],
    "termination": [r"\bterminate(s|d|ion)?\b", r"\bnotice\b", r"\bbreach\b", r"\bcancellation?\b"],
    "penalty": [r"\bpenalt(y|ies)\b", r"\blate fee(s)?\b", r"\bfine(s)?\b", r"\bsurcharge(s)?\b"],
    "liability": [r"\bliab(le|ility)\b", r"\bindemnif(y|ication|ies)\b", r"\bresponsib(le|ility)\b", r"\bdamages?\b"],
    "confidentiality": [r"\bconfidential(ity|)\b", r"\bnon-?disclosure\b", r"\bNDA\b"],
    "payment": [r"\bpayment(s)?\b", r"\binvoice(s|d)?\b", r"\binterest\b", r"\brate\b", r"\bnet ?\d{1,3}\b"],
    "ip_rights": [r"\bintellectual property\b", r"\blicense(s|d|ing)?\b", r"\bassign(ment|)\b"],
    "jurisdiction": [r"\bgoverning law\b", r"\bvenue\b", r"\barbitration\b", r"\bjurisdiction\b"],
    "data_privacy": [r"\bGDPR\b", r"\bCCPA\b", r"\bdata (privacy|protection)\b"],
}
CATEGORY_WEIGHT: Dict[str, float] = {
    "auto_renewal": 0.8, "termination": 1.0, "penalty": 1.0, "liability": 1.2,
    "confidentiality": 0.7, "payment": 0.6, "ip_rights": 0.7, "jurisdiction": 0.5, "data_privacy": 1.0,
}
NUMERIC_BOOST = 0.4
CAPS_BOOST = 0.3
USE_LLM = os.getenv("USE_LLM", "0") == "1"

def _find_tags(text: str) -> Tuple[List[str], float]:
    tags: List[str] = []
    score = 0.0
    lower = text.lower()
    for tag, patterns in RISK_KEYWORDS.items():
        for pat in patterns:
            if re.search(pat, lower, flags=re.IGNORECASE):
                tags.append(tag); score += CATEGORY_WEIGHT.get(tag, 0.5); break
    if re.search(r"\b\d{1,4}\b", text): score += NUMERIC_BOOST
    up = sum(1 for c in text if c.isupper()); letters = sum(1 for c in text if c.isalpha())
    if letters >= 10 and (up / letters) >= 0.55: score += CAPS_BOOST
    return sorted(set(tags)), score

def _clamp01(x: float) -> float: return max(0.0, min(1.0, x))

def classify_clause(text: str) -> Dict:
    tags, raw = _find_tags(text)
    risk = int(round(_clamp01(raw / 3.0) * 9.0)) + 1
    return {"summary": text.strip()[:240] + ("…" if len(text.strip()) > 240 else ""), "risk": risk, "tags": tags}

def analyze_text(text: str) -> Dict:
    raw_clauses = [c.strip() for c in re.split(r"(?:\n{2,}|(?<=[.;:])\s+\n?)", text) if c.strip()]
    clauses: List[Dict] = []
    for idx, c in enumerate(raw_clauses, start=1):
        item = classify_clause(c)
        item["text"] = c
        item["id"] = idx
        clauses.append(item)
    avg_risk = round(sum(x["risk"] for x in clauses) / len(clauses), 2) if clauses else 0.0
    return {"count": len(clauses), "avg_risk": avg_risk, "clauses": clauses}
