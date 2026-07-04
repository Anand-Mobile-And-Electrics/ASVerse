"use client";

import md5 from "md5";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { ExtraToolRenderer } from "@/features/tools/extra-tool-renderer";

type ToolRendererProps = {
  slug: string;
};

async function digest(algorithm: "SHA-1" | "SHA-256", value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function encodeBase64Utf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function decodeBase64Utf8(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function Result({ value }: { value: string }) {
  return <pre className="mt-3 overflow-auto rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-900">{value || "Result will appear here..."}</pre>;
}

function downloadBytes(bytes: Uint8Array, fileName: string, mime = "application/octet-stream") {
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function TextTool({ transform, placeholder }: { transform: (v: string) => string; placeholder: string }) {
  const [input, setInput] = useState("");
  const output = useMemo(() => transform(input), [input, transform]);

  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} />
      <Result value={output} />
    </div>
  );
}

function HashTool({ type }: { type: "sha1" | "sha256" | "md5" }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }
    if (type === "md5") {
      setOutput(md5(input));
      return;
    }
    digest(type === "sha1" ? "SHA-1" : "SHA-256", input)
      .then(setOutput)
      .catch(() => setOutput("Hashing failed"));
  }, [input, type]);

  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Enter text to hash..." value={input} onChange={(e) => setInput(e.target.value)} />
      <Result value={output} />
    </div>
  );
}

function UuidTool() {
  const [count, setCount] = useState(1);
  const [result, setResult] = useState("");

  function generate() {
    const list = Array.from({ length: count }, () => crypto.randomUUID());
    setResult(list.join("\n"));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">Count</label>
      <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="w-28 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      <button onClick={generate} className="ml-3 rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Generate</button>
      <Result value={result} />
    </div>
  );
}

function JwtDecoder() {
  const [token, setToken] = useState("");
  const output = useMemo(() => {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return "Provide a valid JWT token";
      const decode = (value: string) => JSON.parse(atob(value.replace(/-/g, "+").replace(/_/g, "/")));
      return JSON.stringify({ header: decode(parts[0]), payload: decode(parts[1]) }, null, 2);
    } catch {
      return "Invalid JWT";
    }
  }, [token]);

  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Paste JWT token..." value={token} onChange={(e) => setToken(e.target.value)} />
      <Result value={output} />
    </div>
  );
}

function TimestampTool() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

  const dateValue = useMemo(() => {
    const num = Number(timestamp);
    if (Number.isNaN(num)) return "Invalid timestamp";
    return new Date(num * 1000).toISOString();
  }, [timestamp]);

  const unixValue = useMemo(() => Math.floor(new Date(dateInput).getTime() / 1000).toString(), [dateInput]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm">Unix Timestamp</label>
        <input className="mt-1 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        <Result value={dateValue} />
      </div>
      <div>
        <label className="text-sm">Date Time</label>
        <input type="datetime-local" className="mt-1 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <Result value={unixValue} />
      </div>
    </div>
  );
}

function HttpHeaderParser() {
  const [raw, setRaw] = useState("");
  const parsed = useMemo(() => {
    const result: Record<string, string> = {};
    raw.split("\n").forEach((line) => {
      const index = line.indexOf(":");
      if (index > 0) result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    });
    return JSON.stringify(result, null, 2);
  }, [raw]);

  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Content-Type: application/json" value={raw} onChange={(e) => setRaw(e.target.value)} />
      <Result value={parsed} />
    </div>
  );
}

function RegexTesterTool() {
  const [pattern, setPattern] = useState("\\b[a-zA-Z]{4}\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Test this sample text with regex.");

  const output = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(text.matchAll(regex)).map((m) => `${m[0]} (index: ${m.index})`);
      return matches.length ? matches.join("\n") : "No matches";
    } catch {
      return "Invalid regex pattern or flags";
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-2">
      <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Pattern" />
      <input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Flags eg: gi" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Text" />
      <Result value={output} />
    </div>
  );
}

