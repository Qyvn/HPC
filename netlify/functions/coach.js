/**
 * HPC coach — short check-in replies for /today.
 * Env: OPENAI_API_KEY or ANTHROPIC_API_KEY (one required).
 * Optional: COACH_MODEL, COACH_RATE_LIMIT (default 20/day per device).
 * Does not store personal data; rate buckets live only in this process.
 */

const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RATE_LIMIT = 20;
const MAX_MESSAGE = 400;
const MAX_REPLY = 420;

const SYSTEM_PROMPT = `You are the High Performers Club coach on /today.

Voice: direct, no excuses, Can't Hurt Me and Mamba Mentality standards. Short. Precise. Never soft-pedal a miss. Never cheerlead empty wins. Raise the standard.

Founder standards:
- Performance is not a mood. It's a system you live.
- We train operators, not audiences. The standard is the filter.
- 05:00 discipline: the day starts before the world makes demands.

Six rooms (reference only when useful): Content, Mastermind, Events, Coaching, Network, Challenges.

Rules:
- Reply in 1–3 short sentences. Hard cap ~60 words.
- No medical, injury, nutrition, or mental-health advice. If asked, say see a professional and steer back to the day's work.
- No therapy tone, no corporate fluff, no emojis.
- Use only the facts given (streak, yesterday, today's challenge, member note). Do not invent personal history.
- Modes:
  - greeting: open with streak, yesterday's result, and today's challenge. If yesterday was a miss, call it out and hand a concrete comeback task (one action, ≤15 min).
  - report: respond to the member's check-in note against today's challenge. Affirm honest work; cut excuses.
  - adaptive: when today's challenge is done or missed, set tomorrow's push — harder after a streak (≥3), a reset/comeback after a miss. End with one clear task line starting with "Tomorrow:".
`;

/** @type {Map<string, { count: number, resetAt: number }>} */
const rateBuckets = new Map();

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function clampText(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function rateLimit() {
  const raw = Number(process.env.COACH_RATE_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_RATE_LIMIT;
}

function checkRate(deviceId) {
  const id = clampText(deviceId, 64) || "anon";
  const now = Date.now();
  let bucket = rateBuckets.get(id);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateBuckets.set(id, bucket);
  }
  if (bucket.count >= rateLimit()) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, rateLimit() - bucket.count),
    resetAt: bucket.resetAt,
  };
}

function buildUserPayload(body) {
  const mode = ["greeting", "report", "adaptive"].includes(body.mode) ? body.mode : "report";
  const streak = Number.isFinite(Number(body.streak)) ? Math.max(0, Math.floor(Number(body.streak))) : 0;
  const yesterday = clampText(body.yesterday, 80) || "unknown";
  const todayDone = body.todayDone === true;
  const challengeTitle = clampText(body.challengeTitle, 120);
  const challenge = clampText(body.challenge, 400);
  const message = clampText(body.message, MAX_MESSAGE);
  const mustDos = Array.isArray(body.mustDos)
    ? body.mustDos
        .slice(0, 3)
        .map(function (item) {
          if (!item || typeof item !== "object") return null;
          const text = clampText(item.text, 140);
          if (!text) return null;
          return { text: text, done: item.done === true };
        })
        .filter(Boolean)
    : [];

  return {
    mode: mode,
    streak: streak,
    yesterday: yesterday,
    todayDone: todayDone,
    challengeTitle: challengeTitle,
    challenge: challenge,
    message: message,
    mustDos: mustDos,
  };
}

async function callOpenAI(userText) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.COACH_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.55,
      max_tokens: 180,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(function () {
      return "";
    });
    throw new Error("openai " + res.status + " " + detail.slice(0, 200));
  }
  const data = await res.json();
  const reply = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : "";
  return clampText(String(reply || ""), MAX_REPLY);
}

async function callAnthropic(userText) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.COACH_MODEL || "claude-3-5-haiku-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 180,
      temperature: 0.55,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(function () {
      return "";
    });
    throw new Error("anthropic " + res.status + " " + detail.slice(0, 200));
  }
  const data = await res.json();
  const block = data && Array.isArray(data.content) ? data.content.find(function (part) {
    return part && part.type === "text";
  }) : null;
  return clampText(String((block && block.text) || ""), MAX_REPLY);
}

function fallbackReply(payload) {
  if (payload.mode === "greeting") {
    if (payload.yesterday === "missed") {
      return (
        "Streak broken at " +
        payload.streak +
        ". Call it. Comeback: finish today's challenge before noon, no negotiation. " +
        (payload.challengeTitle ? "Today: " + payload.challengeTitle + "." : "")
      ).slice(0, MAX_REPLY);
    }
    return (
      "Streak " +
      payload.streak +
      ". Yesterday held. Today's challenge is on the board" +
      (payload.challengeTitle ? " — " + payload.challengeTitle : "") +
      ". Do it."
    ).slice(0, MAX_REPLY);
  }
  if (payload.mode === "adaptive") {
    if (payload.yesterday === "missed" || !payload.todayDone) {
      return "Miss noted. Tomorrow: one 10-minute reset on the same standard. No new goals until that lands.";
    }
    if (payload.streak >= 3) {
      return "Streak intact. Tomorrow: same work, 10 more minutes or one harder rep. Raise it.";
    }
    return "Logged. Tomorrow: protect the same window and finish clean.";
  }
  if (payload.message) {
    return "Heard. Own what you did, fix what you skipped, finish today's challenge.";
  }
  return "Report what you did. Short. Honest.";
}

async function generateReply(payload) {
  const userText = JSON.stringify(payload);
  if (process.env.OPENAI_API_KEY) return callOpenAI(userText);
  if (process.env.ANTHROPIC_API_KEY) return callAnthropic(userText);
  return fallbackReply(payload);
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return json(400, { error: "Invalid JSON" });
  }

  const rate = checkRate(body && body.deviceId);
  if (!rate.ok) {
    return json(429, {
      error: "Rate limit. Come back tomorrow.",
      remaining: 0,
      resetAt: rate.resetAt,
    });
  }

  const payload = buildUserPayload(body || {});
  if (payload.mode === "report" && !payload.message) {
    return json(400, { error: "Message required" });
  }

  try {
    const reply = (await generateReply(payload)) || fallbackReply(payload);
    return json(200, {
      reply: reply,
      remaining: rate.remaining,
      mode: payload.mode,
    });
  } catch (err) {
    return json(502, {
      error: "Coach unavailable",
      detail: String(err && err.message ? err.message : err).slice(0, 160),
      reply: fallbackReply(payload),
      remaining: rate.remaining,
      mode: payload.mode,
    });
  }
};

exports._test = {
  SYSTEM_PROMPT: SYSTEM_PROMPT,
  buildUserPayload: buildUserPayload,
  fallbackReply: fallbackReply,
  checkRate: checkRate,
  rateBuckets: rateBuckets,
  clampText: clampText,
};
