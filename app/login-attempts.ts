const FAILURE_WINDOW_MS = 2 * 60 * 1000;
const MAX_FAILURES = 10;
const COOLDOWN_MS = 30 * 1000;
const MAX_TRACKED_ADDRESSES = 10_000;

type Attempt = { count: number; resetAt: number };

export function createLoginAttempts() {
  const attempts = new Map<string, Attempt>();

  function currentAttempt(address: string, now: number) {
    const current = attempts.get(address);
    if (current && current.resetAt <= now) {
      attempts.delete(address);
      return undefined;
    }
    return current;
  }

  function retryAfter(address: string, now: number) {
    const current = currentAttempt(address, now);
    return current && current.count >= MAX_FAILURES
      ? Math.ceil((current.resetAt - now) / 1000)
      : 0;
  }

  function recordFailure(address: string, now: number) {
    const remaining = retryAfter(address, now);
    if (remaining) return remaining;

    const current = currentAttempt(address, now);
    const count = (current?.count ?? 0) + 1;

    if (!current && attempts.size >= MAX_TRACKED_ADDRESSES) {
      for (const [key, attempt] of attempts) {
        if (attempt.resetAt <= now) attempts.delete(key);
      }
      if (attempts.size >= MAX_TRACKED_ADDRESSES) {
        const oldest = attempts.keys().next().value;
        if (oldest !== undefined) attempts.delete(oldest);
      }
    }

    // Only repeated failures trigger a short pause; blocked requests never extend it.
    attempts.set(address, {
      count,
      resetAt: count >= MAX_FAILURES
        ? now + COOLDOWN_MS
        : current?.resetAt ?? now + FAILURE_WINDOW_MS,
    });
    return retryAfter(address, now);
  }

  return {
    retryAfter,
    recordFailure,
    clear(address: string) { attempts.delete(address); },
  };
}
