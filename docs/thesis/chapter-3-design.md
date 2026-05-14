# 第 3 章 系统需求分析与总体设计

## 3.1 需求分析

Q-DataMarket 面向通用 IoT 批次数据访问权交易场景。系统中的数据产品由数据提供方发布，每个产品对应一个 IoT 设备在指定时间窗口内产生的一批 CSV/JSON 时序数据。数据购买方根据设备、时间范围、字段类型和质量阈值检索数据产品，支付后获得限时访问凭证。

系统功能需求包括数据发布、数据检索、订单创建、卖家确认、访问授权、交付确认、质量评价和争议仲裁。安全需求包括数据完整性验证、访问凭证不可伪造、交易过程可审计、订单状态不可篡改和异常行为可追责。性能需求包括在并发交易场景下保持稳定吞吐、可接受延迟和较高交易成功率。

## 3.2 参与方模型

系统包含以下参与方。

1. 数据提供方：负责上传 IoT 批次数据，发布数据产品，确认订单并获得交易收益。
2. 数据购买方：负责检索数据产品，创建订单，获得访问凭证，下载数据并提交评价。
3. 链下存储服务：负责保存原始 IoT 数据文件，向获得授权的购买方提供下载能力。
4. 区块链网络：负责保存数据摘要、订单状态、访问凭证摘要、质量记录和争议证据。
5. 仲裁逻辑：由智能合约根据订单状态、证据哈希和超时信息执行退款、结算或扣罚。

## 3.3 总体架构

系统采用五层架构。

第一层为数据层。数据层包含通用 IoT 批次数据，字段包括设备编号、时间戳、传感器类型、传感器数值和状态码。数据文件可以来自真实公开数据，也可以通过数据生成模块构造高、中、低质量样例。

第二层为链下存储层。链下存储层使用本地对象存储、MinIO 或 IPFS 保存原始 CSV/JSON 文件。系统在上传阶段计算 `dataHash`、`metadataHash` 和 `storageUriHash`，并仅将哈希写入区块链。

第三层为区块链层。区块链层基于 Hyperledger Fabric 实现，链码负责数据产品登记、订单状态流转、访问凭证记录、质量评分更新和争议处理。

第四层为服务层。服务层基于 Node.js 实现，负责对接 Fabric SDK、链下存储、质量评分模块和访问授权模块。该层对外提供产品发布、订单创建和授权访问等 API。

第五层为评估层。评估层基于 Hyperledger Caliper 实现，通过工作负载脚本模拟数据发布、下单、确认和争议等交易，用于收集 TPS、延迟和成功率等指标。

## 3.4 形式化系统模型

设系统参与方集合为

$$
\mathcal{P}=\mathcal{S}\cup\mathcal{B}\cup\mathcal{N}\cup\mathcal{A},
$$

其中 $\mathcal{S}$ 表示数据提供方集合，$\mathcal{B}$ 表示数据购买方集合，$\mathcal{N}$ 表示区块链网络节点集合，$\mathcal{A}$ 表示仲裁或监管逻辑集合。任意一次交易由卖家 $s\in\mathcal{S}$、买家 $b\in\mathcal{B}$、数据产品 $p$ 和订单 $o$ 组成。

设数据产品集合为

$$
\mathcal{D}=\{p_i=(id_i,s_i,dev_i,[t_i^s,t_i^e],h_i^m,h_i^d,h_i^u,q_i,\pi_i)\},
$$

其中 $id_i$ 为产品编号，$s_i$ 为卖家，$dev_i$ 为设备编号，$[t_i^s,t_i^e]$ 为数据时间窗口，$h_i^m$ 为元数据哈希，$h_i^d$ 为数据本体哈希，$h_i^u$ 为链下存储地址哈希，$q_i$ 为质量分，$\pi_i$ 为价格。链上状态不保存原始数据，只保存上述承诺值和交易状态。

访问权交易定义为四元组：

$$
R_{ij}=(p_i,b_j,\tau_{ij},a_{ij}),
$$

其中 $p_i$ 为被购买的数据产品，$b_j$ 为买家，$\tau_{ij}$ 为访问有效期，$a_{ij}$ 为访问凭证。链上只保存 $H(a_{ij})$，链下服务根据凭证明文、订单状态和有效期判断是否允许访问。该定义保证交易对象是“在限定范围和时间内访问数据的权利”，而不是原始数据所有权。

订单集合定义为

