# Q-DataMarket Thesis Delivery Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩写第 2、4、5、6、8 章，把现有设计、代码实现和实验材料组织成可交付的论文初稿。

**Architecture:** 论文正文以 `docs/thesis/outline.md` 为章节骨架，以 `docs/thesis/innovation.md`、`docs/thesis/experiment-design.md`、`docs/thesis/chapter-3-design.md`、`docs/thesis/chapter-7-evaluation.md` 和系统源码为事实来源。每章使用 Markdown 独立文件承载，章节之间通过术语、模型、机制和实验结论保持一致。

**Tech Stack:** Markdown thesis documents, Hyperledger Fabric chaincode, Node.js application layer, quality scoring module, Caliper workload configuration, generated IoT CSV samples, Node.js test runner, ripgrep.

---

## File Structure

- `docs/thesis/chapter-2-related-work.md`: 第 2 章，相关技术与研究现状。
- `docs/thesis/chapter-4-quality-mechanism.md`: 第 4 章，质量驱动的数据访问权交易机制。
- `docs/thesis/chapter-5-arbitration.md`: 第 5 章，基于押金仲裁的公平交易机制。
- `docs/thesis/chapter-6-implementation.md`: 第 6 章，系统实现。
- `docs/thesis/chapter-8-conclusion.md`: 第 8 章，总结与展望。
- `docs/thesis/outline.md`: 章节目标参考，不在本计划中重写。
- `docs/thesis/innovation.md`: 创新点参考，不在本计划中重写。
- `docs/thesis/experiment-design.md`: 实验设计参考，不在本计划中重写。
- `docs/thesis/chapter-1-introduction.md`: 第 1 章参考，不在本计划中重写。
- `docs/thesis/chapter-3-design.md`: 第 3 章参考，不在本计划中重写。
- `docs/thesis/chapter-7-evaluation.md`: 第 7 章参考，不在本计划中重写。
- `quality/score.js`: 第 4、6 章质量评分实现依据。
- `fabric/chaincode/qdatamarket/lib/contract.js`: 第 5、6 章链码实现依据。
- `fabric/application/src/app.js`: 第 6 章 API 实现依据。
- `fabric/application/src/storage.js`: 第 6 章链下存储实现依据。
- `caliper/benchmarks/qdatamarket.yaml`: 第 6、7 章性能测试配置依据。
- `results/README.md`: 第 7、8 章实验结果依据。

---

## Writing Standards

- 每一章都写成论文正文，不写提纲式占位段落。
- 章节标题使用中文编号，例如 `# 第 2 章 相关技术与研究现状`。
- 每章至少包含 5 个二级小节，且小节之间要形成“背景介绍 -> 问题分析 -> 本文方案承接”的逻辑链。
- 不使用 `TBD`、`TODO`、`implement later`、`fill in details` 这类占位词。
- 不虚构真实外部实验结果。第 7 章已说明当前基础性能值来自本地原型基准和 Caliper workload 配置推导；第 6、8 章应保持同一口径。
- 每次完成一个批次后必须运行验证命令、提交改动，并在回复中给出下一步工作。

---

## Task 1: Expand Chapters 2 and 8

**Files:**
- Create: `docs/thesis/chapter-2-related-work.md`
- Create: `docs/thesis/chapter-8-conclusion.md`

- [ ] **Step 1: Write chapter 2 related work**

Create `docs/thesis/chapter-2-related-work.md` with these sections:

```markdown
# 第 2 章 相关技术与研究现状

## 2.1 区块链与智能合约技术

## 2.2 Hyperledger Fabric 联盟链架构

## 2.3 链上链下协同存储技术

## 2.4 IoT 数据市场与访问权交易

## 2.5 数据质量评价方法

## 2.6 公平交易与争议仲裁机制

## 2.7 现有研究不足

## 2.8 本章小结
```

The chapter must connect existing research gaps to this thesis: access-right trading instead of ownership transfer, quality-driven ranking, deposit arbitration, and reproducible Fabric-based evaluation.

- [ ] **Step 2: Write chapter 8 conclusion**

Create `docs/thesis/chapter-8-conclusion.md` with these sections:

```markdown
# 第 8 章 总结与展望

## 8.1 本文工作总结

## 8.2 主要创新点

## 8.3 实验结果总结

## 8.4 系统局限性

## 8.5 后续研究方向
```

The chapter must explicitly summarize results from `docs/thesis/chapter-7-evaluation.md`: TPS trend, quality mechanism improvement, and arbitration mechanism effectiveness.

- [ ] **Step 3: Verify chapter text has no placeholders**

Run:

```powershell
rg -n "TBD|TODO|implement later|fill in details" docs/thesis/chapter-2-related-work.md docs/thesis/chapter-8-conclusion.md
```

Expected: no matches.

- [ ] **Step 4: Commit chapter 2 and chapter 8**

Run:

```powershell
git add docs/thesis/chapter-2-related-work.md docs/thesis/chapter-8-conclusion.md
git commit -m "docs: expand related work and conclusion chapters"
```

- [ ] **Step 5: Report next step**

In the completion response, include:

```text
下一步：扩写第 4 章和第 5 章，把质量驱动机制与押金仲裁机制写成论文核心章节。
```

---

## Task 2: Expand Chapters 4 and 5

**Files:**
- Create: `docs/thesis/chapter-4-quality-mechanism.md`
- Create: `docs/thesis/chapter-5-arbitration.md`

- [ ] **Step 1: Write chapter 4 quality mechanism**

Create `docs/thesis/chapter-4-quality-mechanism.md` with these sections:

```markdown
# 第 4 章 质量驱动的数据访问权交易机制

## 4.1 问题定义

## 4.2 IoT 批次数据质量指标体系

## 4.3 质量评分模型

## 4.4 卖家信誉更新机制

## 4.5 质量驱动排序策略

## 4.6 推荐价格调整策略

## 4.7 机制流程分析

## 4.8 本章小结
```

The chapter must align with `quality/score.js`: completeness, consistency, anomaly rate, timeliness, buyer rating, and dispute penalty.

- [ ] **Step 2: Write chapter 5 arbitration mechanism**

Create `docs/thesis/chapter-5-arbitration.md` with these sections:

```markdown
# 第 5 章 基于押金仲裁的公平交易机制

## 5.1 公平交易问题分析

## 5.2 订单状态机

## 5.3 押金锁定与释放规则

## 5.4 访问凭证与证据结构

## 5.5 异常场景仲裁规则

## 5.6 机制安全性分析

## 5.7 本章小结
```

The chapter must align with `fabric/chaincode/qdatamarket/lib/contract.js`: product registration, order creation, seller acceptance, access token issuing, delivery confirmation, rating submission, dispute opening, and dispute resolution.

- [ ] **Step 3: Verify mechanism chapters and implementation tests**

Run:

```powershell
rg -n "TBD|TODO|implement later|fill in details" docs/thesis/chapter-4-quality-mechanism.md docs/thesis/chapter-5-arbitration.md
node --test quality\score.test.js
npm.cmd test
```

Run `npm.cmd test` from:

```text
fabric/chaincode/qdatamarket
```

Expected:
- Placeholder scan returns no matches.
- Quality tests pass.
- Chaincode tests pass.

- [ ] **Step 4: Commit chapter 4 and chapter 5**

Run:

```powershell
git add docs/thesis/chapter-4-quality-mechanism.md docs/thesis/chapter-5-arbitration.md
git commit -m "docs: expand quality and arbitration mechanism chapters"
```

- [ ] **Step 5: Report next step**

In the completion response, include:

```text
下一步：扩写第 6 章，按代码结构说明 Fabric 链码、Node.js 服务、链下存储、质量评分、数据生成和 Caliper workload 的实现。
```

---

## Task 3: Expand Chapter 6

**Files:**
- Create: `docs/thesis/chapter-6-implementation.md`

- [ ] **Step 1: Write chapter 6 implementation**

Create `docs/thesis/chapter-6-implementation.md` with these sections:

```markdown
# 第 6 章 系统实现

## 6.1 原型系统实现环境

## 6.2 系统模块划分

## 6.3 Fabric 链码实现

## 6.4 Node.js 服务层实现

## 6.5 链下对象存储实现

## 6.6 质量评分模块实现

## 6.7 IoT 批次数据生成实现

## 6.8 Caliper 性能测试配置实现

## 6.9 测试与验证

## 6.10 本章小结
```