function TextDiffTool() {
  const [left, setLeft] = useState("Hello world");
  const [right, setRight] = useState("Hello world!");
  const output = useMemo(() => {
    const a = left.split("\n");
    const b = right.split("\n");
    const max = Math.max(a.length, b.length);
    const diff: string[] = [];
    for (let i = 0; i < max; i += 1) {
      if ((a[i] ?? "") !== (b[i] ?? "")) diff.push(`Line ${i + 1}:\n- ${a[i] ?? ""}\n+ ${b[i] ?? ""}`);
    }
    return diff.length ? diff.join("\n\n") : "No differences";
  }, [left, right]);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Original text" />
      <textarea value={right} onChange={(e) => setRight(e.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Updated text" />
      <div className="md:col-span-2">
        <Result value={output} />
      </div>
    </div>
  );
}

function LoremIpsumTool() {
  const [paragraphs, setParagraphs] = useState(3);
  const base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sodales, magna a feugiat aliquam, justo sapien vulputate libero, vitae mattis eros ipsum at urna.";
  const text = Array.from({ length: paragraphs }, () => base).join("\n\n");
  return (
    <div>
      <input type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="w-28 rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <Result value={text} />
    </div>
  );
}

function HtmlEntityEncoderTool() {
  return <TextTool placeholder="Enter text..." transform={(v) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c))} />;
}

function HtmlEntityDecoderTool() {
  return (
    <TextTool
      placeholder="Enter HTML entities..."
      transform={(v) =>
        v
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&")
      }
    />
  );
}

function HexRgbConverterTool() {
  const [hex, setHex] = useState("#2563eb");
  const [rgb, setRgb] = useState("37, 99, 235");

  const output = useMemo(() => {
    const clean = hex.replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      const r = Number.parseInt(clean.slice(0, 2), 16);
      const g = Number.parseInt(clean.slice(2, 4), 16);
      const b = Number.parseInt(clean.slice(4, 6), 16);
      return `HEX → RGB: ${r}, ${g}, ${b}`;
    }
    const parts = rgb.split(",").map((v) => Number(v.trim()));
    if (parts.length === 3 && parts.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) {
      return `RGB → HEX: #${parts.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
    }
    return "Enter valid HEX or RGB values.";
  }, [hex, rgb]);

  return (
    <div className="space-y-2">
      <input value={hex} onChange={(e) => setHex(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="#RRGGBB" />
      <input value={rgb} onChange={(e) => setRgb(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="R, G, B" />
      <Result value={output} />
    </div>
  );
}

function CgpaTool() {
  const [values, setValues] = useState("8.2,8.5,8.8");
  const result = useMemo(() => {
    const nums = values.split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
    if (!nums.length) return "0";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  }, [values]);

  return (
    <div>
      <textarea className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={values} onChange={(e) => setValues(e.target.value)} placeholder="Enter semester GPA values separated by commas" />
      <Result value={`CGPA: ${result}`} />
    </div>
  );
}

function GpaTool() {
  const [raw, setRaw] = useState("4,3\n3,4");
  const result = useMemo(() => {
    let totalCredits = 0;
    let weighted = 0;
    raw.split("\n").forEach((line) => {
      const [grade, credits] = line.split(",").map((v) => Number(v.trim()));
      if (!Number.isNaN(grade) && !Number.isNaN(credits)) {
        weighted += grade * credits;
        totalCredits += credits;
      }
    });
    if (!totalCredits) return "0";
    return (weighted / totalCredits).toFixed(2);
  }, [raw]);

  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Each row: gradePoint,credits" />
      <Result value={`GPA: ${result}`} />
    </div>
  );
}

function PercentageTool() {
  const [value, setValue] = useState("45");
  const [total, setTotal] = useState("60");
  const percentage = ((Number(value) / Math.max(Number(total), 1)) * 100).toFixed(2);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input className="rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Obtained value" />
      <input className="rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Total value" />
      <div className="sm:col-span-2">
        <Result value={`Percentage: ${percentage}%`} />
      </div>
    </div>
  );
}

function AttendanceTool() {
  const [attended, setAttended] = useState("30");
  const [classes, setClasses] = useState("40");
  const pct = ((Number(attended) / Math.max(Number(classes), 1)) * 100).toFixed(2);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input className="rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={attended} onChange={(e) => setAttended(e.target.value)} placeholder="Attended classes" />
      <input className="rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={classes} onChange={(e) => setClasses(e.target.value)} placeholder="Total classes" />
      <div className="sm:col-span-2">
        <Result value={`Attendance: ${pct}%`} />
      </div>
    </div>
  );
}

function AgeCalculatorTool() {
  const [dob, setDob] = useState("2000-01-01");
  const result = useMemo(() => {
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} years, ${months} months`;
  }, [dob]);

  return (
    <div>
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <Result value={result} />
    </div>
  );
}

