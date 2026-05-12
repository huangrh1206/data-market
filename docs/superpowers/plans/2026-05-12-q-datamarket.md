# Q-DataMarket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a thesis-first but runnable prototype of a quality-driven blockchain IoT data access-right trading system, with Fabric chaincode, off-chain storage integration, quality scoring, deposit arbitration, and Caliper performance evaluation.

**Architecture:** The system stores IoT batch data off-chain and records only hashes, metadata, orders, authorization-token hashes, quality scores, ratings, and dispute evidence on Hyperledger Fabric. A Node.js service coordinates Fabric SDK calls, off-chain storage, quality scoring, and Caliper workloads.

**Tech Stack:** Hyperledger Fabric Samples, Fabric chaincode, Node.js, MinIO or local object storage, Hyperledger Caliper, CSV/JSON IoT batch data, Markdown thesis documents.

---

## File Structure

- `docs/superpowers/specs/2026-05-12-q-datamarket-design.md`: confirmed design specification.
- `plan.md`: user-facing execution checklist; every completed step must be changed from `- [ ]` to `- [x]`.
- `docs/thesis/outline.md`: thesis outline and chapter goals.
- `docs/thesis/innovation.md`: refined academic innovation points.
- `docs/thesis/experiment-design.md`: experiment variables, metrics, and expected tables.
- `fabric/chaincode/qdatamarket/`: Fabric chaincode for products, orders, quality, and disputes.
- `fabric/application/`: Node.js API and Fabric client scripts.
- `storage/`: local MinIO/IPFS abstraction and sample object metadata.
- `data/`: generated IoT CSV/JSON batch data and quality-injected variants.
- `quality/`: quality scoring module and tests.
- `caliper/`: Caliper network config, benchmark config, and workload modules.
- `results/`: benchmark outputs and summarized experiment tables.

---

## Completed Planning Steps

- [x] Step 1: 探索当前项目上下文、本地文献目录、开源项目清单与可行方案约束。
- [x] Step 2: 从本地论文中挖掘研究空白和可落地创新点。
- [x] Step 3: 围绕开源项目与可行方案评估实现路线。
- [x] Step 4: 进行头脑风暴，提出 2-3 个论文方向并向用户确认。
- [x] Step 5: 根据用户选择细化论文设计方案。
- [x] Step 6: 写出可执行论文/系统实施计划，并在后续每完成一步后更新本文件复选框。

---

## Task 1: Thesis Design Documents

**Files:**
- Create: `docs/thesis/outline.md`
- Create: `docs/thesis/innovation.md`
- Create: `docs/thesis/experiment-design.md`
- Modify: `plan.md`

- [ ] **Step 1: Write the thesis outline**

Create `docs/thesis/outline.md` with this structure:

```markdown
# 基于区块链的质量驱动型 IoT 数据访问权交易系统研究与实现

## 第 1 章 绪论

说明 IoT 数据资产化、中心化数据交易平台的信任问题、区块链用于交易审计和自动结算的适用性，明确本文研究目标。

## 第 2 章 相关技术与研究现状

梳理区块链、Hyperledger Fabric、链上链下协同存储、IoT 数据市场、数据质量评价和公平交易机制。

## 第 3 章 系统需求分析与总体设计

定义参与方、功能需求、安全需求、性能需求、系统架构、核心数据结构和交易流程。

## 第 4 章 质量驱动的数据访问权交易机制

提出质量评分模型、卖家信誉模型、质量排序策略和价格推荐策略。

## 第 5 章 基于押金仲裁的公平交易机制

提出订单状态机、访问凭证、押金锁定、证据结构和争议处理算法。

## 第 6 章 系统实现

说明 Fabric 网络、链码、Node.js 服务、链下存储、质量评分模块和 Caliper 工作负载。

## 第 7 章 实验与性能评估

完成基础性能测试、质量驱动机制有效性测试、押金仲裁机制有效性测试。

## 第 8 章 总结与展望

总结本文贡献，说明实时流订阅、隐私凭证和多链互操作等后续方向。
```

