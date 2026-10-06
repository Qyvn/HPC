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

test("launchDate offsets the whole block, and each item is keyed by day", () => {
  const raw = fs.readFileSync(path.join(__dirname, "data/challenges.json"), "utf8");
  const html = fs.readFileSync(path.join(__dirname, "today.html"), "utf8");
  assert.doesNotMatch(raw, /placeholder/i);
  assert.doesNotMatch(raw, /"source"/);
  assert.doesNotMatch(raw, /"date"/);
  assert.doesNotMatch(html, /Placeholder copy/);
  assert.doesNotMatch(html, /id="challenge-source"/);

  assert.equal(challenges.launchDate, "2026-10-06");
  assert.equal(challenges.challenges.length, 30);
  challenges.challenges.forEach((item, index) => {
    assert.equal(item.day, index + 1);
    assert.equal(item.date, undefined);
    assert.ok(item.title && item.challenge && item.why && item.theme && item.tomorrow_teaser);
    assert.equal(typeof item.time, "number");
  });

  assert.equal(today.dayNumber("2026-10-06", "2026-10-06"), 1);
  assert.equal(today.dateForDay("2026-10-06", 1), "2026-10-06");
  assert.equal(today.dateForDay("2026-10-06", 15), "2026-10-20");
  assert.equal(today.dateForDay("2026-10-06", 30), "2026-11-04");
  assert.equal(today.daysBetween("2026-10-06", "2026-11-04"), 29);

  const dayOne = today.viewFor(challenges, "2026-10-06");
  assert.equal(dayOne.mode, "live");
  assert.equal(dayOne.kicker, "DAY 1 · OWN THE MIRROR · 5 MIN");
  assert.equal(dayOne.entry.title, "Name the blocker");
  assert.match(dayOne.entry.challenge, /bathroom mirror/);
  assert.equal(dayOne.tomorrow, "Tomorrow: one move against that habit before you open your phone.");
  assert.equal(dayOne.doneEnabled, true);
  assert.doesNotMatch(dayOne.tomorrow, /Tomorrow —/);

  const dayNine = today.viewFor(challenges, "2026-10-14");
  assert.equal(dayNine.kicker, "DAY 9 · CALLOUS THE MIND · 10 MIN");
  assert.equal(dayNine.entry.title, "A little further");

  const dayFifteen = today.viewFor(challenges, "2026-10-20");
  assert.equal(dayFifteen.mode, "live");
  assert.equal(dayFifteen.kicker, "DAY 15 · WORK IN THE DARK · 5 MIN");
  assert.equal(dayFifteen.entry.title, "Start earlier");
  assert.equal(dayFifteen.tomorrow, "Tomorrow: watch someone excellent and ask why it works.");

  const shifted = { launchDate: "2026-11-01", challenges: challenges.challenges };
  assert.equal(today.viewFor(shifted, "2026-11-01").kicker, "DAY 1 · OWN THE MIRROR · 5 MIN");
  assert.equal(today.viewFor(shifted, "2026-11-15").entry.title, "Start earlier");
  assert.equal(today.viewFor(shifted, "2026-10-31").mode, "prelaunch");
});

test("the day before launch is a calm preview with Done disabled", () => {
  const view = today.viewFor(challenges, "2026-10-05");
  assert.equal(view.mode, "prelaunch");
  assert.equal(view.entry.title, "Name the blocker");
  assert.equal(view.entry.challenge, "Day 1 starts Tuesday, 6 October.");
  assert.equal(view.entry.why, "");
  assert.equal(view.kicker, "");
  assert.equal(view.doneEnabled, false);
  assert.equal(today.viewFor(challenges, "2026-10-01").mode, "prelaunch");
});

test("day 30 keeps its own ending teaser, and day 31 is open", () => {
  const last = today.viewFor(challenges, "2026-11-04");
  assert.equal(last.mode, "live");
  assert.equal(last.entry.day, 30);
  assert.equal(last.entry.title, "Start again at zero");
  assert.equal(last.kicker, "DAY 30 · DETAIL AND FINISHING · 10 MIN");
  assert.equal(last.tomorrow, "Tomorrow: a new block starts. Same mirror, higher standard.");
  assert.equal(today.challengeByDay(challenges, 31), null);

  const after = today.viewFor(challenges, "2026-11-05");
  assert.equal(after.mode, "open");
  assert.equal(after.entry.fallback, true);
  assert.equal(after.entry.title, "The day is open.");
  assert.equal(after.kicker, "");
  assert.equal(after.tomorrow, "Tomorrow isn’t set yet.");
  assert.equal(after.doneEnabled, true);

  const missing = today.viewFor({ launchDate: "2026-10-06", challenges: [] }, "2026-10-06");
  assert.equal(missing.mode, "open");
  assert.equal(missing.entry.title, "The day is open.");
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
  const tiktok = /<a href="https:\/\/www\.tiktok\.com\/@highperformersclb" target="_blank" rel="noopener" aria-label="TikTok">TikTok<\/a>/;
  assert.match(html, tiktok);
  assert.match(index, tiktok);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8"), /footer-meta/);
  const privacy = fs.readFileSync(path.join(__dirname, "privacy.html"), "utf8");
  assert.match(privacy, /Daily challenge/);
  assert.match(privacy, /unsubscribe/i);
  const toml = fs.readFileSync(path.join(__dirname, "netlify.toml"), "utf8");
  assert.match(toml, /from = "\/today"/);
  assert.match(toml, /to = "\/today.html"/);
});
