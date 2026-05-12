function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreBatch(rows, options = {}) {
  const expectedIntervalSeconds = options.expectedIntervalSeconds || 60;
  const uploadedAt = new Date(options.uploadedAt || Date.now()).getTime();
  const requiredFields = ['timestamp', 'temperature', 'humidity', 'status'];
  const totalCells = rows.length * requiredFields.length;
  let presentCells = 0;
  let abnormalValues = 0;
  let inconsistentIntervals = 0;
  let previousTime = null;

  for (const row of rows) {
    for (const field of requiredFields) {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        presentCells += 1;
      }
    }

    const temperature = Number(row.temperature);
    const humidity = Number(row.humidity);
    if (!Number.isFinite(temperature) || temperature < -50 || temperature > 80) {
      abnormalValues += 1;
    }
    if (!Number.isFinite(humidity) || humidity < 0 || humidity > 100) {
      abnormalValues += 1;
    }
    if (!['OK', 'WARN'].includes(row.status)) {
      abnormalValues += 1;
    }

    const currentTime = new Date(row.timestamp).getTime();
    if (previousTime !== null) {
      const delta = Math.abs((currentTime - previousTime) / 1000);
      if (Math.abs(delta - expectedIntervalSeconds) > expectedIntervalSeconds * 0.2) {
        inconsistentIntervals += 1;
      }
    }
    previousTime = currentTime;
  }

  const completeness = totalCells === 0 ? 0 : clamp((presentCells / totalCells) * 100);
  const consistency = rows.length <= 1
    ? 100
    : clamp(100 - (inconsistentIntervals / (rows.length - 1)) * 100);
  const anomalyRate = rows.length === 0 ? 1 : abnormalValues / (rows.length * 3);
  const anomalyScore = clamp(100 - anomalyRate * 100);
  const latestTimestamp = rows.length ? new Date(rows[rows.length - 1].timestamp).getTime() : uploadedAt;
  const delayHours = Math.max(0, (uploadedAt - latestTimestamp) / 3600000);
  const timeliness = clamp(100 - delayHours * 5);
  const buyerRatingScore = clamp((options.buyerRating || 5) * 20);
  const disputePenalty = options.disputePenalty || 0;
  const finalScore = clamp(
    0.30 * completeness +
    0.25 * consistency +
    0.20 * anomalyScore +
    0.15 * timeliness +
    0.10 * buyerRatingScore -
    disputePenalty
  );

  return {
    completeness,
    consistency,
    anomalyRate,
    anomalyScore,
    timeliness,
    buyerRatingScore,
    disputePenalty,
    finalScore
  };
}

module.exports = { scoreBatch };
