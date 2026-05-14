# 第 6 章 系统实现

## 6.1 原型系统实现环境

Q-DataMarket 原型系统采用分层实现方式，核心实现包括 Hyperledger Fabric 链码、Node.js 服务层、链下对象存储、质量评分模块、IoT 批次数据生成脚本和 Hyperledger Caliper 工作负载配置。系统目标不是构建完整生产级数据交易平台，而是在可运行代码基础上验证本文提出的访问权交易模型、质量驱动机制和押金仲裁机制。

链码部分位于 `fabric/chaincode/qdatamarket`，主要文件为 `lib/contract.js`。链码使用 JavaScript 实现，提供产品注册、订单创建、卖家确认、访问凭证记录、交付确认、评分提交、争议开启和争议解决等接口。链码测试位于 `test/contract.test.js`，使用 Node.js 内置测试框架和模拟账本状态验证核心流程。

服务层位于 `fabric/application`，主要文件包括 `src/app.js`、`src/hash.js` 和 `src/storage.js`。其中 `app.js` 使用 Express 暴露健康检查、产品发布和订单创建接口；`hash.js` 提供 SHA-256 哈希计算；`storage.js` 实现本地对象存储，用于模拟链下数据保存和存储地址摘要生成。

质量评分模块位于 `quality/score.js`，测试文件为 `quality/score.test.js`。该模块根据完整性、一致性、异常率、时效性、买家评分和争议惩罚计算 IoT 批次数据质量分。数据生成脚本位于 `data/generator/generate_iot_batches.js`，用于构造高、中、低质量样本。性能评估配置位于 `caliper/benchmarks/qdatamarket.yaml` 和 `caliper/workloads/*.js`。

## 6.2 系统模块划分

原型系统可划分为六个模块。

第一，链码模块。该模块负责维护链上可信状态，包括数据产品、订单、访问凭证哈希、质量分和争议记录。链码是系统交易状态机的核心，保证关键状态变更可追踪、可审计。

第二，服务接口模块。该模块使用 Node.js 和 Express 对外提供 HTTP 接口。当前原型实现了 `/health`、`/products` 和 `/orders` 三类接口，分别用于服务健康检查、产品发布请求接收和订单创建请求接收。接口以 `202 Accepted` 返回操作类型和请求体，表示服务层已接收请求，后续可扩展为调用 Fabric SDK 提交交易。

第三，链下存储模块。该模块负责保存原始 IoT 数据文件。当前实现使用本地文件系统模拟对象存储，将文件按数据哈希命名复制到指定目录，并返回 `dataHash`、`storageUri` 和 `storageUriHash`。该实现可替换为 MinIO 或 IPFS，而不改变链上保存摘要的设计。

第四，哈希工具模块。该模块提供 `sha256Buffer`、`sha256File` 和 `sha256Text` 三个函数，用于计算数据文件、文本和缓冲区的 SHA-256 摘要。哈希值用于数据完整性校验、存储地址隐藏和访问凭证摘要。

第五，质量评分模块。该模块对 IoT 批次数据记录进行质量评估，输出完整性、一致性、异常率、异常得分、时效性、买家评分得分、争议惩罚和最终质量分。质量分作为产品注册参数写入链上，并可在交易后根据买家评分更新。

第六，评估模块。该模块包含 IoT 样本生成脚本、实验结果汇总脚本和 Caliper workload。它支撑第 7 章中的性能趋势、质量机制有效性和仲裁机制有效性分析。

## 6.3 Fabric 链码实现

链码 `QDataMarketContract` 定义在 `fabric/chaincode/qdatamarket/lib/contract.js` 中。为便于本地测试，代码在无法加载 `fabric-contract-api` 时使用空基类替代 Fabric `Contract`，使链码逻辑可以通过 Node.js 测试直接执行。

产品注册由 `RegisterProduct` 实现。该函数接收 `productId`、`sellerId`、`deviceId`、`timeRange`、`metadataHash`、`dataHash`、`storageUriHash`、`price` 和 `qualityScore`。链码将价格和质量分转换为数值，设置产品状态为 `Listed`，并将产品保存到 `PRODUCT_<productId>` 键下。产品记录只保存摘要和元数据，不保存原始 IoT 文件。

订单创建由 `CreateOrder` 实现。链码先通过 `ReadProduct` 读取产品，继承产品中的卖家编号，然后创建订单记录。订单包含 `orderId`、`productId`、`buyerId`、`sellerId`、价格、买方押金、卖方押金、访问凭证哈希、订单状态、截止时间和创建时间。新订单状态为 `Ordered`，保存到 `ORDER_<orderId>`。