function BmiCalculatorTool() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const bmi = useMemo(() => {
    const w = Number(weight);
    const h = Number(height) / 100;
    if (!w || !h) return "0";
    return (w / (h * h)).toFixed(2);
  }, [weight, height]);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Weight kg" />
      <input value={height} onChange={(e) => setHeight(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Height cm" />
      <div className="sm:col-span-2"><Result value={`BMI: ${bmi}`} /></div>
    </div>
  );
}

function StudyHoursPlannerTool() {
  const [subjects, setSubjects] = useState("Math\nScience\nEnglish");
  const [weeklyHours, setWeeklyHours] = useState("21");
  const output = useMemo(() => {
    const list = subjects.split("\n").map((s) => s.trim()).filter(Boolean);
    const total = Math.max(Number(weeklyHours) || 0, 0);
    if (!list.length || !total) return "Add subjects and hours.";
    const per = (total / list.length).toFixed(1);
    return list.map((s) => `${s}: ${per} hrs/week`).join("\n");
  }, [subjects, weeklyHours]);

  return (
    <div className="space-y-2">
      <textarea value={subjects} onChange={(e) => setSubjects(e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="One subject per line" />
      <input value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Total weekly study hours" />
      <Result value={output} />
    </div>
  );
}

function GradeToPercentageTool() {
  const [grade, setGrade] = useState("A");
  const map: Record<string, string> = { A: "85-100", B: "70-84", C: "55-69", D: "40-54", F: "0-39" };
  return <Result value={`Estimated percentage range: ${map[grade.toUpperCase()] || "Unknown grade"}`} />;
}

function WordCounter() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type text..." />
      <Result value={`Words: ${words}\nCharacters: ${chars}\nSentences: ${sentences}`} />
    </div>
  );
}

function CharacterCounter() {
  const [text, setText] = useState("");
  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type text..." />
      <Result value={`With spaces: ${text.length}\nWithout spaces: ${text.replace(/\s/g, "").length}`} />
    </div>
  );
}

function TextCaseConverter() {
  const [text, setText] = useState("");
  const title = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const sentence = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  return (
    <div>
      <textarea className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type text..." />
      <Result value={`UPPER\n${text.toUpperCase()}\n\nLOWER\n${text.toLowerCase()}\n\nTITLE\n${title}\n\nSENTENCE\n${sentence}`} />
    </div>
  );
}

function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <p className="text-4xl font-semibold">{mins}:{secs}</p>
      <div className="flex gap-2">
        <button onClick={() => setRunning(true)} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Start</button>
        <button onClick={() => setRunning(false)} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Pause</button>
        <button onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Reset</button>
      </div>
    </div>
  );
}

function QrCodeTool() {
  const [text, setText] = useState("https://asverse.example");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 280 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [text]);

  return (
    <div className="space-y-3">
      <input className="w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} />
      {dataUrl ? <img src={dataUrl} alt="Generated QR code" className="h-56 w-56 rounded-lg border border-slate-200 bg-white p-2" /> : null}
      {dataUrl ? <a href={dataUrl} download="qrcode.png" className="inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Download PNG</a> : null}
    </div>
  );
}

function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  function generate() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    const value = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPassword(value);
  }
  return (
    <div className="space-y-3">
      <input type="number" min={6} max={64} value={length} onChange={(e) => setLength(Math.max(6, Math.min(64, Number(e.target.value) || 16)))} className="w-28 rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <button onClick={generate} className="ml-2 rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Generate</button>
      <Result value={password} />
    </div>
  );
}