- [ ] **Step 2: Write the innovation document**

Create `docs/thesis/innovation.md` with this content:

```markdown
# 创新点设计

## 创新点 1：链上链下协同的 IoT 批次数据访问权交易模型

本文不将原始 IoT 数据直接写入区块链，而是将 CSV/JSON 批次数据保存到链下存储，并在链上保存 `metadataHash`、`dataHash`、`storageUriHash`、价格、订单状态和访问凭证哈希。该模型降低链上存储开销，同时保留可验证、可追溯和可审计能力。

## 创新点 2：质量评分与卖家信誉联合驱动的数据交易机制

本文从完整性、一致性、异常率、时效性和买家评价五个维度计算数据质量评分，并将争议记录作为惩罚项。质量评分与卖家信誉共同影响搜索排序和推荐价格，使高质量数据获得更高成交概率。

## 创新点 3：基于押金与链上证据的公平仲裁机制

本文设计订单状态机和押金锁定机制，将 `dataHash`、`accessTokenHash`、`deadline` 和 `evidenceHash` 作为链上证据。系统可处理哈希不一致、超时不确认、虚假争议和凭证过期访问等异常交易。

## 创新点 4：面向 Fabric 的可复现实验评估

本文基于 Hyperledger Fabric 实现原型系统，并使用 Hyperledger Caliper 对发布、购买、授权、确认、评价和仲裁交易进行性能测试，评估 TPS、平均延迟、P95 延迟、交易成功率和账本增长。
```

- [ ] **Step 3: Write the experiment design document**

Create `docs/thesis/experiment-design.md` with this content:

```markdown
# 实验设计

## 实验一：系统基础性能

交易类型包括 `RegisterProduct`、`CreateOrder`、`IssueAccessToken`、`ConfirmDelivery`、`SubmitRating`、`OpenDispute` 和 `ResolveDispute`。并发用户设置为 50、100、200、500。评价指标为 TPS、平均延迟、P95 延迟、成功率、CPU、内存、网络 IO 和账本大小增长。

## 实验二：质量驱动机制有效性

对比随机排序固定价格的基线方案和质量评分加卖家信誉排序的改进方案。评价指标为高质量数据成交占比、买家满意度评分、争议率和平均成交质量分。

## 实验三：押金仲裁机制有效性

模拟卖家上传哈希不一致数据、买家下载成功但拒绝确认、买家发起虚假争议、访问凭证过期后重复访问四种异常。评价指标为异常交易识别率、平均仲裁延迟、恶意行为损失成本和正常交易成功率。
```

- [ ] **Step 4: Mark Task 1 complete in `plan.md`**

Change Task 1 checklist items in `plan.md` from `- [ ]` to `- [x]` after the three files are written.

---

## Task 2: IoT Batch Data and Quality Scoring

**Files:**
- Create: `data/generator/generate_iot_batches.js`
- Create: `quality/score.js`
- Create: `quality/score.test.js`
- Create: `data/samples/`
- Modify: `plan.md`

- [ ] **Step 1: Write failing tests for quality scoring**

Create `quality/score.test.js`:

```javascript
const { scoreBatch } = require('./score');

test('scores a complete and consistent batch highly', () => {
  const rows = [
    { timestamp: '2026-05-01T00:00:00Z', temperature: 20, humidity: 50, status: 'OK' },
    { timestamp: '2026-05-01T00:01:00Z', temperature: 21, humidity: 51, status: 'OK' },
    { timestamp: '2026-05-01T00:02:00Z', temperature: 22, humidity: 52, status: 'OK' }
  ];
  const result = scoreBatch(rows, { uploadedAt: '2026-05-01T00:03:00Z', expectedIntervalSeconds: 60 });
  expect(result.finalScore).toBeGreaterThanOrEqual(90);
  expect(result.completeness).toBe(100);
});

test('penalizes missing fields, inconsistent timestamps, and abnormal values', () => {
  const rows = [
    { timestamp: '2026-05-01T00:00:00Z', temperature: 20, humidity: 50, status: 'OK' },
    { timestamp: '2026-05-01T00:03:00Z', temperature: 999, humidity: null, status: 'BAD' },
    { timestamp: '2026-05-01T00:04:00Z', temperature: -200, humidity: 52, status: 'OK' }
  ];
  const result = scoreBatch(rows, { uploadedAt: '2026-05-02T00:00:00Z', expectedIntervalSeconds: 60 });
  expect(result.finalScore).toBeLessThan(75);
  expect(result.anomalyRate).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test quality/score.test.js`

