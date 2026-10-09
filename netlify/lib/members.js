/**
 * Member accounts for applicants who create a login.
 * Storage: Netlify Blobs when available, in-memory fallback for local tests.
 */
const crypto = require("crypto");

const SITE_ID = "cff4add9-a4a0-45b6-ac63-b4298b54f64f";
const FORM_NAME = "apply";
const COOKIE = "hpc_member";
const SESSION_DAYS = 30;

/** @type {Map<string, string>} */
const memory = new Map();

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign(
      {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      extraHeaders || {}
    ),
    body: JSON.stringify(body),
  };
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
    .slice(0, 160);
}

function memberKey(email) {
  return "member:" + normalizeEmail(email);
}

async function getStore() {
  try {
    const blobs = require("@netlify/blobs");
    if (blobs && typeof blobs.getStore === "function") {
      return blobs.getStore("hpc-members");
    }
  } catch (err) {
    /* local / missing package */
  }
  return {
    get: async function (key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    set: async function (key, value) {
      memory.set(key, value);
    },
    delete: async function (key) {
      memory.delete(key);
    },
  };
}

async function readJson(key, fallback) {
  const store = await getStore();
  const raw = await store.get(key);
  if (!raw) return fallback;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    return fallback;
  }
}

async function writeJson(key, value) {
  const store = await getStore();
  await store.set(key, JSON.stringify(value));
}

function jwtSecret() {
  return process.env.MEMBER_JWT_SECRET || process.env.OPS_PASSWORD || "";
}

function hashPassword(password, salt) {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), usedSalt, 64).toString("hex");
  return { salt: usedSalt, hash: hash };
}

function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  const next = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(next, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signToken(payload) {
  const secret = jwtSecret();
  if (!secret) throw new Error("MEMBER_JWT_SECRET not configured");
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const secret = jwtSecret();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const body = parts[0];
  const sig = parts[1];
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

function sessionCookie(token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const parts = [
    COOKIE + "=" + token,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=" + maxAge,
  ];
  if (process.env.CONTEXT === "production" || process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function clearCookie() {
  return COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

function parseCookies(header) {
  const out = Object.create(null);
  if (!header) return out;
  String(header)
    .split(";")
    .forEach(function (part) {
      const idx = part.indexOf("=");
      if (idx < 0) return;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      out[key] = decodeURIComponent(value);
    });
  return out;
}

function publicMember(member) {
  if (!member) return null;
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    status: member.status,
    createdAt: member.createdAt,
    streak: member.streak || { done: [] },
  };
}

async function getMember(email) {
  return readJson(memberKey(email), null);
}

async function saveMember(member) {
  await writeJson(memberKey(member.email), member);
  return member;
}

async function getStages() {
  return readJson("ops:stages", {});
}

async function saveStages(stages) {
  await writeJson("ops:stages", stages && typeof stages === "object" ? stages : {});
}

async function findApplicationByEmail(email) {
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  if (!token) return null;
  const wanted = normalizeEmail(email);
  try {
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!formsRes.ok) return null;
    const forms = await formsRes.json();
    const form = (forms || []).find(function (f) {
      return f.name === FORM_NAME;
    }) || (forms && forms[0]);
    if (!form) return null;
    const subRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!subRes.ok) return null;
    const submissions = await subRes.json();
    const match = (submissions || []).find(function (s) {
      const addr = normalizeEmail((s.data && s.data.email) || s.email || "");
      return addr === wanted;
    });
    if (!match) return null;
    return {
      id: match.id,
      name: (match.data && match.data.name) || match.name || "",
      email: wanted,
      lane: (match.data && match.data.lane) || "",
      why: (match.data && match.data.why) || "",
      createdAt: match.created_at,
    };
  } catch (err) {
    return null;
  }
}

async function applicationAccepted(applicationId, email) {
  const stages = await getStages();
  if (applicationId && stages[applicationId] === "accepted") return true;
  if (!email) return false;
  // Also accept if any stage key is accepted and we only have email — ops stores by application id.
  return false;
}

async function activateMembersForAccepted(stages) {
  const map = stages && typeof stages === "object" ? stages : {};
  const acceptedIds = Object.keys(map).filter(function (id) {
    return map[id] === "accepted";
  });
  if (!acceptedIds.length) return { activated: 0 };

  const token = process.env.NETLIFY_ACCESS_TOKEN;
  if (!token) return { activated: 0 };

  let activated = 0;
  try {
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!formsRes.ok) return { activated: 0 };
    const forms = await formsRes.json();
    const form = (forms || []).find(function (f) {
      return f.name === FORM_NAME;
    }) || (forms && forms[0]);
    if (!form) return { activated: 0 };
    const subRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!subRes.ok) return { activated: 0 };
    const submissions = await subRes.json();
    for (const s of submissions || []) {
      if (!acceptedIds.includes(s.id)) continue;
      const email = normalizeEmail((s.data && s.data.email) || s.email || "");
      if (!email) continue;
      const member = await getMember(email);
      if (!member) continue;
      if (member.status !== "active") {
        member.status = "active";
        member.applicationId = s.id;
        member.activatedAt = new Date().toISOString();
        await saveMember(member);
        activated += 1;
      }
    }
  } catch (err) {
    return { activated: activated };
  }
  return { activated: activated };
}

function createSession(member) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = signToken({
    sub: member.id,
    email: member.email,
    name: member.name,
    status: member.status,
    exp: exp,
  });
  return { token: token, cookie: sessionCookie(token), exp: exp };
}

function memberFromEvent(event) {
  const headers = event.headers || {};
  const cookieHeader = headers.cookie || headers.Cookie || "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE];
  return verifyToken(token);
}

exports.COOKIE = COOKIE;
exports.json = json;
exports.normalizeEmail = normalizeEmail;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.publicMember = publicMember;
exports.getMember = getMember;
exports.saveMember = saveMember;
exports.getStages = getStages;
exports.saveStages = saveStages;
exports.findApplicationByEmail = findApplicationByEmail;
exports.applicationAccepted = applicationAccepted;
exports.activateMembersForAccepted = activateMembersForAccepted;
exports.createSession = createSession;
exports.memberFromEvent = memberFromEvent;
exports.clearCookie = clearCookie;
exports.jwtSecret = jwtSecret;
exports._memory = memory;
exports._test = {
  signToken: signToken,
  verifyToken: verifyToken,
  hashPassword: hashPassword,
  verifyPassword: verifyPassword,
  normalizeEmail: normalizeEmail,
};
