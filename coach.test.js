const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const coach = require("./netlify/functions/coach.js");
const today = require("./today.js");

test("coach system prompt carries HPC voice constraints", () => {
  assert.match(coach._test.SYSTEM_PROMPT, /Can't Hurt Me/);
  assert.match(coach._test.SYSTEM_PROMPT, /Mamba Mentality/);
  assert.match(coach._test.SYSTEM_PROMPT, /05:00/);
  assert.match(coach._test.SYSTEM_PROMPT, /no medical/i);
  assert.match(coach._test.SYSTEM_PROMPT, /Content, Mastermind, Events, Coaching, Network, Challenges/);
});

test("buildUserPayload clamps fields and defaults mode", () => {
  const payload = coach._test.buildUserPayload({
    mode: "nope",
    streak: -3.7,
    yesterday: "missed",
    todayDone: true,
    challengeTitle: "x".repeat(200),
    challenge: "y".repeat(500),
    message: "z".repeat(500),
    mustDos: [
      { text: "Run", done: true },
      { text: "", done: false },
      { text: "Lift", done: false },
      { text: "Extra", done: true },
    ],
  });
  assert.equal(payload.mode, "report");
  assert.equal(payload.streak, 0);
  assert.equal(payload.yesterday, "missed");
  assert.equal(payload.todayDone, true);
  assert.equal(payload.challengeTitle.length, 120);
  assert.equal(payload.challenge.length, 400);
  assert.equal(payload.message.length, 400);
  assert.equal(payload.mustDos.length, 2);
  assert.deepEqual(payload.mustDos[0], { text: "Run", done: true });
  assert.deepEqual(payload.mustDos[1], { text: "Lift", done: false });
});

test("fallback replies cover greeting miss, adaptive streak, and report", () => {
  const miss = coach._test.fallbackReply({
    mode: "greeting",
    streak: 0,
    yesterday: "missed",
    challengeTitle: "Name the blocker",
  });
  assert.match(miss, /Streak broken/);
  assert.match(miss, /Comeback/);

  const hard = coach._test.fallbackReply({
    mode: "adaptive",
    streak: 5,
    todayDone: true,
    yesterday: "done",
  });
  assert.match(hard, /Tomorrow:/);
  assert.match(hard, /Raise it/);

  const reset = coach._test.fallbackReply({
    mode: "adaptive",
    streak: 0,
    todayDone: false,
    yesterday: "missed",
  });
  assert.match(reset, /Miss noted/);
});

test("in-memory rate limit blocks after the configured count", () => {
  coach._test.rateBuckets.clear();
  const id = "test-device-rate";
  let last = null;
  for (let i = 0; i < 20; i += 1) {
    last = coach._test.checkRate(id);
    assert.equal(last.ok, true);
  }
  const blocked = coach._test.checkRate(id);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.remaining, 0);
  coach._test.rateBuckets.clear();
});

test("handler rejects non-POST and empty report messages", async () => {
  const get = await coach.handler({ httpMethod: "GET", body: null });
  assert.equal(get.statusCode, 405);

  const empty = await coach.handler({
    httpMethod: "POST",
    body: JSON.stringify({ mode: "report", deviceId: "t1", message: "" }),
  });
  assert.equal(empty.statusCode, 400);
});

test("handler returns a greeting without an API key via fallback", async () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  coach._test.rateBuckets.clear();
  const res = await coach.handler({
    httpMethod: "POST",
    body: JSON.stringify({
      mode: "greeting",
      deviceId: "greet-device",
      streak: 4,
      yesterday: "done",
      challengeTitle: "Before the phone",
      challenge: "Read your mirror note.",
    }),
  });
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.match(body.reply, /Streak 4/);
  assert.equal(body.mode, "greeting");
});

test("yesterdayResult distinguishes done, miss, and cold start", () => {
  assert.equal(today.yesterdayResult([], "2026-10-08"), "unknown");
  assert.equal(today.yesterdayResult(["2026-10-07"], "2026-10-08"), "done");
  assert.equal(today.yesterdayResult(["2026-10-05"], "2026-10-08"), "missed");
  assert.equal(today.yesterdayResult(["2026-10-06", "2026-10-07"], "2026-10-08"), "done");
});

test("adaptiveTomorrow hardens after a streak and resets after a miss", () => {
  assert.match(today.adaptiveTomorrow(5, true, false), /Raise it/);
  assert.match(today.adaptiveTomorrow(1, true, false), /protect the same window/);
  assert.match(today.adaptiveTomorrow(0, false, true), /10-minute reset/);
  assert.match(today.adaptiveTomorrow(4, false, false), /10-minute reset/);
});

test("extractTomorrowLine and loadCoachPush keep only today's push", () => {
  assert.equal(
    today.extractTomorrowLine("Good. Tomorrow: add five more minutes. Do it."),
    "Tomorrow: add five more minutes. Do it."
  );
  assert.equal(today.extractTomorrowLine("No line here"), "");
  assert.equal(today.loadCoachPush({ date: "2026-10-09", text: "Tomorrow: run." }, "2026-10-09"), "Tomorrow: run.");
  assert.equal(today.loadCoachPush({ date: "2026-10-08", text: "Tomorrow: run." }, "2026-10-09"), "");
});

test("today page exposes the coach panel and privacy covers it", () => {
  const html = fs.readFileSync(path.join(__dirname, "today.html"), "utf8");
  assert.match(html, /id="coach"/);
  assert.match(html, /id="coach-form"/);
  assert.match(html, /id="coach-input"/);
  assert.match(html, /Coach check/);
  const privacy = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");
  assert.match(privacy, /Coach check-in/);
  assert.match(privacy, /do not store that note/i);
  assert.ok(fs.existsSync(path.join(__dirname, "netlify/functions/coach.js")));
});