Expected: FAIL because `quality/score.js` does not exist.

- [ ] **Step 3: Implement quality scoring**

Create `quality/score.js`:

```javascript
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
    if (!Number.isFinite(temperature) || temperature < -50 || temperature > 80) abnormalValues += 1;
    if (!Number.isFinite(humidity) || humidity < 0 || humidity > 100) abnormalValues += 1;
    if (!['OK', 'WARN'].includes(row.status)) abnormalValues += 1;

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
  const consistency = rows.length <= 1 ? 100 : clamp(100 - (inconsistentIntervals / (rows.length - 1)) * 100);
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test quality/score.test.js`

Expected: PASS with both tests passing.

- [ ] **Step 5: Create IoT batch generator**

Create `data/generator/generate_iot_batches.js`:

```javascript
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
    if (quality === 'medium' && i % 20 === 0) row.humidity = '';
    if (quality === 'low' && i % 10 === 0) row.temperature = 999;
    if (quality === 'low' && i % 15 === 0) row.status = 'BAD';
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
```

- [ ] **Step 6: Generate sample data**

Run: `node data/generator/generate_iot_batches.js`

Expected: 30 CSV files under `data/samples/`.

- [ ] **Step 7: Mark Task 2 complete in `plan.md`**

Change Task 2 checklist items in `plan.md` from `- [ ]` to `- [x]`.

---

## Task 3: Fabric Chaincode Prototype

**Files:**
- Create: `fabric/chaincode/qdatamarket/package.json`
- Create: `fabric/chaincode/qdatamarket/index.js`
- Create: `fabric/chaincode/qdatamarket/lib/contract.js`
- Create: `fabric/chaincode/qdatamarket/test/contract.test.js`
- Modify: `plan.md`

- [ ] **Step 1: Write chaincode contract tests**

Create `fabric/chaincode/qdatamarket/test/contract.test.js`:

```javascript
const { QDataMarketContract } = require('../lib/contract');

function mockCtx() {
  const state = new Map();
  return {
    stub: {
      async putState(key, value) { state.set(key, value); },
      async getState(key) { return state.get(key) || Buffer.alloc(0); },
      async getStateByRange() {
        const entries = Array.from(state.entries()).map(([key, value]) => ({ key, value }));
        return {
          async *[Symbol.asyncIterator]() {
            for (const entry of entries) yield entry;
          }
        };
      }
    },
    clientIdentity: {
      getID() { return 'x509::CN=buyer'; }
    }
  };
}

test('registers a product and creates an order', async () => {
  const contract = new QDataMarketContract();
  const ctx = mockCtx();
  await contract.RegisterProduct(ctx, 'p1', 'seller1', 'device1', '2026-05-01T00:00:00Z/2026-05-01T01:00:00Z', 'mh', 'dh', 'sh', '100', '95');
  const product = JSON.parse(await contract.ReadProduct(ctx, 'p1'));
  expect(product.status).toBe('Listed');
  await contract.CreateOrder(ctx, 'o1', 'p1', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  const order = JSON.parse(await contract.ReadOrder(ctx, 'o1'));
  expect(order.status).toBe('Ordered');
});

test('handles access, confirmation, rating, and dispute', async () => {
  const contract = new QDataMarketContract();
  const ctx = mockCtx();
  await contract.RegisterProduct(ctx, 'p2', 'seller1', 'device1', 'range', 'mh', 'dh', 'sh', '100', '90');
  await contract.CreateOrder(ctx, 'o2', 'p2', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  await contract.SellerAcceptOrder(ctx, 'o2');
  await contract.IssueAccessToken(ctx, 'o2', 'tokenHash');
  await contract.ConfirmDelivery(ctx, 'o2', 'dh');
  await contract.SubmitRating(ctx, 'o2', '5');
  const settled = JSON.parse(await contract.ReadOrder(ctx, 'o2'));
  expect(settled.status).toBe('Rated');

  await contract.RegisterProduct(ctx, 'p3', 'seller1', 'device1', 'range', 'mh', 'dh', 'sh', '100', '90');
  await contract.CreateOrder(ctx, 'o3', 'p3', 'buyer1', '100', '10', '10', '2026-05-02T00:00:00Z');
  await contract.OpenDispute(ctx, 'd1', 'o3', 'HASH_MISMATCH', 'evidenceHash');
  await contract.ResolveDispute(ctx, 'd1', 'BUYER_REFUND', '10');
  const disputed = JSON.parse(await contract.ReadOrder(ctx, 'o3'));
  expect(disputed.status).toBe('Refunded');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd fabric/chaincode/qdatamarket; npm test`