$$
\mathcal{O}=\{o_k=(id_k,p_i,b_j,s_i,\pi_i,\delta_b,\delta_s,H(a_{ij}),state_k,deadline_k)\},
$$

其中 $\delta_b$ 和 $\delta_s$ 分别为买方押金和卖方押金，$state_k$ 为订单状态。状态集合为

$$
\mathcal{S}_o=\{Ordered,SellerAccepted,AccessIssued,Settled,Rated,Disputed,Refunded,Penalized\}.
$$

系统需要满足以下不变量。第一，完整性不变量：若买家确认交付，则其观测数据哈希必须满足

$$
H(d_i')=h_i^d.
$$

第二，授权不变量：只有状态达到 `AccessIssued` 且凭证哈希匹配时，链下服务才应允许访问。第三，状态单调不变量：订单状态只能沿合法状态转移路径前进，不能从 `Settled`、`Refunded` 或 `Penalized` 回退到交易中间状态。第四，押金守恒不变量：一次订单中价格和押金的释放、退回与扣罚总额应等于锁定总额。第五，证据可追踪不变量：任意争议 $e_l$ 必须绑定到唯一订单 $o_k$，并保存证据摘要 $H(e_l)$。

这些形式化约束对应后续链码接口和测试用例。链码负责维护状态单调性和证据索引，服务层负责链下数据保存、哈希计算和凭证校验，质量模块负责计算 $q_i$ 并影响排序与价格。

## 3.5 核心数据模型

### 3.5.1 数据产品模型

`DataProduct` 用于描述可交易的数据访问权。

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
```

其中，`metadataHash` 用于验证数据描述信息，`dataHash` 用于验证链下数据本体完整性，`storageUriHash` 用于隐藏链下存储地址并支持后续审计。

### 3.5.2 订单模型

`Order` 用于描述一次访问权交易。

```text
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
```

订单保存买卖双方押金、访问凭证哈希、交易状态和确认期限。系统通过状态机约束订单流转，避免越权确认或重复结算。

### 3.5.3 质量记录模型

`QualityRecord` 用于记录数据质量评分。

```text
QualityRecord:
  productId
  completeness
  consistency
  anomalyRate
  timeliness
  buyerRating
  disputePenalty
  finalScore
```

该模型将数据本身的客观质量和交易后的主观评价结合，用于数据排序、卖家信誉更新和质量机制实验。

### 3.5.4 争议记录模型

`Dispute` 用于记录交易争议。

```text
Dispute:
  disputeId
  orderId
  reason
  evidenceHash
  result
  penalty
  createdAt
```

争议记录保存原因、证据哈希、裁决结果和扣罚金额，支持后续审计和信誉惩罚。

## 3.6 核心链码接口

链码提供以下接口。

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

其中，`RegisterProduct()` 负责登记数据产品；`CreateOrder()` 和 `SellerAcceptOrder()` 负责订单建立；`IssueAccessToken()` 负责记录访问凭证哈希；`ConfirmDelivery()` 负责确认数据交付并结算；`SubmitRating()` 负责更新质量分；`OpenDispute()` 和 `ResolveDispute()` 负责争议创建和处理。

## 3.7 交易流程

系统交易流程包括六个阶段。

1. 数据发布。卖家上传 IoT 批次数据到链下存储，系统计算数据哈希、元数据哈希和初始质量评分，链上登记数据产品。

2. 数据检索与排序。买家根据设备、时间范围、字段类型和质量阈值查询数据产品。系统根据质量评分和卖家信誉进行排序。

3. 下单与押金锁定。买家创建订单并锁定数据价格和买方押金，卖家确认订单并锁定卖方押金。订单进入卖家已确认状态。

4. 访问授权。系统生成限时访问凭证，链上保存访问凭证哈希，链下服务根据凭证提供数据下载。

5. 确认结算与质量评价。买家下载数据后校验 `dataHash`。校验成功则确认交付，系统向卖家结算并允许买家提交评分。

6. 争议仲裁。若发生下载失败、哈希不一致、超时未确认或虚假争议，系统根据链上证据和订单状态执行退款、结算或扣罚。

## 3.8 本章小结

本章完成了 Q-DataMarket 的需求分析和总体设计，明确了系统参与方、五层架构、核心数据模型、链码接口和交易流程。后续章节将进一步展开质量驱动机制和押金仲裁机制，并基于该设计实现系统原型。
