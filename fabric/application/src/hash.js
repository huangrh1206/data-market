const crypto = require('crypto');
const fs = require('fs');

function sha256Buffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function sha256Text(text) {
  return sha256Buffer(Buffer.from(text));
}

module.exports = { sha256Buffer, sha256File, sha256Text };
