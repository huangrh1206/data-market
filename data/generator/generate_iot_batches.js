const fs = require('fs');
const path = require('path');

function generateBatch(deviceId, start, count, quality) {
  const rows = [];
  const startTime = new Date(start).getTime();

  for (let i = 0; i < count; i += 1) {
    const timestamp = new Date(startTime + i * 60000).toISOString();
    const row = {
      deviceId,
      timestamp,
      temperature: 20 + (i % 10),
      humidity: 45 + (i % 20),
      status: 'OK'
    };

    if (quality === 'medium' && i % 20 === 0) {
      row.humidity = '';
    }
    if (quality === 'low' && i % 10 === 0) {
      row.temperature = 999;
    }
    if (quality === 'low' && i % 15 === 0) {
      row.status = 'BAD';
    }

    rows.push(row);
  }

  return rows;
}

function toCsv(rows) {
  const header = ['deviceId', 'timestamp', 'temperature', 'humidity', 'status'];
  return [header.join(','), ...rows.map(row => header.map(key => row[key]).join(','))].join('\n');
}

const outDir = path.join(__dirname, '..', 'samples');
fs.mkdirSync(outDir, { recursive: true });

for (const quality of ['high', 'medium', 'low']) {
  for (let i = 1; i <= 10; i += 1) {
    const rows = generateBatch(`device-${i}`, '2026-05-01T00:00:00Z', 120, quality);
    fs.writeFileSync(path.join(outDir, `${quality}-device-${i}.csv`), toCsv(rows));
  }
}
