# Q-DataMarket 设计规格

## 题目

基于区块链的质量驱动型 IoT 数据访问权交易系统研究与实现

## 研究定位

本文面向通用 IoT 批次时序数据交易场景，研究一种链上链下协同的数据访问权交易系统。系统不直接交易或上链保存原始数据，而是交易指定设备、指定时间窗口内 IoT 数据批次的访问权。原始 CSV/JSON 数据存放在链下对象存储中，区块链负责保存数据摘要、价格、订单状态、授权凭证摘要、质量评分、信誉记录和争议证据。

系统目标是在满足硕士论文工程可落地性的前提下，体现三个创新点：质量驱动的数据交易机制、链上链下协同的数据访问权交易模型、基于押金和链上证据的公平仲裁机制。

## 研究问题

1. IoT 数据交易中，如何避免原始数据直接上链导致的存储成本、隐私泄露和性能下降问题。
2. 如何设计可复现的数据质量评分模型，使高质量数据在交易中获得更高曝光和更好信誉。
3. 如何在买卖双方互不完全信任的情况下，通过押金、订单状态机和证据哈希约束恶意行为。
4. 如何基于 Hyperledger Fabric 和 Caliper 实现系统原型，并通过性能实验验证系统可行性。

## 系统边界

本文只实现批次型 IoT 数据访问权交易，不实现实时数据流订阅。数据产品的最小交易单元是一个 IoT 设备在一个时间窗口内产生的 CSV/JSON 数据文件。隐私身份认证采用普通 Fabric 身份与角色控制，不实现完整可验证凭证、零知识证明或代理重加密。

## 总体架构

系统采用五层架构：

1. 数据层：通用 IoT 批次数据，字段包括设备编号、时间戳、传感器类型、传感器数值和状态码。
2. 链下存储层：MinIO 或 IPFS 保存数据本体，系统计算 `dataHash`、`metadataHash` 和 `storageUriHash`。
3. 区块链层：Hyperledger Fabric 网络保存数据产品、订单、授权凭证摘要、质量记录和争议记录。
4. 服务层：Node.js API 对接 Fabric SDK、链下存储、质量评分模块和访问授权模块。
5. 评估层：Hyperledger Caliper 调用链码接口，执行性能测试和机制有效性实验。

## 核心数据模型

```text
DataProduct:
  productId
  sellerId
  deviceId
  timeRange
  metadataHash
  dataHash
  storageUriHash
  price
  qualityScore
  status
  createdAt

Order:
  orderId
  productId
  buyerId
  price
  buyerDeposit
  sellerDeposit
  accessTokenHash
  status
  deadline
  createdAt

QualityRecord:
  productId
  completeness
  consistency
  anomalyRate
  timeliness
  buyerRating
  disputePenalty
  finalScore

Dispute:
  disputeId
  orderId
  reason
  evidenceHash
  result
  penalty
  createdAt
```

## 核心链码接口

```text
RegisterProduct()
UpdateQualityScore()
QueryProducts()
CreateOrder()
SellerAcceptOrder()
IssueAccessToken()
ConfirmDelivery()
SubmitRating()
OpenDispute()
ResolveDispute()
```

## 交易流程

1. 数据发布：卖家上传 IoT 批次数据到链下存储，系统计算哈希和初始质量评分，链上登记数据产品。
2. 数据检索与排序：买家按设备、时间范围、字段类型和质量阈值检索产品，系统按质量评分和卖家信誉排序。
3. 下单与押金锁定：买家创建订单并锁定价格和买方押金，卖家确认订单并锁定卖方押金。
4. 访问授权：系统生成访问凭证，链上保存凭证哈希，链下服务按凭证提供限时下载权限。
5. 确认结算与评价：买家校验 `dataHash` 后确认收货，链码结算交易并允许提交评分。
6. 争议仲裁：下载失败、哈希不一致、超时未确认或恶意争议时，链码根据证据哈希、订单状态和超时信息完成退款、结算或扣罚。

## 质量评分模型

质量评分由五部分组成：

```text
finalScore =
  0.30 * completeness
+ 0.25 * consistency
+ 0.20 * anomalyScore
+ 0.15 * timeliness
+ 0.10 * buyerRatingScore
- disputePenalty
```

指标定义：

- `completeness`：字段完整率和时间点完整率的加权平均。
- `consistency`：采样间隔稳定性和时间戳单调性的综合评分。
- `anomalyScore`：越界值、突变值和非法状态码占比转换后的评分。
- `timeliness`：数据产生时间到上架时间的延迟评分。
- `buyerRatingScore`：买家交易后评价的归一化结果。
- `disputePenalty`：争议成立后的扣分。

## 押金仲裁模型

订单状态包括：

```text
Listed
Ordered
SellerAccepted
AccessIssued
Delivered
Rated
Disputed
Settled
Refunded
Penalized
```

仲裁规则：

- 买家在期限内确认且未发起争议，系统向卖家结算价格并返还双方押金。
- 买家下载后发现数据哈希不一致，可以提交证据哈希并发起争议；若争议成立，买家退款，卖家扣押金。
- 买家下载成功但超时不确认，系统按自动确认处理，向卖家结算并扣除买方部分押金。
- 买家发起虚假争议，系统结算给卖家并扣除买方押金。
- 访问凭证过期后重复访问，链下服务拒绝访问，链上记录失败事件。

## 实验设计

实验一：系统基础性能测试。

- 交易类型：数据发布、下单购买、授权访问、确认结算、提交评价、发起争议、处理争议。
- 指标：TPS、平均延迟、P95 延迟、成功率、CPU、内存、网络 IO、账本大小增长。
- 变量：并发用户数 50、100、200、500；交易比例为发布 20%、购买 40%、授权 15%、确认 15%、评价 8%、争议 2%。

实验二：质量驱动机制有效性测试。

- 对比方案：随机排序和固定价格作为基线，质量评分加卖家信誉排序作为改进方案。
- 指标：高质量数据成交占比、买家满意度评分、争议率、平均成交质量分。

实验三：押金仲裁机制有效性测试。

- 模拟场景：卖家上传哈希不一致数据、买家下载成功但拒绝确认、买家发起虚假争议、访问凭证过期后重复访问。
- 指标：异常交易识别率、平均仲裁延迟、恶意行为损失成本、正常交易成功率。

## 论文结构

1. 绪论。
2. 相关技术与研究现状。
3. 系统需求分析与总体设计。
4. 质量驱动的数据访问权交易机制。
5. 基于押金仲裁的公平交易机制。
6. 系统实现。
7. 实验与性能评估。
8. 总结与展望。

## 验收标准

1. 完成论文方案、创新点、章节结构和实验设计。
2. 完成 Fabric 链码原型，覆盖数据产品、订单、授权、评价和仲裁。
3. 完成 Node.js API 原型，能调用链码并对接链下存储。
4. 完成 IoT 批次数据生成与质量评分模块。
5. 完成 Caliper 工作负载，生成基础性能、质量机制和仲裁机制实验结果。
6. 完成论文初稿骨架和关键章节草稿。