卖家确认由 `SellerAcceptOrder` 实现。该函数读取订单并将状态改为 `SellerAccepted`。访问授权由 `IssueAccessToken` 实现，链码写入 `accessTokenHash` 并将订单状态改为 `AccessIssued`。链上只保存凭证哈希，不保存凭证明文。

交付确认由 `ConfirmDelivery` 实现。链码读取订单和产品，并比较产品 `dataHash` 与买家提交的 `observedDataHash`。如果二者不一致，函数抛出 `DATA_HASH_MISMATCH`；如果一致，订单状态改为 `Settled`。该逻辑对应本文的链下数据完整性校验机制。

评分提交由 `SubmitRating` 实现。链码读取订单和产品，将买家评分映射为 0 到 100 分，并以 10% 权重更新产品质量分：新分数等于原质量分的 90% 加上买家评分映射值的 10%。随后订单状态改为 `Rated`，产品和订单状态同时写回账本。

争议处理由 `OpenDispute` 和 `ResolveDispute` 实现。`OpenDispute` 将订单状态改为 `Disputed`，并写入包含争议编号、订单编号、原因、证据哈希、裁决结果、惩罚金额和创建时间的争议记录。`ResolveDispute` 根据裁决结果更新争议记录和订单状态：`BUYER_REFUND` 对应 `Refunded`，`SELLER_PAID` 对应 `Settled`，其他结果对应 `Penalized`。

## 6.4 Node.js 服务层实现

服务层 `fabric/application/src/app.js` 使用 Express 构建。系统启用 JSON 请求体解析，并定义三个接口。

`GET /health` 返回 `{ status: 'ok', service: 'qdatamarket' }`，用于运行状态检查。`POST /products` 接收产品发布请求，返回 `accepted: true`、操作名 `RegisterProduct` 和请求体。`POST /orders` 接收订单创建请求，返回 `accepted: true`、操作名 `CreateOrder` 和请求体。当前接口主要用于验证服务层路由和请求结构，为后续接入 Fabric SDK 保留边界。

当 `app.js` 作为入口文件运行时，服务监听 `PORT` 环境变量指定的端口，默认端口为 3000。模块导出 `app`，便于测试或其他启动脚本复用。服务层没有在当前版本中直接提交 Fabric 交易，因此第 7 章的链码状态验证主要由链码测试和 Caliper workload 配置支撑。

这种实现方式保持了原型边界清晰：服务层负责接收请求、组织链下存储和哈希计算，链码负责可信状态变更。随着系统扩展，`/products` 可在保存链下文件后调用 `RegisterProduct`，`/orders` 可调用 `CreateOrder` 并在后续流程中调用授权和确认接口。

## 6.5 链下对象存储实现

链下对象存储由 `fabric/application/src/storage.js` 中的 `LocalObjectStorage` 实现。构造函数接收根目录并创建该目录。`put(filePath)` 方法计算文件 SHA-256 哈希，将文件复制到根目录下，并以数据哈希加原扩展名作为对象名。随后返回三个值：`dataHash`、`storageUri` 和 `storageUriHash`。

`dataHash` 用于链上完整性校验。买家下载文件后可以重新计算哈希，并与链上产品记录比较。`storageUri` 使用 `local://` 前缀表示本地对象位置，服务层可据此找到文件。`storageUriHash` 是存储地址摘要，用于在链上隐藏具体存储路径，同时保留审计能力。

`get(storageUri)` 方法将 `local://` 地址还原为本地文件路径。该方法模拟授权后取回对象的过程。当前实现适合本地原型和测试，不提供访问控制、过期校验和分布式冗余能力。生产部署中可以将该模块替换为 MinIO、IPFS 或其他对象存储，并在服务层增加凭证校验和访问日志。

## 6.6 质量评分模块实现

质量评分模块 `quality/score.js` 提供 `scoreBatch(rows, options)` 函数。输入为 IoT 批次数据记录数组和可选参数，输出为分项质量指标和最终质量分。该模块与第 4 章提出的质量评分模型一致。

函数首先定义必需字段 `timestamp`、`temperature`、`humidity` 和 `status`，统计字段存在数量并计算完整性。随后检查温度、湿度和状态码是否合法，将温度小于 -50 或大于 80、湿度小于 0 或大于 100、状态码不属于 `OK` 或 `WARN` 的情况计为异常。异常率等于异常项数量除以记录数和检查项数量的乘积，异常得分为 `100 - anomalyRate * 100`。

一致性通过相邻时间戳间隔计算。默认期望间隔为 60 秒，若实际间隔偏离超过 20%，则记为不一致。时效性根据上传时间和最后一条记录时间戳之间的小时差计算，每小时扣 5 分。买家评分默认为 5 分，并映射为 0 到 100 分。争议惩罚默认为 0，可由争议记录或仲裁结果传入。