function RandomNumberGeneratorTool() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={min} onChange={(e) => setMin(e.target.value)} className="w-24 rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Min" />
        <input value={max} onChange={(e) => setMax(e.target.value)} className="w-24 rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Max" />
      </div>
      <button
        onClick={() => {
          const low = Number(min);
          const high = Number(max);
          if (Number.isNaN(low) || Number.isNaN(high) || low > high) {
            setResult("Invalid range");
            return;
          }
          setResult(String(Math.floor(Math.random() * (high - low + 1)) + low));
        }}
        className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900"
      >
        Generate
      </button>
      <Result value={result} />
    </div>
  );
}

function RandomPickerTool() {
  const [list, setList] = useState("Apple\nBanana\nMango");
  const [picked, setPicked] = useState("");
  return (
    <div className="space-y-3">
      <textarea value={list} onChange={(e) => setList(e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="One item per line" />
      <button
        onClick={() => {
          const items = list.split("\n").map((s) => s.trim()).filter(Boolean);
          setPicked(items.length ? items[Math.floor(Math.random() * items.length)] : "No items");
        }}
        className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900"
      >
        Pick Random Item
      </button>
      <Result value={picked} />
    </div>
  );
}

function ReadingTimeTool() {
  const [text, setText] = useState("");
  const result = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${words} words • ${minutes} min read`;
  }, [text]);
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-32 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Paste text" />
      <Result value={result} />
    </div>
  );
}

function PalindromeCheckerTool() {
  const [text, setText] = useState("");
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isPalindrome = normalized.length > 0 && normalized === normalized.split("").reverse().join("");
  return <Result value={text ? (isPalindrome ? "Palindrome ✅" : "Not a palindrome ❌") : "Enter text"} />;
}

function DuplicateLineRemoverTool() {
  return <TextTool placeholder="Paste lines..." transform={(v) => Array.from(new Set(v.split("\n"))).join("\n")} />;
}

function LineSorterTool() {
  return <TextTool placeholder="Paste lines..." transform={(v) => v.split("\n").sort((a, b) => a.localeCompare(b)).join("\n")} />;
}

async function imageToCanvas(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0);
  return { canvas, ctx };
}

function ImageTool({ mode }: { mode: "compress" | "resize" | "png-to-jpg" | "jpg-to-png" | "image-to-webp" }) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(800);
  const [resultUrl, setResultUrl] = useState("");

  async function processImage() {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ratio = bitmap.width / bitmap.height;
    const targetWidth = mode === "resize" ? width : bitmap.width;
    const targetHeight = Math.round(targetWidth / ratio);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const mime = mode === "jpg-to-png" ? "image/png" : mode === "image-to-webp" ? "image/webp" : "image/jpeg";

    const out = canvas.toDataURL(mime, quality / 100);
    setResultUrl(out);
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div>
        <label className="text-sm">Quality: {quality}%</label>
        <input type="range" min={30} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
      </div>
      {mode === "resize" ? (
        <div>
          <label className="text-sm">Width (px)</label>
          <input type="number" className="ml-2 w-28 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" value={width} onChange={(e) => setWidth(Number(e.target.value) || 800)} />
        </div>
      ) : null}
      <button onClick={processImage} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Process image</button>
      {resultUrl ? <img src={resultUrl} alt="Processed output" className="max-h-72 rounded-lg border border-slate-200" /> : null}
      {resultUrl ? <a href={resultUrl} download="processed-image" className="inline-block rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Download</a> : null}
    </div>
  );
}

function ImageRotateFlipTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  async function processImage() {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const rotated = rotation % 180 !== 0;
    const canvas = document.createElement("canvas");
    canvas.width = rotated ? bitmap.height : bitmap.width;
    canvas.height = rotated ? bitmap.width : bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    setResultUrl(canvas.toDataURL("image/png"));
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="flex flex-wrap gap-2">
        {[0, 90, 180, 270].map((deg) => (
          <button key={deg} onClick={() => setRotation(deg)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">{deg}°</button>
        ))}
      </div>
      <label className="mr-4 text-sm"><input type="checkbox" checked={flipX} onChange={(e) => setFlipX(e.target.checked)} className="mr-2" />Flip Horizontal</label>
      <label className="text-sm"><input type="checkbox" checked={flipY} onChange={(e) => setFlipY(e.target.checked)} className="mr-2" />Flip Vertical</label>
      <div>
        <button onClick={processImage} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Apply Transform</button>
      </div>
      {resultUrl ? <img src={resultUrl} alt="Transformed image" className="max-h-72 rounded-lg border border-slate-200" /> : null}
      {resultUrl ? <a href={resultUrl} download="transformed-image.png" className="inline-block rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Download</a> : null}
    </div>
  );
}

function ImageToBase64Tool() {
  const [output, setOutput] = useState("");

  function onFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOutput(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <textarea className="min-h-40 w-full rounded-xl border border-slate-300 p-3 text-xs dark:border-slate-700 dark:bg-slate-900" value={output} readOnly />
    </div>
  );
}

function Base64ToImageTool() {
  const [input, setInput] = useState("");

  return (
    <div className="space-y-3">
      <textarea className="min-h-40 w-full rounded-xl border border-slate-300 p-3 text-xs dark:border-slate-700 dark:bg-slate-900" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste base64 data URL here..." />
      {input.startsWith("data:image") ? <img src={input} alt="Decoded output" className="max-h-72 rounded-lg border border-slate-200" /> : null}
      {input.startsWith("data:image") ? <a href={input} download="decoded-image" className="inline-block rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Download</a> : null}
    </div>
  );
}

function GrayscaleImageTool() {
  const [resultUrl, setResultUrl] = useState("");
  async function onFile(file: File | null) {
    if (!file) return;
    const { canvas, ctx } = await imageToCanvas(file);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      imageData.data[i] = avg;
      imageData.data[i + 1] = avg;
      imageData.data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    setResultUrl(canvas.toDataURL("image/png"));
  }
  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {resultUrl ? <img src={resultUrl} alt="Grayscale image" className="max-h-72 rounded-lg border border-slate-200" /> : null}
      {resultUrl ? <a href={resultUrl} download="grayscale.png" className="inline-block rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Download</a> : null}
    </div>
  );
}

function BlurImageTool() {
  const [resultUrl, setResultUrl] = useState("");
  const [blur, setBlur] = useState(3);
  const [file, setFile] = useState<File | null>(null);

  async function process() {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(bitmap, 0, 0);
    setResultUrl(canvas.toDataURL("image/png"));
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <label className="text-sm">Blur: {blur}px</label>
      <input type="range" min={1} max={20} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full" />
      <button onClick={process} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Apply Blur</button>
      {resultUrl ? <img src={resultUrl} alt="Blur image" className="max-h-72 rounded-lg border border-slate-200" /> : null}
      {resultUrl ? <a href={resultUrl} download="blur.png" className="inline-block rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">Download</a> : null}
    </div>
  );
}

function DominantColorExtractorTool() {
  const [result, setResult] = useState("");
  async function onFile(file: File | null) {
    if (!file) return;
    const { canvas, ctx } = await imageToCanvas(file);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < imageData.length; i += 40) {
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count += 1;
    }
    const rr = Math.round(r / count);
    const gg = Math.round(g / count);
    const bb = Math.round(b / count);
    const hex = `#${[rr, gg, bb].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
    setResult(`Dominant Color\nRGB: ${rr}, ${gg}, ${bb}\nHEX: ${hex}`);
  }
  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Result value={result} />
    </div>
  );
}

