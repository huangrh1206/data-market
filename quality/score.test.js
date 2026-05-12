const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreBatch } = require('./score');

test('scores a complete and consistent batch highly', () => {
  const rows = [
    { timestamp: '2026-05-01T00:00:00Z', temperature: 20, humidity: 50, status: 'OK' },
    { timestamp: '2026-05-01T00:01:00Z', temperature: 21, humidity: 51, status: 'OK' },
    { timestamp: '2026-05-01T00:02:00Z', temperature: 22, humidity: 52, status: 'OK' }
  ];

  const result = scoreBatch(rows, {
    uploadedAt: '2026-05-01T00:03:00Z',
    expectedIntervalSeconds: 60
  });

  assert.equal(result.completeness, 100);
  assert.ok(result.finalScore >= 90);
});

test('penalizes missing fields, inconsistent timestamps, and abnormal values', () => {
  const rows = [
    { timestamp: '2026-05-01T00:00:00Z', temperature: 20, humidity: 50, status: 'OK' },
    { timestamp: '2026-05-01T00:03:00Z', temperature: 999, humidity: null, status: 'BAD' },
    { timestamp: '2026-05-01T00:04:00Z', temperature: -200, humidity: 52, status: 'OK' }
  ];

  const result = scoreBatch(rows, {
    uploadedAt: '2026-05-02T00:00:00Z',
    expectedIntervalSeconds: 60
  });

  assert.ok(result.finalScore < 75);
  assert.ok(result.anomalyRate > 0);
});