Expected: FAIL because the contract implementation does not exist.

- [ ] **Step 3: Implement chaincode package**

Create `fabric/chaincode/qdatamarket/package.json`:

```json
{
  "name": "qdatamarket-chaincode",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node --test test/*.test.js",
    "start": "fabric-chaincode-node start"
  },
  "dependencies": {
    "fabric-contract-api": "^2.5.4"
  },
  "devDependencies": {}
}
```

- [ ] **Step 4: Implement chaincode entry point**

Create `fabric/chaincode/qdatamarket/index.js`:

```javascript
'use strict';

const { QDataMarketContract } = require('./lib/contract');

module.exports.contracts = [QDataMarketContract];
```

- [ ] **Step 5: Implement chaincode contract**

Create `fabric/chaincode/qdatamarket/lib/contract.js`:

```javascript
'use strict';

let Contract;
try {
  ({ Contract } = require('fabric-contract-api'));
} catch {
  Contract = class {};
}

class QDataMarketContract extends Contract {
  async RegisterProduct(ctx, productId, sellerId, deviceId, timeRange, metadataHash, dataHash, storageUriHash, price, qualityScore) {
    const product = {
      productId,
      sellerId,
      deviceId,
      timeRange,
      metadataHash,
      dataHash,
      storageUriHash,
      price: Number(price),
      qualityScore: Number(qualityScore),
      status: 'Listed',
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`PRODUCT_${productId}`, Buffer.from(JSON.stringify(product)));
    return JSON.stringify(product);
  }

  async ReadProduct(ctx, productId) {
    const bytes = await ctx.stub.getState(`PRODUCT_${productId}`);
    if (!bytes || bytes.length === 0) throw new Error(`Product ${productId} not found`);
    return bytes.toString();
  }

  async CreateOrder(ctx, orderId, productId, buyerId, price, buyerDeposit, sellerDeposit, deadline) {
    const product = JSON.parse(await this.ReadProduct(ctx, productId));
    const order = {
      orderId,
      productId,
      buyerId,
      sellerId: product.sellerId,
      price: Number(price),
      buyerDeposit: Number(buyerDeposit),
      sellerDeposit: Number(sellerDeposit),
      accessTokenHash: '',
      status: 'Ordered',
      deadline,
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async ReadOrder(ctx, orderId) {
    const bytes = await ctx.stub.getState(`ORDER_${orderId}`);
    if (!bytes || bytes.length === 0) throw new Error(`Order ${orderId} not found`);
    return bytes.toString();
  }

  async SellerAcceptOrder(ctx, orderId) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.status = 'SellerAccepted';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async IssueAccessToken(ctx, orderId, accessTokenHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.accessTokenHash = accessTokenHash;
    order.status = 'AccessIssued';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async ConfirmDelivery(ctx, orderId, observedDataHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    const product = JSON.parse(await this.ReadProduct(ctx, order.productId));
    if (product.dataHash !== observedDataHash) throw new Error('DATA_HASH_MISMATCH');
    order.status = 'Settled';
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
  }

  async SubmitRating(ctx, orderId, rating) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    const product = JSON.parse(await this.ReadProduct(ctx, order.productId));
    const ratingValue = Number(rating);
    product.qualityScore = Math.max(0, Math.min(100, product.qualityScore * 0.9 + ratingValue * 20 * 0.1));
    order.status = 'Rated';
    await ctx.stub.putState(`PRODUCT_${product.productId}`, Buffer.from(JSON.stringify(product)));
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify({ order, product });
  }

  async OpenDispute(ctx, disputeId, orderId, reason, evidenceHash) {
    const order = JSON.parse(await this.ReadOrder(ctx, orderId));
    order.status = 'Disputed';
    const dispute = {
      disputeId,
      orderId,
      reason,
      evidenceHash,
      result: '',
      penalty: 0,
      createdAt: new Date().toISOString()
    };
    await ctx.stub.putState(`ORDER_${orderId}`, Buffer.from(JSON.stringify(order)));
    await ctx.stub.putState(`DISPUTE_${disputeId}`, Buffer.from(JSON.stringify(dispute)));
    return JSON.stringify(dispute);
  }

  async ResolveDispute(ctx, disputeId, result, penalty) {
    const bytes = await ctx.stub.getState(`DISPUTE_${disputeId}`);
    if (!bytes || bytes.length === 0) throw new Error(`Dispute ${disputeId} not found`);
    const dispute = JSON.parse(bytes.toString());
    const order = JSON.parse(await this.ReadOrder(ctx, dispute.orderId));
    dispute.result = result;
    dispute.penalty = Number(penalty);
    order.status = result === 'BUYER_REFUND' ? 'Refunded' : result === 'SELLER_PAID' ? 'Settled' : 'Penalized';
    await ctx.stub.putState(`DISPUTE_${disputeId}`, Buffer.from(JSON.stringify(dispute)));
    await ctx.stub.putState(`ORDER_${order.orderId}`, Buffer.from(JSON.stringify(order)));
    return JSON.stringify({ dispute, order });
  }
}

module.exports = { QDataMarketContract };
```

