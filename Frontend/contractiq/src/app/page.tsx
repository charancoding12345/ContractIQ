"use client";
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type ExtractResponse = {
  filename: string;
  text: string;
  pages?: string[];
  page_count?: number;
  elapsed_sec?: number;
};

type Clause = { id: number; text: string; risk: number; tags: string[] };
type AnalysisResponse = { clauses: Clause[]; avg_risk: number };

type Mode = "file" | "text";
type SortMode = "original" | "risk_desc" | "risk_asc";

const countMetrics = (s: string) => {
  const chars = s.length;
  const words = (s.trim().match(/\b[\p{L}\p{N}’'-]+\b/gu) || []).length;
  return { words, chars };
};

export default function Home() {
  // THEME
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // PHASE 1: Extraction
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [plainText, setPlainText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [maxPages, setMaxPages] = useState(5);
  const [dpi, setDpi] = useState(150);
  const [lang, setLang] = useState("eng");
  const [dragOver, setDragOver] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  // Sorting & Filtering state
  const [sortMode, setSortMode] = useState<SortMode>("original");
  const [minRisk, setMinRisk] = useState<number>(1);
  const [maxRisk, setMaxRisk] = useState<number>(10);

  const bg = theme === "dark" ? "bg-neutral-900 text-neutral-100" : "bg-white text-black";
  const surface = theme === "dark" ? "bg-neutral-800" : "bg-neutral-100";

  const text = useMemo(() => data?.text || "", [data]);
  const extractedCounts = useMemo(() => countMetrics(text), [text]);
  const pastedCounts = useMemo(() => countMetrics(plainText), [plainText]);

  // -------- upload / process handler with client timeout --------
  const onUpload = async () => {
    if (mode === "file" && !file) return;
    if (mode === "text" && !plainText.trim()) return;

    setErr(null);
    setData(null);
    setAnalysis(null);
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000); // 60s client timeout

    try {
      const fd = new FormData();
      if (mode === "file" && file) {
        fd.append("file", file);
      } else {
        fd.append("text", plainText);
        fd.append("filename", "pasted.txt");
      }

      const url = `${API_BASE}/extract?max_pages=${maxPages}&dpi=${dpi}&lang=${encodeURIComponent(
        lang
      )}`;

      const res = await fetch(url, { method: "POST", body: fd, signal: controller.signal });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();

      if (!res.ok) {
        try {
          const errJson = JSON.parse(raw);
          throw new Error(errJson?.detail || `HTTP ${res.status}`);
        } catch {
          throw new Error(`HTTP ${res.status} — ${raw.slice(0, 200) || "No body"}`);
        }
      }
      if (!ct.includes("application/json")) {
        throw new Error(`Non-JSON from server (${ct}). Body: ${raw.slice(0, 200)}`);
      }

      setData(JSON.parse(raw) as ExtractResponse);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setErr("Client timeout: server took too long. Try fewer pages or lower DPI.");
      } else {
        setErr(e?.message || "Upload failed");
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      setErr("No text to analyze. Extract or paste text first.");
      return;
    }
    setErr(null);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Analyze failed: ${body.slice(0, 200)}`);
      }
      const json = (await res.json()) as AnalysisResponse;
      setAnalysis(json);
    } catch (e: any) {
      setErr(e?.message || "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert("Copied extracted text to clipboard");
  };

  const downloadTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (data?.filename?.replace(/\.[^.]+$/, "") || "extracted") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------- sorting / filtering --------
  const visibleClauses = useMemo(() => {
    if (!analysis) return [];
    let arr = analysis.clauses.filter((c) => c.risk >= minRisk && c.risk <= maxRisk);
    if (sortMode === "risk_desc") {
      arr = [...arr].sort((a, b) => b.risk - a.risk || a.id - b.id);
    } else if (sortMode === "risk_asc") {
      arr = [...arr].sort((a, b) => a.risk - b.risk || a.id - b.id);
    }
    return arr;
  }, [analysis, sortMode, minRisk, maxRisk]);

  const resetFilters = () => {
    setSortMode("original");
    setMinRisk(1);
    setMaxRisk(10);
  };

  return (
    <main className={`min-h-screen ${bg}`}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">ContractIQ — Phase 1 & 2</h1>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="border rounded-lg px-3 py-1 hover:opacity-80"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        <p className="opacity-80">
          Phase 1: extract text from a PDF / image or paste raw text. Phase 2: analyze clauses and
          risks, with sorting and risk-range filtering.
        </p>

        {/* --- Phase 1 block --- */}
        <div className={`mt-4 p-4 rounded-xl ${surface}`}>
          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button
              className={`px-3 py-1 rounded border ${
                mode === "file" ? "bg-black text-white border-black" : ""
              }`}
              onClick={() => setMode("file")}
            >
              Upload File
            </button>
            <button
              className={`px-3 py-1 rounded border ${
                mode === "text" ? "bg-black text-white border-black" : ""
              }`}
              onClick={() => setMode("text")}
            >
              Paste Text
            </button>
          </div>

          {/* Inputs */}
          {mode === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
              className={`rounded-xl p-4 transition border-2 ${
                dragOver
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-dashed border-gray-400 dark:border-gray-300"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="fileInput"
                    className="px-3 py-1 border rounded cursor-pointer text-sm bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                  >
                    Choose File
                  </label>
                  <div className="px-3 py-1 text-sm opacity-80 select-none">
                    {file ? file.name : "No file chosen"}
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm opacity-80">max_pages</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 bg-transparent"
                    min={1}
                    max={50}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm opacity-80">dpi</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 bg-transparent"
                    min={100}
                    max={300}
                    step={25}
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm opacity-80">lang</label>
                  <input
                    type="text"
                    className="w-24 border rounded px-2 py-1 bg-transparent"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    placeholder="eng"
                  />
                </div>

                <button
                  onClick={onUpload}
                  disabled={loading || (mode === "file" && !file)}
                  className="ml-auto border rounded-lg px-3 py-2 hover:opacity-80 disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Extract Text"}
                </button>
              </div>
              <p className="text-sm opacity-70 mt-3">
                Drag & drop a file here (PDF / image / .txt) or click “Choose File”.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm opacity-80">Paste your document text</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={10}
                className="w-full border rounded px-3 py-2 bg-transparent"
                placeholder="Paste text here…"
              />
              <div className="text-xs opacity-60">
                {pastedCounts.words.toLocaleString()} words •{" "}
                {pastedCounts.chars.toLocaleString()} characters
              </div>
              <div className="mt-3">
                <button
                  onClick={onUpload}
                  disabled={loading || !plainText.trim()}
                  className="border rounded-lg px-3 py-2 hover:opacity-80 disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Extract Text"}
                </button>
              </div>
            </div>
          )}

          {err && (
            <div className="mt-3 text-red-400 bg-red-950/30 border border-red-700/40 p-3 rounded">
              {err}
            </div>
          )}
        </div>

        {/* --- Extracted text preview + analyze trigger --- */}
        {text && (
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-medium">Extracted Text</h2>
              <div className="ml-auto flex gap-2">
                <button onClick={copyToClipboard} className="border rounded px-3 py-1 hover:opacity-80">
                  Copy
                </button>
                <button onClick={downloadTxt} className="border rounded px-3 py-1 hover:opacity-80">
                  Download .txt
                </button>
                <button
                  onClick={analyzeText}
                  disabled={analyzing}
                  className="border rounded px-3 py-1 hover:opacity-80 disabled:opacity-50"
                >
                  {analyzing ? "Analyzing…" : "Analyze Clauses"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap bg-gray-100 text-black dark:bg-neutral-800 dark:text-neutral-100 p-4 rounded-lg max-h-[360px] overflow-auto">
              {text}
            </pre>
            <div className="mt-2 text-sm opacity-70">
              {extractedCounts.words.toLocaleString()} words •{" "}
              {extractedCounts.chars.toLocaleString()} characters
            </div>
          </section>
        )}

        {/* --- Phase 2 results with sorting & filtering --- */}
        {analysis && (
          <section className="mt-10">
            <div className="flex items-end gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Clause Analysis</h2>
                <p className="opacity-70 text-sm">
                  {visibleClauses.length} / {analysis.clauses.length} clauses • Avg risk{" "}
                  {analysis.avg_risk.toFixed(1)}
                </p>
              </div>

              <div className="ml-auto flex flex-wrap gap-3 items-end">
                {/* Sort */}
                <div className="flex flex-col">
                  <label className="text-xs opacity-70 mb-1">Sort</label>
                  <select
                    className="border rounded px-2 py-1 bg-white text-black dark:bg-neutral-900 dark:text-neutral-100"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                  >
                    <option value="original">Original order</option>
                    <option value="risk_desc">Risk: High → Low</option>
                    <option value="risk_asc">Risk: Low → High</option>
                  </select>
                </div>

                {/* Risk range */}
                <div className="flex flex-col">
                  <label className="text-xs opacity-70 mb-1">Risk min–max (1–10)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={minRisk}
                      onChange={(e) =>
                        setMinRisk(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
                      }
                      className="w-20 border rounded px-2 py-1 bg-transparent"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxRisk}
                      onChange={(e) =>
                        setMaxRisk(Math.max(1, Math.min(10, Number(e.target.value) || 10)))
                      }
                      className="w-20 border rounded px-2 py-1 bg-transparent"
                    />
                  </div>
                </div>

                <button onClick={resetFilters} className="border rounded px-3 py-1 hover:opacity-80">
                  Reset filters
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {visibleClauses.map((c) => (
                <div key={c.id} className="rounded border p-4 bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm font-semibold">Clause {c.id}</div>
                    <div className="ml-auto text-xs opacity-70">Risk {c.risk}/10</div>
                  </div>
                  <div className="text-sm opacity-90 line-clamp-4">{c.text}</div>
                  <div className="text-xs opacity-60 mt-2">
                    {c.tags && c.tags.length ? c.tags.join(", ") : "No tags"}
                  </div>
                </div>
              ))}
              {!visibleClauses.length && (
                <div className="text-sm opacity-70">No clauses match the current filters.</div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
