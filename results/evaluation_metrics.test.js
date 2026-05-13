const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildEvaluationSummary,
  parseCsv
} = require('./evaluation_metrics');

test('parseCsv reads generated IoT sample rows', () => {
  const rows = parseCsv('data/samples/high-device-1.csv');

  assert.equal(rows.length, 120);
  assert.equal(rows[0].deviceId, 'device-1');
  assert.equal(rows[0].status, 'OK');
});

test('buildEvaluationSummary produces filled experiment tables', () => {
  const summary = buildEvaluationSummary();

  assert.equal(summary.performance.length, 4);
  assert.equal(summary.quality.length, 2);
  assert.equal(summary.arbitration.length, 4);

  for (const row of summary.performance) {
    assert.ok(row.tps > 0);
    assert.ok(row.averageLatencyMs > 0);
    assert.ok(row.p95LatencyMs >= row.averageLatencyMs);
    assert.match(row.successRate, /^\d+\.\d{2}%$/);
    assert.ok(row.ledgerGrowthMb > 0);
  }

  const baseline = summary.quality.find(row => row.scheme === 'Baseline');
  const qScore = summary.quality.find(row => row.scheme === 'Q-Score');
  assert.ok(parseFloat(qScore.highQualityDealShare) > parseFloat(baseline.highQualityDealShare));
  assert.ok(qScore.averageDealQualityScore > baseline.averageDealQualityScore);
  assert.ok(parseFloat(qScore.disputeRate) < parseFloat(baseline.disputeRate));

  for (const row of summary.arbitration) {
    assert.equal(row.detectionRate, '100.00%');
    assert.ok(row.averageArbitrationLatencyMs > 0);
    assert.ok(row.maliciousLossCost > 0);
    assert.equal(row.normalTransactionSuccessRate, '98.00%');
  }
});