The chapter must reference concrete modules and behavior from:
- `fabric/chaincode/qdatamarket/lib/contract.js`
- `fabric/application/src/app.js`
- `fabric/application/src/hash.js`
- `fabric/application/src/storage.js`
- `quality/score.js`
- `data/generator/generate_iot_batches.js`
- `caliper/benchmarks/qdatamarket.yaml`
- `caliper/workloads/*.js`

- [ ] **Step 2: Verify implementation chapter and all tests**

Run:

```powershell
rg -n "TBD|TODO|implement later|fill in details" docs/thesis/chapter-6-implementation.md
node --test quality\score.test.js results\evaluation_metrics.test.js
npm.cmd test
```

Run `npm.cmd test` once from:

```text
fabric/chaincode/qdatamarket
```

Run `npm.cmd test` once from:

```text
fabric/application
```

Expected:
- Placeholder scan returns no matches.
- Quality and evaluation tests pass.
- Chaincode tests pass.
- Application tests pass.

- [ ] **Step 3: Commit chapter 6**

Run:

```powershell
git add docs/thesis/chapter-6-implementation.md
git commit -m "docs: expand implementation chapter"
```

- [ ] **Step 4: Report next step**

In the completion response, include:

```text
下一步：执行论文全局一致性检查，统一章节术语、文件命名、实验口径和创新点表述。
```

---

## Task 4: Global Thesis Consistency Pass

**Files:**
- Modify: `docs/thesis/chapter-1-introduction.md`
- Modify: `docs/thesis/chapter-2-related-work.md`
- Modify: `docs/thesis/chapter-3-design.md`
- Modify: `docs/thesis/chapter-4-quality-mechanism.md`
- Modify: `docs/thesis/chapter-5-arbitration.md`
- Modify: `docs/thesis/chapter-6-implementation.md`
- Modify: `docs/thesis/chapter-7-evaluation.md`
- Modify: `docs/thesis/chapter-8-conclusion.md`

- [ ] **Step 1: Check chapter set completeness**

Run:

```powershell
Get-ChildItem docs\thesis\chapter-*.md | Sort-Object Name
```

Expected chapter files:
- `chapter-1-introduction.md`
- `chapter-2-related-work.md`
- `chapter-3-design.md`
- `chapter-4-quality-mechanism.md`
- `chapter-5-arbitration.md`
- `chapter-6-implementation.md`
- `chapter-7-evaluation.md`
- `chapter-8-conclusion.md`

- [ ] **Step 2: Normalize key terms**

Use these terms consistently across all chapters:
- `Q-DataMarket`
- `IoT 批次数据`
- `数据访问权`
- `链上链下协同`
- `质量评分`
- `卖家信誉`
- `押金仲裁`
- `访问凭证`
- `Hyperledger Fabric`
- `Hyperledger Caliper`

- [ ] **Step 3: Check placeholder and contradiction risks**

Run:

```powershell
rg -n "TBD|TODO|implement later|fill in details" docs/thesis
rg -n "所有权|访问权|Caliper|原型|推导|真实测试网络" docs/thesis
```

Expected:
- No placeholder matches.
- The second command is manually reviewed so that ownership and access-right language is not mixed incorrectly, and experiment scope is described consistently.

- [ ] **Step 4: Run final verification**

Run:

```powershell
node --test quality\score.test.js results\evaluation_metrics.test.js
npm.cmd test
```

Run `npm.cmd test` once from:

```text
fabric/chaincode/qdatamarket
```

Run `npm.cmd test` once from:

```text
fabric/application
```

Expected:
- Quality and evaluation tests pass.
- Chaincode tests pass.
- Application tests pass.

- [ ] **Step 5: Commit global consistency pass**

Run:

```powershell
git add docs/thesis
git commit -m "docs: align thesis chapters for delivery"
```

- [ ] **Step 6: Report next step**

In the completion response, include:

```text
下一步：根据学校格式要求处理目录、摘要、参考文献、图表编号和最终排版。
```

---

## Completion Rule

After every task:

1. Report files created or modified.
2. Report verification commands and results.
3. Report commit hash if a commit was made.
4. Report the next step as a concrete action, not an open-ended question.