function PdfPageCounterTool() {
  const [result, setResult] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      setResult(`Pages: ${pdf.getPageCount()}`);
    } catch {
      setResult("Unable to read PDF");
    }
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Result value={result} />
    </div>
  );
}

function PdfMetadataViewerTool() {
  const [result, setResult] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      const meta = {
        title: pdf.getTitle() || "",
        author: pdf.getAuthor() || "",
        subject: pdf.getSubject() || "",
        creator: pdf.getCreator() || "",
        producer: pdf.getProducer() || "",
        keywords: pdf.getKeywords() || "",
        creationDate: pdf.getCreationDate()?.toISOString() || "",
        modificationDate: pdf.getModificationDate()?.toISOString() || "",
        pages: pdf.getPageCount(),
      };
      setResult(JSON.stringify(meta, null, 2));
    } catch {
      setResult("Unable to read PDF metadata");
    }
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Result value={result} />
    </div>
  );
}

function PdfMergerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");

  async function merge() {
    if (!files.length) return;
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const out = await merged.save();
      downloadBytes(out, "merged.pdf", "application/pdf");
      setStatus("Merged PDF downloaded ✅");
    } catch {
      setStatus("Failed to merge PDFs");
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="application/pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      <button onClick={merge} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Merge PDFs</button>
      <Result value={status || `${files.length} file(s) selected`} />
    </div>
  );
}

function PdfSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [status, setStatus] = useState("");

  async function splitRange() {
    if (!file) return;
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const total = src.getPageCount();
      const start = Math.max(1, Math.min(total, Number(startPage) || 1));
      const end = Math.max(start, Math.min(total, Number(endPage) || start));

      const out = await PDFDocument.create();
      const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
      const pages = await out.copyPages(src, indices);
      pages.forEach((page) => out.addPage(page));

      downloadBytes(await out.save(), `split-${start}-${end}.pdf`, "application/pdf");
      setStatus(`Downloaded pages ${start}-${end} ✅`);
    } catch {
      setStatus("Failed to split PDF");
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="flex gap-2">
        <input className="w-28 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" value={startPage} onChange={(e) => setStartPage(e.target.value)} placeholder="Start" />
        <input className="w-28 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" value={endPage} onChange={(e) => setEndPage(e.target.value)} placeholder="End" />
      </div>
      <button onClick={splitRange} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Split PDF</button>
      <Result value={status} />
    </div>
  );
}

function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");

  async function convert() {
    if (!files.length) return;
    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const isPng = file.type.includes("png");
        const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const { width, height } = image.scale(1);
        const page = pdf.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      downloadBytes(await pdf.save(), "images-to-pdf.pdf", "application/pdf");
      setStatus("PDF downloaded ✅");
    } catch {
      setStatus("Failed to convert images to PDF. Use JPG/PNG files only.");
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/png,image/jpeg" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      <button onClick={convert} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Create PDF</button>
      <Result value={status || `${files.length} image(s) selected`} />
    </div>
  );
}

