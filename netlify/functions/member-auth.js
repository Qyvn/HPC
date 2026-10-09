const {
  json,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  publicMember,
  getMember,
  saveMember,
  findApplicationByEmail,
  getStages,
  createSession,
  memberFromEvent,
  clearCookie,
  jwtSecret,
} = require("../lib/members");

function method(event) {
  return (event.httpMethod || "GET").toUpperCase();
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (err) {
    return null;
  }
}

function actionOf(event, body) {
  const fromQuery = event.queryStringParameters && event.queryStringParameters.action;
  if (fromQuery) return String(fromQuery);
  if (body && body.action) return String(body.action);
  if (method(event) === "GET") return "me";
  return "";
}

async function register(body) {
  if (!jwtSecret()) {
    return json(500, { error: "Member auth not configured (MEMBER_JWT_SECRET)" });
  }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";

  if (!email || !email.includes("@")) return json(400, { error: "Valid email required" });
  if (password.length < 8) return json(400, { error: "Password must be at least 8 characters" });
  if (!name) return json(400, { error: "Name required" });

  const existing = await getMember(email);
  if (existing) return json(409, { error: "Account already exists. Log in instead." });

  const application = await findApplicationByEmail(email);
  if (!application) {
    return json(403, {
      error: "No application found for this email. Apply on the site first, then create your login.",
    });
  }

  const stages = await getStages();
  const accepted = stages[application.id] === "accepted";
  const hashed = hashPassword(password);

  const member = {
    id: "m_" + application.id,
    email: email,
    name: name || application.name || "Member",
    passwordHash: hashed.hash,
    passwordSalt: hashed.salt,
    status: accepted ? "active" : "pending",
    applicationId: application.id,
    createdAt: new Date().toISOString(),
    streak: { done: [] },
  };
  await saveMember(member);

  if (member.status !== "active") {
    return json(201, {
      member: publicMember(member),
      message: "Account created. Login unlocks when your application is accepted.",
    });
  }

  const session = createSession(member);
  return json(
    201,
    { member: publicMember(member), message: "Account created." },
    { "Set-Cookie": session.cookie }
  );
}

async function login(body) {
  if (!jwtSecret()) {
    return json(500, { error: "Member auth not configured (MEMBER_JWT_SECRET)" });
  }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return json(400, { error: "Email and password required" });

  const member = await getMember(email);
  if (!member || !verifyPassword(password, member.passwordSalt, member.passwordHash)) {
    return json(401, { error: "Invalid email or password" });
  }

  // Refresh acceptance in case ops just moved them.
  if (member.status !== "active" && member.applicationId) {
    const stages = await getStages();
    if (stages[member.applicationId] === "accepted") {
      member.status = "active";
      member.activatedAt = new Date().toISOString();
      await saveMember(member);
    }
  }

  if (member.status === "pending") {
    return json(403, {
      error: "Application still under review. Login unlocks when you are accepted.",
      status: "pending",
    });
  }
  if (member.status !== "active") {
    return json(403, { error: "Account is not active." });
  }

  const session = createSession(member);
  return json(200, { member: publicMember(member) }, { "Set-Cookie": session.cookie });
}

async function me(event) {
  const session = memberFromEvent(event);
  if (!session) return json(401, { error: "Not signed in" });
  const member = await getMember(session.email);
  if (!member || member.status !== "active") {
    return json(401, { error: "Not signed in" }, { "Set-Cookie": clearCookie() });
  }
  return json(200, { member: publicMember(member) });
}

async function logout() {
  return json(200, { ok: true }, { "Set-Cookie": clearCookie() });
}

async function sync(event, body) {
  const session = memberFromEvent(event);
  if (!session) return json(401, { error: "Not signed in" });
  const member = await getMember(session.email);
  if (!member || member.status !== "active") return json(401, { error: "Not signed in" });

  const done = Array.isArray(body.done)
    ? body.done.filter(function (d) {
        return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
      })
    : null;
  if (done) {
    const merged = new Set([].concat((member.streak && member.streak.done) || [], done));
    member.streak = Object.assign({}, member.streak || {}, {
      done: Array.from(merged).sort(),
      updatedAt: new Date().toISOString(),
    });
    await saveMember(member);
  }
  return json(200, { member: publicMember(member) });
}

exports.handler = async function (event) {
  if (method(event) === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
      body: "",
    };
  }

  const body = method(event) === "GET" ? {} : parseBody(event);
  if (body === null) return json(400, { error: "Invalid JSON" });
  const action = actionOf(event, body);

  try {
    if (action === "register" && method(event) === "POST") return register(body);
    if (action === "login" && method(event) === "POST") return login(body);
    if (action === "logout" && method(event) === "POST") return logout();
    if (action === "sync" && method(event) === "POST") return sync(event, body);
    if (action === "me" && method(event) === "GET") return me(event);
    return json(400, { error: "Unknown action" });
  } catch (err) {
    return json(500, {
      error: "Auth failed",
      detail: String(err && err.message ? err.message : err).slice(0, 160),
    });
  }
};
