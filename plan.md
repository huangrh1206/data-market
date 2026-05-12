# Q-DataMarket 论文与系统实施计划

> 论文题目：基于区块链的质量驱动型 IoT 数据访问权交易系统研究与实现
>
> 规则：每完成一个 Step，必须把本文件中对应的 `- [ ]` 改成 `- [x]`。

## 已完成规划阶段

- [x] Step 1: 探索当前项目上下文、本地文献目录、开源项目清单与可行方案约束。
- [x] Step 2: 从本地论文中挖掘研究空白和可落地创新点。
- [x] Step 3: 围绕开源项目与可行方案评估实现路线。
- [x] Step 4: 进行头脑风暴，提出 2-3 个论文方向并向用户确认。
- [x] Step 5: 根据用户选择细化论文设计方案，确认通用 IoT 批次数据访问权交易、质量驱动机制、押金仲裁机制和 Fabric/Caliper 性能评估路线。
- [x] Step 6: 写出设计规格与可执行实施计划。

## 设计文档

- 设计规格：`docs/superpowers/specs/2026-05-12-q-datamarket-design.md`
- 详细实施计划：`docs/superpowers/plans/2026-05-12-q-datamarket.md`
- 文献创新点笔记：`research-notes/innovation-points.md`
- 开源项目可行性笔记：`research-notes/open-source-feasibility.md`

## 后续执行阶段

### Task 1: 论文设计文档

- [ ] Step 1.1: 创建 `docs/thesis/outline.md`，写出 8 章论文结构和每章写作目标。
- [ ] Step 1.2: 创建 `docs/thesis/innovation.md`，写出 4 个学术创新点。
- [ ] Step 1.3: 创建 `docs/thesis/experiment-design.md`，写出 3 组实验设计、变量和指标。
- [ ] Step 1.4: 检查论文设计文档是否覆盖系统架构、质量机制、仲裁机制和性能评估。

### Task 2: IoT 批次数据与质量评分模块

- [ ] Step 2.1: 创建 `quality/score.test.js`，先写质量评分测试。
- [ ] Step 2.2: 运行 `node --test quality/score.test.js`，确认测试因实现缺失而失败。
- [ ] Step 2.3: 创建 `quality/score.js`，实现完整性、一致性、异常率、时效性、买家评分和争议惩罚计算。
- [ ] Step 2.4: 再次运行 `node --test quality/score.test.js`，确认测试通过。
- [ ] Step 2.5: 创建 `data/generator/generate_iot_batches.js`，生成高、中、低质量 IoT CSV 批次数据。
- [ ] Step 2.6: 运行数据生成脚本，确认 `data/samples/` 下生成 30 个样例文件。

### Task 3: Fabric 链码原型

- [ ] Step 3.1: 创建 `fabric/chaincode/qdatamarket/test/contract.test.js`，覆盖数据发布、下单、授权、确认、评价和仲裁。
- [ ] Step 3.2: 运行链码测试，确认测试因实现缺失而失败。
- [ ] Step 3.3: 创建链码 `package.json` 和入口文件。
- [ ] Step 3.4: 实现 `RegisterProduct()`、`ReadProduct()`、`CreateOrder()`、`ReadOrder()`。
- [ ] Step 3.5: 实现 `SellerAcceptOrder()`、`IssueAccessToken()`、`ConfirmDelivery()`、`SubmitRating()`。
- [ ] Step 3.6: 实现 `OpenDispute()` 和 `ResolveDispute()`。
- [ ] Step 3.7: 再次运行链码测试，确认测试通过。

### Task 4: Node.js API 与链下存储适配

- [ ] Step 4.1: 创建 `fabric/application/test/storage.test.js`，覆盖对象保存和哈希计算。
- [ ] Step 4.2: 运行 API 测试，确认测试因实现缺失而失败。
- [ ] Step 4.3: 创建 `fabric/application/src/hash.js`，实现 SHA-256 文件、文本和 Buffer 哈希。
- [ ] Step 4.4: 创建 `fabric/application/src/storage.js`，实现本地对象存储适配器。
- [ ] Step 4.5: 创建 `fabric/application/src/app.js`，实现健康检查、产品发布和订单创建 API 骨架。
- [ ] Step 4.6: 再次运行 API 测试，确认测试通过。

### Task 5: Caliper 性能评估配置

- [ ] Step 5.1: 创建 `caliper/benchmarks/qdatamarket.yaml`，定义发布、下单、确认和争议测试轮次。
- [ ] Step 5.2: 创建 `caliper/workloads/registerProduct.js`。
- [ ] Step 5.3: 创建 `caliper/workloads/createOrder.js`。
- [ ] Step 5.4: 创建 `caliper/workloads/confirmDelivery.js`。
- [ ] Step 5.5: 创建 `caliper/workloads/dispute.js`。
- [ ] Step 5.6: 检查 Caliper 配置和 workload 文件完整性。

### Task 6: 实验结果模板与论文初稿

- [ ] Step 6.1: 创建 `results/README.md`，准备基础性能、质量机制和仲裁机制结果表。
- [ ] Step 6.2: 创建 `docs/thesis/chapter-1-introduction.md`，完成绪论初稿。
- [ ] Step 6.3: 创建 `docs/thesis/chapter-3-design.md`，完成系统设计章节初稿。
- [ ] Step 6.4: 创建 `docs/thesis/chapter-7-evaluation.md`，完成实验章节模板。
- [ ] Step 6.5: 检查论文初稿是否与系统实现、实验指标和创新点一致。

## 验证命令

```powershell
node --test quality/score.test.js
cd fabric/chaincode/qdatamarket; npm test
cd fabric/application; npm test
Get-ChildItem -Recurse caliper
rg -n "TBD|TODO|implement later|fill in details" .
```
