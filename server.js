const express = require("express");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static(__dirname));

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const codeStore = new Map();
const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function cleanExpiredCodes() {
  const now = Date.now();
  for (const [email, entry] of codeStore.entries()) {
    if (now > entry.expiresAt) codeStore.delete(email);
  }
}

app.post("/api/send-code", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email_required" });
  if (!resend) return res.status(500).json({ error: "resend_key_missing" });

  cleanExpiredCodes();
  const code = generateCode();
  codeStore.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS });

  try {
    await resend.emails.send({
      from: "Atlas Finance <onboarding@resend.dev>",
      to: email,
      subject: "Seu codigo de verificacao",
      html: `<p>Seu codigo de verificacao e: <strong>${code}</strong></p><p>Ele expira em 10 minutos.</p>`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Resend error", err);
    res.status(500).json({ error: "send_failed" });
  }
});

app.post("/api/verify-code", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();
  if (!email || !code) return res.status(400).json({ error: "missing_fields" });
  cleanExpiredCodes();
  const entry = codeStore.get(email);
  if (!entry || entry.code !== code) return res.status(400).json({ error: "invalid_code" });
  codeStore.delete(email);
  res.json({ ok: true });
});

app.get("/api/quote", async (req, res) => {
  const tickers = String(req.query.tickers || "").trim();
  const token = String(req.query.token || process.env.BRAPI_TOKEN || "").trim();

  if (!tickers) {
    return res.status(400).json({ error: "tickers_required" });
  }
  if (!token) {
    return res.status(400).json({ error: "token_required" });
  }

  const tickersPath = tickers
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map(encodeURIComponent)
    .join(",");
  const url = `https://brapi.dev/api/quote/${tickersPath}?token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "invalid_json", raw: text.slice(0, 500) };
    }
    if (!response.ok) {
      console.error("BRAPI error", response.status, data);
    }
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error("BRAPI fetch failed", err);
    res.status(500).json({ error: "fetch_failed", detail: String(err) });
  }
});

app.get("/api/dividends", async (req, res) => {
  const tickers = String(req.query.tickers || "").trim();
  const token = String(req.query.token || process.env.BRAPI_TOKEN || "").trim();

  if (!tickers) return res.status(400).json({ error: "tickers_required" });
  if (!token) return res.status(400).json({ error: "token_required" });

  const tickersPath = tickers
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map(encodeURIComponent)
    .join(",");
  const url = `https://brapi.dev/api/quote/${tickersPath}?dividends=true&token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "invalid_json", raw: text.slice(0, 500) };
    }
    if (!response.ok) {
      console.error("BRAPI dividends error", response.status, data);
    }
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error("BRAPI dividends fetch failed", err);
    res.status(500).json({ error: "fetch_failed", detail: String(err) });
  }
});

app.get("/api/history", async (req, res) => {
  const ticker = String(req.query.ticker || "").trim();
  const token = String(req.query.token || process.env.BRAPI_TOKEN || "").trim();
  const range = String(req.query.range || "1y").trim();
  const interval = String(req.query.interval || "1d").trim();

  if (!ticker) return res.status(400).json({ error: "ticker_required" });
  if (!token) return res.status(400).json({ error: "token_required" });

  const url = `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "invalid_json", raw: text.slice(0, 500) };
    }
    if (!response.ok) {
      console.error("BRAPI history error", response.status, data);
    }
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error("BRAPI history fetch failed", err);
    res.status(500).json({ error: "fetch_failed", detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Atlas Finance server running on http://localhost:${PORT}`);
});