- [ ] **Step 6: Run chaincode tests to verify they pass**

Run: `cd fabric/chaincode/qdatamarket; npm test`

Expected: PASS with both chaincode tests passing.

- [ ] **Step 7: Mark Task 3 complete in `plan.md`**

Change Task 3 checklist items in `plan.md` from `- [ ]` to `- [x]`.

---

## Task 4: Node.js API and Off-Chain Storage Adapter

**Files:**
- Create: `fabric/application/package.json`
- Create: `fabric/application/src/storage.js`
- Create: `fabric/application/src/hash.js`
- Create: `fabric/application/src/app.js`
- Create: `fabric/application/test/storage.test.js`
- Modify: `plan.md`

- [ ] **Step 1: Write storage and hash tests**

Create `fabric/application/test/storage.test.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { sha256File } = require('../src/hash');
const { LocalObjectStorage } = require('../src/storage');

test('stores an object and returns deterministic hashes', async () => {
  const root = path.join(__dirname, '..', '..', '..', 'storage', 'objects-test');
  fs.rmSync(root, { recursive: true, force: true });
  const storage = new LocalObjectStorage(root);
  const filePath = path.join(root, 'input.csv');
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(filePath, 'deviceId,timestamp\n1,2026-05-01T00:00:00Z\n');
  const hash = sha256File(filePath);
  const result = await storage.put(filePath);
  expect(result.dataHash).toBe(hash);
  expect(result.storageUriHash.length).toBe(64);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd fabric/application; npm test`

Expected: FAIL because source files do not exist.

- [ ] **Step 3: Implement application package**

Create `fabric/application/package.json`:

```json
{
  "name": "qdatamarket-application",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "test": "node --test test/*.test.js",
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.18.3"
  }
}
```

- [ ] **Step 4: Implement hash helper**

Create `fabric/application/src/hash.js`:

```javascript
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
```

- [ ] **Step 5: Implement local storage adapter**