最终质量分使用加权公式计算：完整性 30%、一致性 25%、异常得分 20%、时效性 15%、买家评分 10%，再扣除争议惩罚，并通过 `clamp` 限制在 0 到 100。测试文件 `quality/score.test.js` 验证了完整、连续、正常样本会获得较高分数，缺失字段、时间戳不一致和异常值会显著降低分数。

## 6.7 IoT 批次数据生成实现

数据生成脚本 `data/generator/generate_iot_batches.js` 用于构造可复现实验样本。脚本定义 `generateBatch(deviceId, start, count, quality)` 函数，根据设备编号、起始时间、记录数量和质量等级生成时序记录。每条记录包含 `deviceId`、`timestamp`、`temperature`、`humidity` 和 `status`。

高质量样本保持字段完整、时间间隔稳定、温湿度范围正常、状态码为 `OK`。中质量样本每 20 条记录将湿度置为空，用于模拟字段缺失。低质量样本每 10 条记录将温度置为 999，每 15 条记录将状态码置为 `BAD`，用于模拟异常值和非法状态。

脚本将记录转换为 CSV，并在 `data/samples/` 下生成 `high`、`medium` 和 `low` 三类样本，每类 10 个设备文件，每个文件包含 120 条记录。这些样本为质量评分测试和第 7 章质量机制实验提供数据基础。

## 6.8 Caliper 性能测试配置实现

性能测试配置位于 `caliper/benchmarks/qdatamarket.yaml`。该配置定义测试名称、描述、工作进程数量和四轮 workload。工作进程数为 4，四轮测试分别为 `register-product`、`create-order`、`confirm-delivery` 和 `dispute`，每轮持续 60 秒。

`register-product` 轮使用固定负载 50，调用 `caliper/workloads/registerProduct.js`。该 workload 生成唯一产品编号、卖家编号、设备编号、时间范围、元数据哈希、数据哈希、存储地址哈希、价格和质量分，并提交 `RegisterProduct` 交易。

`create-order` 轮使用固定负载 100，调用 `createOrder.js`，提交 `CreateOrder` 交易。参数包含订单编号、预置产品编号、买家编号、价格、买方押金、卖方押金和截止时间。`confirm-delivery` 轮使用固定负载 100，调用 `confirmDelivery.js`，提交 `ConfirmDelivery` 交易。`dispute` 轮使用固定负载 20，调用 `dispute.js`，提交 `OpenDispute` 交易。

这些 workload 覆盖了系统的主要链上状态变更。当前配置主要用于复现原型性能趋势和生成 Caliper 测试入口，完整 Fabric 测试网络部署后可替换或补充原始 Caliper 报告。

## 6.9 测试与验证

原型系统使用 Node.js 内置测试框架进行单元测试和流程测试。质量评分测试通过 `node --test quality\score.test.js` 执行，验证评分模型能够区分高质量样本和存在缺失、异常、不一致问题的样本。

链码测试通过在 `fabric/chaincode/qdatamarket` 目录运行 `npm.cmd test` 执行。测试使用模拟 `ctx.stub` 保存账本状态，验证产品注册、订单创建、访问凭证发放、交付确认、评分提交、争议开启和争议解决流程。测试覆盖正常交易和退款争议两类路径。

应用层测试通过在 `fabric/application` 目录运行 `npm.cmd test` 执行。当前测试重点验证本地对象存储能够保存对象并返回确定性哈希。结合 `results/evaluation_metrics.test.js`，系统还验证了实验汇总表能够被正确生成。

这些测试共同保证论文中描述的核心机制与代码实现一致。需要说明的是，当前服务层仍处于原型接口阶段，尚未完成 Fabric SDK 的端到端交易提交；Caliper 配置也需要在完整 Fabric 网络部署后才能生成生产级原始报告。因此，本文将实验口径限定为本地原型基准和 workload 配置推导，避免夸大系统部署范围。

## 6.10 本章小结

本章介绍了 Q-DataMarket 原型系统的实现。系统以 Fabric 链码维护产品、订单、授权、评分和争议状态，以 Node.js 服务层承接 API 请求，以本地对象存储模拟链下数据保存，以 SHA-256 哈希支撑数据完整性和地址摘要，以质量评分模块实现完整性、一致性、异常率、时效性、买家评分和争议惩罚计算，并通过 IoT 样本生成脚本和 Caliper workload 支撑实验评估。下一章将在该实现基础上分析系统性能、质量机制有效性和押金仲裁机制有效性。
