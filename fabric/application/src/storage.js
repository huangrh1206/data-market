const fs = require('fs');
const path = require('path');
const { sha256File, sha256Text } = require('./hash');

class LocalObjectStorage {
  constructor(rootDir) {
    this.rootDir = rootDir;
    fs.mkdirSync(rootDir, { recursive: true });
  }

  async put(filePath) {
    const dataHash = sha256File(filePath);
    const objectName = `${dataHash}${path.extname(filePath) || '.bin'}`;
    const target = path.join(this.rootDir, objectName);
    fs.copyFileSync(filePath, target);
    const storageUri = `local://${objectName}`;
    return {
      dataHash,
      storageUri,
      storageUriHash: sha256Text(storageUri)
    };
  }

  async get(storageUri) {
    const objectName = storageUri.replace('local://', '');
    return path.join(this.rootDir, objectName);
  }
}

module.exports = { LocalObjectStorage };
