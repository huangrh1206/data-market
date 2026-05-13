const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sha256File } = require('../src/hash');
const { LocalObjectStorage } = require('../src/storage');

test('stores an object and returns deterministic hashes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qdatamarket-objects-'));
  const storage = new LocalObjectStorage(root);
  const filePath = path.join(root, 'input.csv');
  fs.writeFileSync(filePath, 'deviceId,timestamp\n1,2026-05-01T00:00:00Z\n');

  const hash = sha256File(filePath);
  const result = await storage.put(filePath);

  assert.equal(result.dataHash, hash);
  assert.equal(result.storageUriHash.length, 64);

  fs.rmSync(root, { recursive: true, force: true });
});
