import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { VitaRepository } from '../db/records.ts';

function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url)).filter(f => f.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'));
  }
  const database = { prepare(sql) {
    const statement = sqlite.prepare(sql);
    let values = [];
    const bound = {
      bind(...args) { values = args; return bound; },
      async first() { return statement.get(...values) ?? null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { const r = statement.run(...values); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
    };
    return bound;
  } };
  return { repo: new VitaRepository(database), sqlite };
}

test('stores real contact text, separates advisor links and enforces revocation ownership', async () => {
  const { repo, sqlite } = setup();
  try {
    const a = await repo.createAdvisor('María O\'Hara', 'maria@example.com');
    const b = await repo.createAdvisor('Otro', 'otro@example.com');
    assert.equal((await repo.findAdvisorByToken(a.token)).name, "María O'Hara");
    const link = await repo.createAccessLink({ recipientName: 'Ana 🌿', recipientContact: 'ana@example.com', validDays: 7, maxOpens: null, createdBy: 'admin', advisorId: a.id });
    assert.equal((await repo.listAccessLinks(a.id))[0].recipientName, 'Ana 🌿');
    assert.deepEqual(await repo.listAccessLinks(b.id), []);
    assert.equal(await repo.revokeAccessLink(link.id, b.id), null);
    assert.equal((await repo.openAccessLink(link.token)).status, 'active');
    assert.equal((await repo.revokeAccessLink(link.id, a.id)).revoked, true);
    assert.equal((await repo.openAccessLink(link.token)).status, 'revoked');
    await repo.toggleAdvisor(a.id);
    assert.equal(await repo.findAdvisorByToken(a.token), null);
    await repo.toggleAdvisor(a.id);
    assert.equal((await repo.findAdvisorByToken(a.token)).id, a.id);
  } finally { sqlite.close(); }
});

test('atomic opening respects limits under simultaneous requests, expiry and missing tokens', async () => {
  const { repo, sqlite } = setup();
  try {
    const link = await repo.createAccessLink({ recipientName: 'Cliente', recipientContact: '', validDays: 7, maxOpens: 1, createdBy: 'admin' });
    const attempts = await Promise.all(Array.from({ length: 8 }, () => repo.openAccessLink(link.token)));
    assert.equal(attempts.filter(a => a.status === 'active').length, 1);
    assert.equal(attempts.filter(a => a.status === 'limit').length, 7);
    assert.equal((await repo.peekAccessLink(link.token)).openCount, 1);
    sqlite.prepare('UPDATE access_links SET expires_at = ? WHERE id = ?').run('2000-01-01T00:00:00.000Z', link.id);
    assert.equal((await repo.openAccessLink(link.token)).status, 'expired');
    assert.equal((await repo.openAccessLink('missing')).status, 'missing');
    assert.equal(await repo.peekAccessLink('missing'), null);
  } finally { sqlite.close(); }
});