function TextToPdfTool() {
  const [text, setText] = useState("Type your text here...");
  const [status, setStatus] = useState("");

  async function createPdf() {
    try {
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const lines = text.split("\n");
      let y = 800;
      lines.forEach((line) => {
        page.drawText(line.slice(0, 95), { x: 40, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
        y -= 16;
      });
      downloadBytes(await pdf.save(), "text-to-pdf.pdf", "application/pdf");
      setStatus("PDF downloaded ✅");
    } catch {
      setStatus("Failed to generate PDF");
    }
  }

  return (
    <div className="space-y-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-36 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900" />
      <button onClick={createPdf} className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900">Generate PDF</button>
      <Result value={status} />
    </div>
  );
}

function PdfRotatePagesTool() {
  const [status, setStatus] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      pdf.getPages().forEach((page) => {
        page.setRotation(degrees(90));
      });
      downloadBytes(await pdf.save(), "rotated.pdf", "application/pdf");
      setStatus("Rotated PDF downloaded ✅");
    } catch {
      setStatus("Failed to rotate PDF");
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Result value={status} />
    </div>
  );
}

function PdfAddPageNumbersTool() {
  const [status, setStatus] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      pages.forEach((page, idx) => {
        page.drawText(`Page ${idx + 1} of ${pages.length}`, {
          x: page.getWidth() - 140,
          y: 20,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
      downloadBytes(await pdf.save(), "numbered.pdf", "application/pdf");
      setStatus("Page-numbered PDF downloaded ✅");
    } catch {
      setStatus("Failed to add page numbers");
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Result value={status} />
    </div>
  );
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  switch (slug) {
    case "json-formatter":
      return <TextTool placeholder="Paste JSON..." transform={(v) => { try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return "Invalid JSON"; } }} />;
    case "json-validator":
      return <TextTool placeholder="Paste JSON..." transform={(v) => { try { JSON.parse(v); return "Valid JSON ✅"; } catch { return "Invalid JSON ❌"; } }} />;
    case "uuid-generator":
      return <UuidTool />;
    case "base64-encoder":
      return <TextTool placeholder="Enter text..." transform={(v) => encodeBase64Utf8(v || "")} />;
    case "base64-decoder":
      return <TextTool placeholder="Enter Base64..." transform={(v) => { try { return decodeBase64Utf8(v); } catch { return "Invalid Base64"; } }} />;
    case "jwt-decoder":
      return <JwtDecoder />;
    case "sha256-generator":
      return <HashTool type="sha256" />;
    case "sha1-generator":
      return <HashTool type="sha1" />;
    case "md5-generator":
      return <HashTool type="md5" />;
    case "url-encoder":
      return <TextTool placeholder="Enter URL text..." transform={(v) => encodeURIComponent(v)} />;
    case "url-decoder":
      return <TextTool placeholder="Enter encoded text..." transform={(v) => { try { return decodeURIComponent(v); } catch { return "Invalid encoded URL"; } }} />;
    case "unix-timestamp-converter":
      return <TimestampTool />;
    case "http-header-parser":
      return <HttpHeaderParser />;
    case "regex-tester":
      return <RegexTesterTool />;
    case "text-diff-checker":
      return <TextDiffTool />;
    case "lorem-ipsum-generator":
      return <LoremIpsumTool />;
    case "html-entity-encoder":
      return <HtmlEntityEncoderTool />;
    case "html-entity-decoder":
      return <HtmlEntityDecoderTool />;
    case "hex-rgb-converter":
      return <HexRgbConverterTool />;

    case "cgpa-calculator":
      return <CgpaTool />;
    case "gpa-calculator":
      return <GpaTool />;
    case "percentage-calculator":
      return <PercentageTool />;
    case "attendance-calculator":
      return <AttendanceTool />;
    case "age-calculator":
      return <AgeCalculatorTool />;
    case "bmi-calculator":
      return <BmiCalculatorTool />;
    case "study-hours-planner":
      return <StudyHoursPlannerTool />;
    case "grade-to-percentage":
      return <GradeToPercentageTool />;

    case "qr-code-generator":
      return <QrCodeTool />;
    case "word-counter":
      return <WordCounter />;
    case "character-counter":
      return <CharacterCounter />;
    case "text-case-converter":
      return <TextCaseConverter />;
    case "pomodoro-timer":
      return <PomodoroTimer />;
    case "password-generator":
      return <PasswordGeneratorTool />;
    case "random-number-generator":
      return <RandomNumberGeneratorTool />;
    case "random-picker":
      return <RandomPickerTool />;
    case "reading-time-calculator":
      return <ReadingTimeTool />;
    case "palindrome-checker":
      return <PalindromeCheckerTool />;
    case "duplicate-line-remover":
      return <DuplicateLineRemoverTool />;
    case "line-sorter":
      return <LineSorterTool />;

    case "image-compressor":
      return <ImageTool mode="compress" />;
    case "image-resizer":
      return <ImageTool mode="resize" />;
    case "png-to-jpg":
      return <ImageTool mode="png-to-jpg" />;
    case "jpg-to-png":
      return <ImageTool mode="jpg-to-png" />;
    case "image-to-webp":
      return <ImageTool mode="image-to-webp" />;
    case "image-rotate-flip":
      return <ImageRotateFlipTool />;
    case "image-to-base64":
      return <ImageToBase64Tool />;
    case "base64-to-image":
      return <Base64ToImageTool />;
    case "grayscale-image":
      return <GrayscaleImageTool />;
    case "blur-image":
      return <BlurImageTool />;
    case "dominant-color-extractor":
      return <DominantColorExtractorTool />;

    case "pdf-page-counter":
      return <PdfPageCounterTool />;
    case "pdf-merger":
      return <PdfMergerTool />;
    case "pdf-splitter":
      return <PdfSplitterTool />;
    case "pdf-metadata-viewer":
      return <PdfMetadataViewerTool />;
    case "images-to-pdf":
      return <ImagesToPdfTool />;
    case "text-to-pdf":
      return <TextToPdfTool />;
    case "pdf-rotate-pages":
      return <PdfRotatePagesTool />;
    case "pdf-add-page-numbers":
      return <PdfAddPageNumbersTool />;

    default:
      return <ExtraToolRenderer slug={slug} />;
  }
}
