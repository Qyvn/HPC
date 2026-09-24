const SITE_ID = "cff4add9-a4a0-45b6-ac63-b4298b54f64f";
const FORM_NAME = "apply";

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
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const password = process.env.OPS_PASSWORD;
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  if (!password || !token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ops not configured" }),
    };
  }

  const auth = parseBasicAuth(event.headers.authorization || event.headers.Authorization);
  // Username can be anything; password must match.
  if (!auth || auth.pass !== password) {
    return unauthorized();
  }

  try {
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!formsRes.ok) {
      throw new Error(`forms ${formsRes.status}`);
    }
    const forms = await formsRes.json();
    const form = forms.find((f) => f.name === FORM_NAME) || forms[0];
    if (!form) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ applications: [], form: null }),
      };
    }

    const subRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!subRes.ok) {
      throw new Error(`submissions ${subRes.status}`);
    }
    const submissions = await subRes.json();
    const applications = (submissions || []).map((s) => ({
      id: s.id,
      createdAt: s.created_at,
      name: (s.data && s.data.name) || s.name || "",
      email: (s.data && s.data.email) || s.email || "",
      lane: (s.data && s.data.lane) || "",
      why: (s.data && s.data.why) || "",
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        form: { id: form.id, name: form.name, count: form.submission_count },
        applications,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to load applications", detail: String(err.message || err) }),
    };
  }
};
