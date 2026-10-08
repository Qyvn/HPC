/* Daily page: Johannesburg dates, streak, must-dos, and the email prompt. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined") api.mount(document);
  root.HpcToday = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ZONE = "Africa/Johannesburg";
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const EMAIL_AFTER = 3;
  const COACH_MESSAGE_MAX = 400;
  const KEYS = {
    done: "hpc.today.done",
    todos: "hpc.today.todos",
    email: "hpc.today.email",
    device: "hpc.today.device",
    coachPush: "hpc.today.coachPush",
    coachGreeted: "hpc.today.coachGreeted",
  };
  const FALLBACK = {
    title: "The day is open.",
    challenge: "No challenge is set for this date. Keep the standard anyway.",
    why: "",
    tomorrow_teaser: "",
    theme: "",
    day: null,
    time: null,
    fallback: true,
  };

  function dateKey(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const bag = Object.create(null);
    for (const part of parts) bag[part.type] = part.value;
    return bag.year + "-" + bag.month + "-" + bag.day;
  }

  function formatLong(date, timeZone) {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: timeZone || ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
    return formatted + " · Johannesburg";
  }

  function formatDayLabel(iso) {
    const parts = iso.split("-").map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 10, 0, 0));
    const bag = Object.create(null);
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).formatToParts(date).forEach(function (part) {
      bag[part.type] = part.value;
    });
    return bag.weekday + ", " + bag.day + " " + bag.month;
  }

  function addDays(iso, amount) {
    const parts = iso.split("-").map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + amount));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function isRealDate(iso) {
    if (typeof iso !== "string" || !ISO_DATE.test(iso)) return false;
    const parts = iso.split("-").map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return (
      date.getUTCFullYear() === parts[0] &&
      date.getUTCMonth() === parts[1] - 1 &&
      date.getUTCDate() === parts[2]
    );
  }

  function normalizeDates(dates) {
    const set = new Set();
    if (!Array.isArray(dates)) return set;
    for (const value of dates) {
      if (isRealDate(value)) set.add(value);
    }
    return set;
  }

  function withDone(dates, today) {
    const set = normalizeDates(dates);
    if (isRealDate(today)) set.add(today);
    return Array.from(set).sort();
  }

  function streakCount(set, today) {
    let cursor = set.has(today) ? today : addDays(today, -1);
    if (!set.has(cursor)) return 0;
    let count = 0;
    while (set.has(cursor) && count < 10000) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  function countOnOrBefore(set, today) {
    let count = 0;
    set.forEach(function (date) {
      if (date <= today) count += 1;
    });
    return count;
  }

  function completionState(dates, today, windowSize) {
    const size = windowSize || 14;
    const set = dates instanceof Set ? dates : normalizeDates(dates);
    const days = [];
    for (let i = size - 1; i >= 0; i -= 1) {
      const date = addDays(today, -i);
      days.push({
        date: date,
        lit: set.has(date),
        today: date === today,
        older: days.length < size - 7,
      });
    }
    return {
      streak: streakCount(set, today),
      todayDone: set.has(today),
      total: countOnOrBefore(set, today),
      days: days,
    };
  }

  function textField(entry, key) {
    return entry && typeof entry[key] === "string" ? entry[key].trim() : "";
  }

  const OPEN_TOMORROW = "Tomorrow isn’t set yet.";

  function daysBetween(fromIso, toIso) {
    if (!isRealDate(fromIso) || !isRealDate(toIso)) return NaN;
    const from = fromIso.split("-").map(Number);
    const to = toIso.split("-").map(Number);
    const start = Date.UTC(from[0], from[1] - 1, from[2]);
    const end = Date.UTC(to[0], to[1] - 1, to[2]);
    return Math.round((end - start) / 86400000);
  }

  function dayNumber(launch, today) {
    return daysBetween(launch, today) + 1;
  }

  function dateForDay(launch, number) {
    if (!isRealDate(launch) || !Number.isInteger(number)) return "";
    return addDays(launch, number - 1);
  }

  function launchDateOf(data) {
    const value = data && typeof data.launchDate === "string" ? data.launchDate : "";
    return isRealDate(value) ? value : "";
  }

  function normalizeEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    const title = textField(entry, "title");
    const challenge = textField(entry, "challenge");
    if (!title || !challenge) return null;
    const day = Number(entry.day);
    const time = Number(entry.time);
    return {
      title: title,
      challenge: challenge,
      why: textField(entry, "why"),
      tomorrow_teaser: textField(entry, "tomorrow_teaser"),
      theme: textField(entry, "theme"),
      day: Number.isInteger(day) ? day : null,
      time: Number.isFinite(time) ? time : null,
      fallback: false,
    };
  }

  function challengeByDay(data, day) {
    const wanted = Number(day);
    const list = data && Array.isArray(data.challenges) ? data.challenges : null;
    if (!list || !Number.isInteger(wanted)) return null;
    for (let i = 0; i < list.length; i += 1) {
      if (Number(list[i] && list[i].day) !== wanted) continue;
      const entry = normalizeEntry(list[i]);
      if (entry) return entry;
    }
    return null;
  }

  function formatKicker(entry) {
    if (!entry || entry.fallback || entry.day == null || !entry.theme || entry.time == null) return "";
    return "DAY " + entry.day + " · " + entry.theme.toUpperCase() + " · " + entry.time + " MIN";
  }

  function viewFor(data, today) {
    const launch = launchDateOf(data);
    if (!launch || !isRealDate(today)) {
      return { mode: "open", entry: FALLBACK, kicker: "", tomorrow: OPEN_TOMORROW, doneEnabled: true };
    }
    const number = dayNumber(launch, today);
    if (number < 1) {
      const dayOne = challengeByDay(data, 1);
      return {
        mode: "prelaunch",
        entry: {
          title: dayOne ? dayOne.title : FALLBACK.title,
          challenge: "Day 1 starts " + formatDayLabel(launch) + ".",
          why: "",
          tomorrow_teaser: "",
          theme: "",
          day: null,
          time: null,
          fallback: false,
        },
        kicker: "",
        tomorrow: "",
        doneEnabled: false,
      };
    }
    const entry = challengeByDay(data, number);
    if (!entry) {
      return { mode: "open", entry: FALLBACK, kicker: "", tomorrow: OPEN_TOMORROW, doneEnabled: true };
    }
    return {
      mode: "live",
      entry: entry,
      kicker: formatKicker(entry),
      tomorrow: entry.tomorrow_teaser || OPEN_TOMORROW,
      doneEnabled: true,
    };
  }

  function loadTodos(stored, today) {
    const blank = [
      { text: "", done: false },
      { text: "", done: false },
      { text: "", done: false },
    ];
    if (!stored || typeof stored !== "object" || stored.date !== today || !Array.isArray(stored.items)) {
      return blank;
    }
    return [0, 1, 2].map(function (index) {
      const item = stored.items[index] || {};
      return {
        text: typeof item.text === "string" ? item.text.slice(0, 140) : "",
        done: item.done === true,
      };
    });
  }

  function shouldOfferEmail(total, optedIn) {
    return total >= EMAIL_AFTER && !optedIn;
  }

  function yesterdayResult(dates, today) {
    if (!isRealDate(today)) return "unknown";
    const set = dates instanceof Set ? dates : normalizeDates(dates);
    const yesterday = addDays(today, -1);
    if (set.has(yesterday)) return "done";
    const anyOlder = Array.from(set).some(function (date) {
      return date < yesterday;
    });
    return anyOlder ? "missed" : "unknown";
  }

  function deviceId(store) {
    if (!store) return "anon";
    const existing = store.get(KEYS.device);
    if (existing && typeof existing === "string" && existing.length >= 8) return existing.slice(0, 64);
    const id =
      "d" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36);
    store.set(KEYS.device, id);
    return id;
  }

  function loadCoachPush(stored, forDate) {
    if (!stored || typeof stored !== "object") return "";
    if (stored.date !== forDate) return "";
    return typeof stored.text === "string" ? stored.text.trim().slice(0, 280) : "";
  }

  function adaptiveTomorrow(streak, todayDone, missedYesterday) {
    if (missedYesterday || !todayDone) {
      return "Tomorrow: 10-minute reset on today’s standard. No new goals until that lands.";
    }
    if (streak >= 3) {
      return "Tomorrow: same work, 10 more minutes or one harder rep. Raise it.";
    }
    return "Tomorrow: protect the same window and finish clean.";
  }

  function extractTomorrowLine(reply) {
    if (typeof reply !== "string") return "";
    const match = reply.match(/Tomorrow:\s*[^\n]+/i);
    return match ? match[0].trim().slice(0, 280) : "";
  }

  function createStore(storage) {
    const memory = new Map();
    return {
      get: function (key) {
        try {
          if (storage) return storage.getItem(key);
        } catch (err) {
          /* private mode */
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      set: function (key, value) {
        memory.set(key, value);
        try {
          if (storage) storage.setItem(key, value);
        } catch (err) {
          /* private mode */
        }
      },
    };
  }

  function parseJson(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function mount(doc) {
    if (!doc || !doc.getElementById) return;
    const view = doc.defaultView || (typeof window !== "undefined" ? window : null);
    const store = createStore(view && view.localStorage);
    const now = new Date();
    const today = dateKey(now);
    let challenges = { launchDate: "", challenges: [] };
    let page = viewFor(challenges, today);

    const dateEl = doc.getElementById("today-date");
    const kickerEl = doc.getElementById("challenge-kicker");
    const titleEl = doc.getElementById("challenge-title");
    const bodyEl = doc.getElementById("challenge-body");
    const whyEl = doc.getElementById("challenge-why");
    const article = doc.getElementById("challenge");
    const doneBtn = doc.getElementById("done-btn");
    const panel = doc.getElementById("streak-panel");
    const countEl = doc.getElementById("streak-count");
    const unitEl = doc.getElementById("streak-unit");
    const dayList = doc.getElementById("day-row");
    const tomorrowEl = doc.getElementById("tomorrow-line");
    const emailSection = doc.getElementById("email-prompt");
    const rows = Array.from(doc.querySelectorAll("[data-must-row]"));
    const coachSection = doc.getElementById("coach");
    const coachReplyEl = doc.getElementById("coach-reply");
    const coachForm = doc.getElementById("coach-form");
    const coachInput = doc.getElementById("coach-input");
    const coachSubmit = doc.getElementById("coach-submit");
    const coachError = doc.getElementById("coach-error");
    const coachStatus = doc.getElementById("coach-status");
    let coachBusy = false;

    if (dateEl) dateEl.textContent = formatLong(now);

    function savedDates() {
      return parseJson(store.get(KEYS.done), []);
    }

    let lastState = completionState(savedDates(), today);

    function paintChallenge() {
      page = viewFor(challenges, today);
      const entry = page.entry;
      if (kickerEl) {
        kickerEl.textContent = page.kicker;
        kickerEl.hidden = !page.kicker;
      }
      if (titleEl) titleEl.textContent = entry.title;
      if (bodyEl) bodyEl.textContent = entry.challenge;
      if (whyEl) {
        whyEl.textContent = entry.why || "";
        whyEl.hidden = !entry.why;
      }
      if (article) {
        article.dataset.mode = page.mode;
        article.dataset.fallback = entry.fallback ? "true" : "false";
        article.hidden = false;
      }
    }

    function paintDone() {
      page = viewFor(challenges, today);
      const state = completionState(savedDates(), today);
      const waiting = !page.doneEnabled;
      const complete = !waiting && state.todayDone;
      if (doneBtn) {
        doneBtn.dataset.state = waiting ? "waiting" : complete ? "done" : "ready";
        doneBtn.setAttribute("aria-pressed", complete ? "true" : "false");
        doneBtn.disabled = waiting || complete;
        doneBtn.classList.toggle("is-complete", complete);
        doneBtn.classList.toggle("is-waiting", waiting);
        doneBtn.textContent = complete ? "Done today" : "Done";
      }
      if (panel) panel.hidden = !complete;
      if (countEl) {
        countEl.textContent = String(state.streak);
        countEl.dataset.streak = String(state.streak);
      }
      if (unitEl) unitEl.textContent = state.streak === 1 ? "day" : "days";
      if (dayList) {
        dayList.replaceChildren();
        state.days.forEach(function (day) {
          const item = doc.createElement("li");
          item.className = "day-box";
          if (day.lit) item.classList.add("is-lit");
          if (day.today) item.classList.add("is-today");
          if (day.older) item.classList.add("is-older");
          item.dataset.date = day.date;
          item.dataset.lit = day.lit ? "true" : "false";
          item.setAttribute(
            "aria-label",
            formatDayLabel(day.date) + ", " + (day.lit ? "done" : "open")
          );
          const num = doc.createElement("span");
          num.setAttribute("aria-hidden", "true");
          num.textContent = String(Number(day.date.slice(8, 10)));
          item.append(num);
          dayList.append(item);
        });
      }
      if (tomorrowEl) {
        const push = loadCoachPush(parseJson(store.get(KEYS.coachPush), null), addDays(today, 1));
        tomorrowEl.textContent = push || page.tomorrow;
      }
      paintEmail(waiting ? 0 : state.total);
      lastState = state;
      return state;
    }

    function setCoachReply(text) {
      if (!coachReplyEl) return;
      const value = typeof text === "string" ? text.trim() : "";
      coachReplyEl.textContent = value;
      coachReplyEl.hidden = !value;
    }

    function setCoachError(text) {
      if (!coachError) return;
      const value = typeof text === "string" ? text.trim() : "";
      coachError.textContent = value;
      coachError.hidden = !value;
    }

    function setCoachBusy(on) {
      coachBusy = on;
      if (coachSubmit) {
        coachSubmit.disabled = on;
        coachSubmit.textContent = on ? "Sending…" : "Send";
      }
      if (coachInput) coachInput.disabled = on;
      if (coachStatus) {
        coachStatus.textContent = on ? "Coach is reading…" : "";
        coachStatus.hidden = !on;
      }
    }

    function coachContext(mode, message) {
      const dates = savedDates();
      const state = completionState(dates, today);
      const entry = page.entry || FALLBACK;
      const todos = loadTodos(parseJson(store.get(KEYS.todos), null), today);
      return {
        mode: mode,
        deviceId: deviceId(store),
        streak: state.streak,
        yesterday: yesterdayResult(dates, today),
        todayDone: state.todayDone,
        challengeTitle: entry.title || "",
        challenge: entry.challenge || "",
        message: typeof message === "string" ? message.slice(0, COACH_MESSAGE_MAX) : "",
        mustDos: todos
          .filter(function (item) {
            return item.text;
          })
          .map(function (item) {
            return { text: item.text, done: item.done };
          }),
      };
    }

    function askCoach(mode, message) {
      if (!view || !view.fetch || coachBusy) {
        return Promise.resolve(null);
      }
      setCoachBusy(true);
      setCoachError("");
      return view
        .fetch("/.netlify/functions/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(coachContext(mode, message)),
        })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, status: res.status, data: data || {} };
          });
        })
        .then(function (result) {
          const reply =
            result.data && typeof result.data.reply === "string" ? result.data.reply.trim() : "";
          if (reply) setCoachReply(reply);
          if (!result.ok) {
            if (result.status === 429) {
              setCoachError("Rate limit. Come back tomorrow.");
            } else if (!reply) {
              setCoachError("Coach unavailable right now.");
            }
          }
          if ((mode === "adaptive" || mode === "greeting") && reply) {
            const missed = yesterdayResult(savedDates(), today) === "missed";
            const shouldPush = mode === "adaptive" || missed;
            if (shouldPush) {
              const line =
                extractTomorrowLine(reply) ||
                adaptiveTomorrow(
                  lastState.streak,
                  mode === "adaptive" ? lastState.todayDone : false,
                  missed
                );
              store.set(
                KEYS.coachPush,
                JSON.stringify({ date: addDays(today, 1), text: line })
              );
              if (tomorrowEl && lastState.todayDone) tomorrowEl.textContent = line;
            }
          }
          return result;
        })
        .catch(function () {
          setCoachError("Coach unavailable right now.");
          return null;
        })
        .finally(function () {
          setCoachBusy(false);
        });
    }

    function maybeGreet() {
      if (!coachSection || !view || !view.fetch) return;
      if (store.get(KEYS.coachGreeted) === today) return;
      askCoach("greeting", "").then(function (result) {
        if (result && result.data && result.data.reply) {
          store.set(KEYS.coachGreeted, today);
        }
      });
    }

    function maybeAdapt(prevDone) {
      const state = completionState(savedDates(), today);
      if (!prevDone && state.todayDone) {
        askCoach("adaptive", "Challenge marked done.");
      }
    }

    function paintEmail(total) {
      if (!emailSection || emailSection.dataset.submitted === "true") return;
      const show = shouldOfferEmail(total, store.get(KEYS.email) === "1");
      const wasHidden = emailSection.hidden;
      emailSection.hidden = !show;
      if (show && wasHidden) {
        const consent = doc.getElementById("daily-consent");
        if (consent) consent.checked = false;
      }
    }

    function paintTodos() {
      const items = loadTodos(parseJson(store.get(KEYS.todos), null), today);
      rows.forEach(function (row, index) {
        const item = items[index];
        const box = row.querySelector('input[type="checkbox"]');
        const text = row.querySelector('input[type="text"]');
        if (!box || !text || !item) return;
        box.checked = item.done;
        text.value = item.text;
        text.classList.toggle("is-done", item.done);
      });
    }

    function saveTodos() {
      const items = rows.map(function (row) {
        const box = row.querySelector('input[type="checkbox"]');
        const text = row.querySelector('input[type="text"]');
        return {
          text: text ? text.value.slice(0, 140) : "",
          done: !!(box && box.checked),
        };
      });
      store.set(KEYS.todos, JSON.stringify({ date: today, items: items }));
      rows.forEach(function (row) {
        const box = row.querySelector('input[type="checkbox"]');
        const text = row.querySelector('input[type="text"]');
        if (text && box) text.classList.toggle("is-done", box.checked);
      });
    }

    paintDone();
    paintTodos();
    if (!(view && view.fetch)) paintChallenge();

    if (doneBtn) {
      doneBtn.addEventListener("click", function () {
        if (doneBtn.disabled || !page.doneEnabled) return;
        const wasDone = completionState(savedDates(), today).todayDone;
        const dates = withDone(savedDates(), today);
        store.set(KEYS.done, JSON.stringify(dates));
        paintDone();
        maybeAdapt(wasDone);
      });
    }

    if (coachForm && coachInput) {
      coachForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const message = coachInput.value.trim().slice(0, COACH_MESSAGE_MAX);
        if (!message || coachBusy) return;
        askCoach("report", message).then(function (result) {
          if (result && result.ok) coachInput.value = "";
        });
      });
    }

    rows.forEach(function (row) {
      row.addEventListener("input", saveTodos);
      row.addEventListener("change", saveTodos);
    });

    const form = doc.getElementById("daily-form");
    if (form) {
      const consentField = form.querySelector("[data-consent]");
      const emailField = form.querySelector("[data-email]");
      const consent = doc.getElementById("daily-consent");
      const email = doc.getElementById("daily-email");
      const submitBtn = doc.getElementById("daily-submit");
      const emailError = emailField ? emailField.querySelector(".field-error") : null;

      const clearInvalid = function (field) {
        if (field) field.classList.remove("is-invalid");
      };

      if (consent) {
        consent.addEventListener("invalid", function (event) {
          event.preventDefault();
          if (consentField) consentField.classList.add("is-invalid");
          consent.focus();
        });
      }
      if (email) {
        email.addEventListener("invalid", function (event) {
          event.preventDefault();
          if (emailField) emailField.classList.add("is-invalid");
          if (!consent || consent.checked) email.focus();
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(consentField);
        clearInvalid(emailField);
        if (emailError) emailError.textContent = "Enter a valid email.";
        if (!consent || !consent.checked) {
          if (consentField) consentField.classList.add("is-invalid");
          if (consent) consent.focus();
          return;
        }
        if (!email || !email.value.trim() || !email.checkValidity()) {
          if (emailField) emailField.classList.add("is-invalid");
          if (email) email.focus();
          return;
        }
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }
        const body = new URLSearchParams(new FormData(form)).toString();
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body,
        })
          .then(function (res) {
            if (!res.ok) throw new Error("status");
            store.set(KEYS.email, "1");
            if (emailSection) emailSection.dataset.submitted = "true";
            form.hidden = true;
            const success = doc.getElementById("email-success");
            if (success) success.hidden = false;
          })
          .catch(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Send";
            }
            if (emailError) emailError.textContent = "Could not send just now.";
            if (emailField) emailField.classList.add("is-invalid");
          });
      });

      form.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("input", function () {
          const field = input.closest("[data-consent], [data-email]");
          clearInvalid(field);
        });
        input.addEventListener("change", function () {
          const field = input.closest("[data-consent], [data-email]");
          clearInvalid(field);
        });
      });
    }

    if (view && view.fetch) {
      view
        .fetch("/data/challenges.json", { headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("status");
          return res.json();
        })
        .then(function (data) {
          challenges = data && typeof data === "object" ? data : { launchDate: "", challenges: [] };
          paintChallenge();
          paintDone();
          maybeGreet();
        })
        .catch(function () {
          challenges = { launchDate: "", challenges: [] };
          paintChallenge();
          paintDone();
          maybeGreet();
        });
    }

    bindChrome(doc);
  }

  function bindChrome(doc) {
    const view = doc.defaultView;
    if (!view) return;
    const nav = doc.getElementById("nav");
    if (nav) {
      const onScroll = function () {
        nav.classList.toggle("is-scrolled", view.scrollY > 24);
      };
      onScroll();
      view.addEventListener("scroll", onScroll, { passive: true });
    }

    const menuToggle = doc.querySelector(".nav-toggle");
    const mobileNav = doc.getElementById("mobile-nav");
    const menuClose = mobileNav ? mobileNav.querySelector(".mobile-nav-close") : null;
    const shell = doc.querySelector(".shell");
    if (!menuToggle || !mobileNav) return;

    const setBackgroundInert = function (on) {
      if (!shell) return;
      shell.querySelectorAll(":scope > header, :scope > main, :scope > footer").forEach(function (el) {
        el.inert = on;
      });
    };

    const lockScroll = function () {
      const y = view.scrollY || doc.documentElement.scrollTop || 0;
      doc.body.dataset.scrollY = String(y);
      doc.body.style.top = "-" + y + "px";
      doc.body.classList.add("menu-open");
    };

    const unlockScroll = function () {
      const y = parseInt(doc.body.dataset.scrollY || "0", 10);
      doc.body.classList.remove("menu-open");
      doc.body.style.top = "";
      delete doc.body.dataset.scrollY;
      const root = doc.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      view.scrollTo(0, y);
      root.style.scrollBehavior = previous;
      return y;
    };

    const openMenu = function () {
      mobileNav.hidden = false;
      menuToggle.setAttribute("aria-expanded", "true");
      lockScroll();
      setBackgroundInert(true);
      if (menuClose) menuClose.focus({ preventScroll: true });
    };

    const closeMenu = function (opts) {
      const options = opts || {};
      if (mobileNav.hidden) return;
      unlockScroll();
      mobileNav.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      setBackgroundInert(false);
      if (options.restoreFocus !== false) menuToggle.focus({ preventScroll: true });
    };

    menuToggle.addEventListener("click", function () {
      if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });
    if (menuClose) menuClose.addEventListener("click", function () { closeMenu(); });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#") || mobileNav.hidden) return;
        event.preventDefault();
        unlockScroll();
        mobileNav.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
        setBackgroundInert(false);
        const target = doc.querySelector(href);
        if (target) {
          const reduce = view.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
        view.history.pushState(null, "", href);
      });
    });

    mobileNav.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || mobileNav.hidden) return;
      const focusable = Array.from(mobileNav.querySelectorAll("button, a"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  return {
    ZONE: ZONE,
    EMAIL_AFTER: EMAIL_AFTER,
    COACH_MESSAGE_MAX: COACH_MESSAGE_MAX,
    KEYS: KEYS,
    FALLBACK: FALLBACK,
    dateKey: dateKey,
    formatLong: formatLong,
    addDays: addDays,
    isRealDate: isRealDate,
    normalizeDates: normalizeDates,
    withDone: withDone,
    completionState: completionState,
    daysBetween: daysBetween,
    dayNumber: dayNumber,
    dateForDay: dateForDay,
    challengeByDay: challengeByDay,
    viewFor: viewFor,
    formatKicker: formatKicker,
    loadTodos: loadTodos,
    shouldOfferEmail: shouldOfferEmail,
    yesterdayResult: yesterdayResult,
    loadCoachPush: loadCoachPush,
    adaptiveTomorrow: adaptiveTomorrow,
    extractTomorrowLine: extractTomorrowLine,
    deviceId: deviceId,
    mount: mount,
  };
});
