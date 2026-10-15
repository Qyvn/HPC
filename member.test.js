const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.MEMBER_JWT_SECRET = "test-secret-for-member-auth";

const members = require("./netlify/lib/members");
const memberAuth = require("./netlify/functions/member-auth");
const opsStages = require("./netlify/functions/ops-stages");

test("password hash verifies and emails normalize", () => {
  assert.equal(members.normalizeEmail("  Alex@Club.COM "), "alex@club.com");
  const hashed = members._test.hashPassword("secure-pass");
  assert.equal(members._test.verifyPassword("secure-pass", hashed.salt, hashed.hash), true);
  assert.equal(members._test.verifyPassword("wrong", hashed.salt, hashed.hash), false);
});

test("session tokens round-trip", () => {
  const token = members._test.signToken({
    sub: "m_1",
    email: "a@b.co",
    exp: Date.now() + 60_000,
  });
  const payload = members._test.verifyToken(token);
  assert.equal(payload.email, "a@b.co");
  assert.equal(members._test.verifyToken("nope"), null);
});

test("register requires an application email", async () => {
  members._memory.clear();
  const res = await memberAuth.handler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      action: "register",
      name: "Test",
      email: "nobody-applied@example.com",
      password: "password1",
    }),
  });
  assert.equal(res.statusCode, 403);
  assert.match(JSON.parse(res.body).error, /No application found/i);
});

test("login rejects unknown accounts", async () => {
  members._memory.clear();
  const res = await memberAuth.handler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      action: "login",
      email: "ghost@example.com",
      password: "password1",
    }),
  });
  assert.equal(res.statusCode, 401);
});

test("ops stages require password and persist accepted map", async () => {
  process.env.OPS_PASSWORD = "ops-test-pass";
  members._memory.clear();

  const denied = await opsStages.handler({
    httpMethod: "GET",
    headers: {},
  });
  assert.equal(denied.statusCode, 401);

  const put = await opsStages.handler({
    httpMethod: "PUT",
    headers: {
      authorization: "Basic " + Buffer.from("ops:ops-test-pass").toString("base64"),
    },
    body: JSON.stringify({ stages: { app1: "accepted", app2: "nope" } }),
  });
  assert.equal(put.statusCode, 200);
  const body = JSON.parse(put.body);
  assert.equal(body.stages.app1, "accepted");
  assert.equal(body.stages.app2, undefined);

  const get = await opsStages.handler({
    httpMethod: "GET",
    headers: {
      authorization: "Basic " + Buffer.from("ops:ops-test-pass").toString("base64"),
    },
  });
  assert.equal(JSON.parse(get.body).stages.app1, "accepted");
});

test("register + accept unlocks login and syncs streak", async () => {
  members._memory.clear();
  process.env.OPS_PASSWORD = "ops-test-pass";
  process.env.MEMBER_JWT_SECRET = "test-secret-for-member-auth";

  const originalFind = members.findApplicationByEmail;
  // Monkey-patch via save path: write member directly then test login/sync through handler helpers.
  const email = "member@example.com";
  const hashed = members.hashPassword("password1");
  await members.saveMember({
    id: "m_app99",
    email: email,
    name: "Member",
    passwordHash: hashed.hash,
    passwordSalt: hashed.salt,
    status: "pending",
    applicationId: "app99",
    createdAt: new Date().toISOString(),
    streak: { done: [] },
  });

  const pendingLogin = await memberAuth.handler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({ action: "login", email: email, password: "password1" }),
  });
  assert.equal(pendingLogin.statusCode, 403);

  await members.saveStages({ app99: "accepted" });
  const activeLogin = await memberAuth.handler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({ action: "login", email: email, password: "password1" }),
  });
  assert.equal(activeLogin.statusCode, 200);
  assert.match(activeLogin.headers["Set-Cookie"] || "", /hpc_member=/);

  const cookie = String(activeLogin.headers["Set-Cookie"]).split(";")[0];
  const synced = await memberAuth.handler({
    httpMethod: "POST",
    headers: { cookie: cookie },
    body: JSON.stringify({ action: "sync", done: ["2026-10-08", "2026-10-09"] }),
  });
  assert.equal(synced.statusCode, 200);
  assert.deepEqual(JSON.parse(synced.body).member.streak.done, ["2026-10-08", "2026-10-09"]);

  void originalFind;
});

test("site exposes login and join entry points", () => {
  const login = fs.readFileSync(path.join(__dirname, "login.html"), "utf8");
  const join = fs.readFileSync(path.join(__dirname, "join.html"), "utf8");
  const index = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const today = fs.readFileSync(path.join(__dirname, "today.html"), "utf8");
  const toml = fs.readFileSync(path.join(__dirname, "netlify.toml"), "utf8");
  const privacy = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");

  assert.match(login, /Member login/);
  assert.match(join, /Create login/);
  assert.match(index, /href="\/login"/);
  assert.match(today, /href="\/login"/);
  assert.match(toml, /from = "\/login"/);
  assert.match(toml, /from = "\/join"/);
  assert.match(privacy, /Member login/);
  assert.ok(fs.existsSync(path.join(__dirname, "netlify/functions/member-auth.js")));
  assert.ok(fs.existsSync(path.join(__dirname, "public/member.js")));
});