Create `fabric/application/src/storage.js`:

```javascript
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
```

- [ ] **Step 6: Implement API skeleton**

Create `fabric/application/src/app.js`:

```javascript
const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'qdatamarket' });
});

app.post('/products', (req, res) => {
  res.status(202).json({ accepted: true, operation: 'RegisterProduct', body: req.body });
});

app.post('/orders', (req, res) => {
  res.status(202).json({ accepted: true, operation: 'CreateOrder', body: req.body });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`qdatamarket api listening on ${port}`));
}

module.exports = { app };
```

- [ ] **Step 7: Run API tests to verify they pass**

Run: `cd fabric/application; npm test`

Expected: PASS with storage test passing.

- [ ] **Step 8: Mark Task 4 complete in `plan.md`**

Change Task 4 checklist items in `plan.md` from `- [ ]` to `- [x]`.

---

## Task 5: Caliper Benchmark Workloads

**Files:**
- Create: `caliper/benchmarks/qdatamarket.yaml`
- Create: `caliper/workloads/registerProduct.js`
- Create: `caliper/workloads/createOrder.js`
- Create: `caliper/workloads/confirmDelivery.js`
- Create: `caliper/workloads/dispute.js`
- Modify: `plan.md`

- [ ] **Step 1: Create benchmark configuration**

Create `caliper/benchmarks/qdatamarket.yaml`:

```yaml
test:
  name: qdatamarket
  description: Q-DataMarket Fabric benchmark
  workers:
    number: 4
  rounds:
    - label: register-product
      txDuration: 60
      rateControl:
        type: fixed-load
        opts:
          transactionLoad: 50
      workload:
        module: ../workloads/registerProduct.js
    - label: create-order
      txDuration: 60
      rateControl:
        type: fixed-load
        opts:
          transactionLoad: 100
      workload:
        module: ../workloads/createOrder.js
    - label: confirm-delivery
      txDuration: 60
      rateControl:
        type: fixed-load
        opts:
          transactionLoad: 100
      workload:
        module: ../workloads/confirmDelivery.js
    - label: dispute
      txDuration: 60
      rateControl:
        type: fixed-load
        opts:
          transactionLoad: 20
      workload:
        module: ../workloads/dispute.js
```

- [ ] **Step 2: Create register product workload**

Create `caliper/workloads/registerProduct.js`:

```javascript
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class RegisterProductWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const args = [`p-${id}`, `seller-${this.workerIndex}`, `device-${id}`, '2026-05-01T00:00:00Z/2026-05-01T01:00:00Z', `mh-${id}`, `dh-${id}`, `sh-${id}`, '100', '90'];
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'RegisterProduct',
      invokerIdentity: 'User1',
      contractArguments: args,
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new RegisterProductWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

- [ ] **Step 3: Create order workload**

Create `caliper/workloads/createOrder.js`:

```javascript
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CreateOrderWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'CreateOrder',
      invokerIdentity: 'User1',
      contractArguments: [`o-${id}`, `p-seeded-${this.workerIndex}`, `buyer-${this.workerIndex}`, '100', '10', '10', '2026-05-02T00:00:00Z'],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new CreateOrderWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

- [ ] **Step 4: Create confirmation workload**

Create `caliper/workloads/confirmDelivery.js`:

```javascript
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ConfirmDeliveryWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = Math.floor(Math.random() * 1000);
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'ConfirmDelivery',
      invokerIdentity: 'User1',
      contractArguments: [`o-seeded-${id}`, `dh-seeded-${id}`],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new ConfirmDeliveryWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

- [ ] **Step 5: Create dispute workload**

Create `caliper/workloads/dispute.js`:

```javascript
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class DisputeWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const id = `${this.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await this.sutAdapter.sendRequests({
      contractId: 'qdatamarket',
      contractFunction: 'OpenDispute',
      invokerIdentity: 'User1',
      contractArguments: [`d-${id}`, `o-seeded-${this.workerIndex}`, 'HASH_MISMATCH', `eh-${id}`],
      readOnly: false
    });
  }
}

function createWorkloadModule() {
  return new DisputeWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

- [ ] **Step 6: Run Caliper dry validation**

Run: `Get-ChildItem -Recurse caliper`

Expected: benchmark YAML and four workload files exist. Full Caliper execution requires Fabric network setup and dependency installation.

- [ ] **Step 7: Mark Task 5 complete in `plan.md`**

Change Task 5 checklist items in `plan.md` from `- [ ]` to `- [x]`.

---

## Task 6: Experiment Results and Thesis Draft

**Files:**
- Create: `results/README.md`
- Create: `docs/thesis/chapter-1-introduction.md`
- Create: `docs/thesis/chapter-3-design.md`
- Create: `docs/thesis/chapter-7-evaluation.md`
- Modify: `plan.md`

- [ ] **Step 1: Create results README**

Create `results/README.md`:

```markdown
# 实验结果记录

## 基础性能结果表

| 并发用户 | TPS | 平均延迟 ms | P95 延迟 ms | 成功率 | 账本增长 MB |
|---:|---:|---:|---:|---:|---:|
| 50 |  |  |  |  |  |
| 100 |  |  |  |  |  |
| 200 |  |  |  |  |  |
| 500 |  |  |  |  |  |

## 质量机制对比结果表

| 方案 | 高质量数据成交占比 | 平均成交质量分 | 争议率 | 买家满意度 |
|---|---:|---:|---:|---:|
| Baseline |  |  |  |  |
| Q-Score |  |  |  |  |

## 仲裁机制结果表

| 异常场景 | 识别率 | 平均仲裁延迟 ms | 恶意行为损失成本 | 正常交易成功率 |
|---|---:|---:|---:|---:|
| 哈希不一致 |  |  |  |  |
| 超时不确认 |  |  |  |  |
| 虚假争议 |  |  |  |  |
| 凭证过期访问 |  |  |  |  |
```

- [ ] **Step 2: Draft chapter 1**

Create `docs/thesis/chapter-1-introduction.md` with sections:

```markdown
# 第 1 章 绪论

## 1.1 研究背景

IoT 设备持续产生大量时序数据，这些数据在工业监测、城市治理、环境感知和设备运维中具有复用价值。传统数据交易平台依赖中心化机构撮合和结算，存在单点故障、交易不透明、数据质量难验证和访问授权难追踪等问题。

## 1.2 研究意义

区块链具备不可篡改、可追溯和智能合约自动执行能力，适合记录数据访问权交易过程。通过链上链下协同，可以避免原始数据直接上链带来的存储和隐私问题。

## 1.3 研究内容

本文设计并实现 Q-DataMarket，围绕 IoT 批次数据访问权交易，研究质量评分、信誉排序、押金仲裁和性能评估。

## 1.4 主要贡献

本文贡献包括链上链下协同交易模型、质量信誉联合驱动机制、押金证据仲裁机制，以及基于 Fabric 和 Caliper 的原型实现与实验评估。
```

- [ ] **Step 3: Draft chapter 3**

Create `docs/thesis/chapter-3-design.md` with system architecture, data models, and transaction flow from the design specification.

- [ ] **Step 4: Draft chapter 7**

Create `docs/thesis/chapter-7-evaluation.md` with experiment setup, metrics, tables, and analysis templates matching `results/README.md`.

- [ ] **Step 5: Mark Task 6 complete in `plan.md`**

Change Task 6 checklist items in `plan.md` from `- [ ]` to `- [x]`.

---

## Verification Commands

- `node --test quality/score.test.js`
- `cd fabric/chaincode/qdatamarket; npm test`
- `cd fabric/application; npm test`
- `Get-ChildItem -Recurse caliper`
- `rg -n "TBD|TODO|implement later|fill in details" .`

## Execution Notes

- Install Fabric Samples and Caliper only when implementation starts and dependency downloads are approved.
- Keep original IoT data off-chain; never put raw CSV/JSON rows in Fabric world state.
- Update `plan.md` after every completed step by changing the corresponding checkbox from `- [ ]` to `- [x]`.
