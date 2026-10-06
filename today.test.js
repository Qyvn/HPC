const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const today = require("./today.js");

const challenges = JSON.parse(fs.readFileSync(path.join(__dirname, "data/challenges.json"), "utf8"));

test("Johannesburg date keys follow SAST, including the midnight boundary", () => {
  assert.equal(today.dateKey(new Date("2026-10-06T21:59:00Z")), "2026-10-06");
  assert.equal(today.dateKey(new Date("2026-10-06T22:00:00Z")), "2026-10-07");
  assert.equal(today.dateKey(new Date("2026-10-06T22:30:00Z")), "2026-10-07");
  assert.equal(today.dateKey(new Date("2026-01-01T00:30:00Z")), "2026-01-01");
  assert.equal(today.dateKey(new Date("2025-12-31T22:00:00Z")), "2026-01-01");
  assert.match(today.formatLong(new Date("2026-10-06T08:00:00Z")), /6 October/);
  assert.match(today.formatLong(new Date("2026-10-06T08:00:00Z")), /Johannesburg/);
});

test("calendar math crosses month and year boundaries", () => {
  assert.equal(today.addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(today.addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(today.addDays("2026-10-06", 0), "2026-10-06");
});

test("streak counts a consecutive run and resets after a missed day", () => {
  assert.equal(today.completionState([], "2026-10-04").streak, 0);

  let dates = today.withDone([], "2026-10-01");
  assert.equal(today.completionState(dates, "2026-10-01").streak, 1);
  assert.equal(today.completionState(dates, "2026-10-01").todayDone, true);

  dates = today.withDone(dates, "2026-10-02");
  dates = today.withDone(dates, "2026-10-03");
  assert.equal(today.completionState(dates, "2026-10-03").streak, 3);

  assert.equal(today.completionState(dates, "2026-10-04").streak, 3);
  assert.equal(today.completionState(dates, "2026-10-04").todayDone, false);

  assert.equal(today.completionState(dates, "2026-10-05").streak, 0);
  dates = today.withDone(dates, "2026-10-05");
  assert.equal(today.completionState(dates, "2026-10-05").streak, 1);

  const across = ["2026-10-30", "2026-10-31", "2026-11-01"];
  assert.equal(today.completionState(across, "2026-11-01").streak, 3);
  assert.equal(today.completionState(across, "2026-11-02").streak, 3);
  assert.equal(today.completionState(across, "2026-11-03").streak, 0);

  const year = ["2025-12-30", "2025-12-31", "2026-01-01"];
  assert.equal(today.completionState(year, "2026-01-01").streak, 3);
  assert.equal(today.completionState(year, "2026-01-03").streak, 0);
});

test("marking the same day twice does not inflate the total, and future dates do not count", () => {
  let dates = today.withDone([], "2026-10-01");
  dates = today.withDone(dates, "2026-10-01");
  assert.deepEqual(dates, ["2026-10-01"]);
  assert.equal(today.completionState(dates, "2026-10-01").total, 1);

  const state = today.completionState(["2026-10-05", "2026-10-06", "nope", "2026-13-40"], "2026-10-05");
  assert.equal(state.total, 1);
  assert.equal(state.streak, 1);
  assert.equal(state.todayDone, true);
});

test("a gap stops the streak even when older days are lit", () => {
  const dates = ["2026-10-01", "2026-10-02", "2026-10-04"];
  const state = today.completionState(dates, "2026-10-04");
  assert.equal(state.streak, 1);
  const lit = Object.fromEntries(state.days.map((day) => [day.date, day.lit]));
  assert.equal(lit["2026-10-04"], true);
  assert.equal(lit["2026-10-03"], false);
  assert.equal(lit["2026-10-02"], true);
  assert.equal(state.days.length, 14);
  assert.equal(state.days.at(-1).date, "2026-10-04");
  assert.equal(state.days.at(-1).today, true);
  assert.equal(state.days.filter((day) => day.older).length, 7);
  assert.equal(state.days[0].older, true);
  assert.equal(state.days[7].older, false);
});

test("must-dos belong to today and clear the next day", () => {
  const stored = {
    date: "2026-10-05",
    items: [
      { text: "Call the room", done: true },
      { text: "Write the page", done: false },
    ],
  };
  assert.deepEqual(today.loadTodos(stored, "2026-10-05"), [
    { text: "Call the room", done: true },
    { text: "Write the page", done: false },
    { text: "", done: false },
  ]);
  assert.deepEqual(today.loadTodos(stored, "2026-10-06"), [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false },
  ]);
  assert.deepEqual(today.loadTodos(null, "2026-10-06").length, 3);
  const long = { date: "2026-10-06", items: [{ text: "x".repeat(200), done: true }] };
  assert.equal(today.loadTodos(long, "2026-10-06")[0].text.length, 140);
});

test("email is offered only after the third total done, and not once opted in", () => {
  assert.equal(today.EMAIL_AFTER, 3);
  assert.equal(today.shouldOfferEmail(0, false), false);
  assert.equal(today.shouldOfferEmail(2, false), false);
  assert.equal(today.shouldOfferEmail(3, false), true);
  assert.equal(today.shouldOfferEmail(3, true), false);
  assert.equal(today.shouldOfferEmail(8, false), true);
});

test("challenges are keyed by date, with a calm fallback and a one-line tomorrow preview", () => {
  const dates = Object.keys(challenges).filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key));
  assert.equal(dates.length, 14);
  for (const date of dates) {
    const entry = challenges[date];
    assert.equal(entry.placeholder, true);
    assert.ok(entry.title && entry.instruction && entry.source);
    assert.match(entry.source, /placeholder/i);
    assert.equal(today.lookupChallenge(challenges, date).placeholder, true);
  }
  assert.equal(today.lookupChallenge(challenges, "2020-01-01"), null);
  assert.equal(today.lookupChallenge({ _note: "ignore me" }, "2026-10-06"), null);
  assert.equal(today.challengeFor(challenges, "2020-01-01").fallback, true);
  assert.match(today.challengeFor(challenges, "2020-01-01").title, /open/i);
  assert.equal(today.tomorrowLine(challenges, "2026-10-06"), "Tomorrow — First rep.");
  assert.equal(today.tomorrowLine(challenges, "2026-10-19"), "Tomorrow isn’t set yet.");
  assert.equal(today.lookupChallenge(challenges, "2026-10-08").title, "One clean page");
});

test("the page form requires unticked consent, a honeypot, and a privacy link", () => {
  const html = fs.readFileSync(path.join(__dirname, "today.html"), "utf8");
  assert.match(html, /name="daily-challenge"/);
  assert.match(html, /netlify-honeypot="bot-field"/);
  assert.match(html, /name="bot-field"/);
  assert.match(html, /name="form-name" value="daily-challenge"/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /Get tomorrow’s challenge by email/);
  const consent = html.match(/<input id="daily-consent"[^>]*>/);
  assert.ok(consent, "consent checkbox exists");
  assert.doesNotMatch(consent[0], /\schecked\b/);
  assert.match(consent[0], /required/);

  const index = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  assert.match(index, /href="\/today"/);
  const privacy = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");
  assert.match(privacy, /Daily challenge/);
  assert.match(privacy, /unsubscribe/i);
  const toml = fs.readFileSync(path.join(__dirname, "netlify.toml"), "utf8");
  assert.match(toml, /from = "\/today"/);
  assert.match(toml, /to = "\/today.html"/);
});
