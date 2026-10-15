/* Member session helper for login/join/today. */
(function (root) {
  const API = "/.netlify/functions/member-auth";

  function request(action, options) {
    const opts = options || {};
    const method = opts.method || (action === "me" ? "GET" : "POST");
    const url = action === "me" ? API + "?action=me" : API;
    const init = {
      method: method,
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    };
    if (method !== "GET") {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(Object.assign({ action: action }, opts.body || {}));
    }
    return fetch(url, init).then(function (res) {
      return res.json().catch(function () {
        return {};
      }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data || {} };
      });
    });
  }

  const api = {
    me: function () {
      return request("me", { method: "GET" });
    },
    login: function (email, password) {
      return request("login", { body: { email: email, password: password } });
    },
    register: function (name, email, password) {
      return request("register", { body: { name: name, email: email, password: password } });
    },
    logout: function () {
      return request("logout", { body: {} });
    },
    sync: function (done) {
      return request("sync", { body: { done: done } });
    },
  };

  root.HpcMember = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
