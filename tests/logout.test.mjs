import assert from "node:assert/strict";
import { test } from "node:test";

test("sign-out from every admin view clears the cookie and returns to sign-in", {
  skip: !process.env.VITA_TEST_URL,
}, async () => {
  const base = new URL(process.env.VITA_TEST_URL);
  assert.ok(["127.0.0.1", "localhost"].includes(base.hostname), "Run auth checks against a local test server.");
  assert.ok(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD, "Set the local test account environment variables.");

  const routes = ["/admin", "/admin/usuarios", "/admin/biblioteca"];
  for (const source of routes) {
    const login = await fetch(new URL("/api/auth/login", base), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];

    const page = await fetch(new URL(source, base), { headers: { cookie } });
    assert.equal(page.status, 200);
    assert.match(await page.text(), /action="\/api\/auth\/logout" method="post"/);

    const logout = await fetch(new URL("/api/auth/logout", base), {
      method: "POST", headers: { cookie }, redirect: "manual",
    });
    assert.equal(logout.status, 303);
    assert.equal(logout.headers.get("location"), "/login");
    assert.equal(logout.headers.get("cache-control"), "no-store");
    const clearedCookie = logout.headers.get("set-cookie");
    assert.match(clearedCookie, /vita_admin_session=;/);
    assert.match(clearedCookie, /Max-Age=0/i);
    assert.match(clearedCookie, /Path=\//i);
    assert.match(clearedCookie, /HttpOnly/i);

    // Model the browser replacing the previous cookie, then reopening protected views.
    const headers = { cookie: clearedCookie.split(";")[0] };
    for (const destination of routes) {
      const protectedPage = await fetch(new URL(destination, base), { headers, redirect: "manual" });
      assert.equal(protectedPage.status, 307);
      assert.match(protectedPage.headers.get("location"), /^\/login\?returnTo=/);
    }
    for (const endpoint of ["/api/links", "/api/advisors"]) {
      const protectedData = await fetch(new URL(endpoint, base), { headers });
      assert.equal(protectedData.status, 401);
    }
  }

  const repeated = await fetch(new URL("/api/auth/logout", base), { method: "POST", redirect: "manual" });
  assert.equal(repeated.status, 303);
  assert.equal((await fetch(new URL("/api/auth/logout", base))).status, 405);
});
