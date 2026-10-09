const {
  json,
  getStages,
  saveStages,
  activateMembersForAccepted,
} = require("../lib/members");

function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="HPC Ops"',
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: "Unauthorized" }),
  };
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch (err) {
    return null;
  }
}

function requireOps(event) {
  const password = process.env.OPS_PASSWORD;
  if (!password) return { ok: false, res: json(500, { error: "Ops not configured" }) };
  const auth = parseBasicAuth(event.headers.authorization || event.headers.Authorization);
  if (!auth || auth.pass !== password) return { ok: false, res: unauthorized() };
  return { ok: true };
}

exports.handler = async function (event) {
  const gate = requireOps(event);
  if (!gate.ok) return gate.res;

  const method = (event.httpMethod || "GET").toUpperCase();

  if (method === "GET") {
    const stages = await getStages();
    return json(200, { stages: stages });
  }

  if (method === "PUT" || method === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (err) {
      return json(400, { error: "Invalid JSON" });
    }
    const stages = body.stages && typeof body.stages === "object" ? body.stages : null;
    if (!stages) return json(400, { error: "stages object required" });

    const clean = {};
    Object.keys(stages).forEach(function (id) {
      const value = stages[id];
      if (["applied", "reviewing", "accepted", "declined"].includes(value)) {
        clean[id] = value;
      }
    });

    await saveStages(clean);
    const activation = await activateMembersForAccepted(clean);
    return json(200, { stages: clean, activated: activation.activated });
  }

  return json(405, { error: "Method not allowed" });
};
