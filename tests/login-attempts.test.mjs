import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoginAttempts } from "../app/login-attempts.ts";

test("ordinary mistakes stay retryable; ten failures trigger only thirty seconds", () => {
  const attempts = createLoginAttempts();
  for (let failure = 1; failure < 10; failure++) {
    assert.equal(attempts.recordFailure("visitor", 0), 0);
  }
  assert.equal(attempts.recordFailure("visitor", 0), 30);
  assert.equal(attempts.retryAfter("visitor", 1_001), 29);
  assert.equal(attempts.recordFailure("visitor", 15_000), 15);
  assert.equal(attempts.retryAfter("visitor", 30_000), 0);
  assert.equal(attempts.recordFailure("visitor", 30_000), 0);
});

test("old failures expire so occasional typing mistakes do not accumulate", () => {
  const attempts = createLoginAttempts();
  for (let failure = 1; failure < 10; failure++) attempts.recordFailure("visitor", 0);
  assert.equal(attempts.recordFailure("visitor", 120_000), 0);
});

test("successful sign-in clears failures and other visitors stay independent", () => {
  const attempts = createLoginAttempts();
  for (let failure = 1; failure < 10; failure++) attempts.recordFailure("visitor", 0);
  attempts.clear("visitor");
  assert.equal(attempts.recordFailure("visitor", 1), 0);
  for (let failure = 1; failure <= 10; failure++) attempts.recordFailure("other", 1);
  assert.equal(attempts.retryAfter("other", 2), 30);
  assert.equal(attempts.retryAfter("visitor", 2), 0);
});
