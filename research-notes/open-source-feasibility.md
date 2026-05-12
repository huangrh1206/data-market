# 开源项目与可行方案评估

## 本地可行方案约束

- 推荐底座：Hyperledger Fabric Samples + Hyperledger Caliper。
- 数据本体：链下存储，候选为 IPFS、MinIO 或普通文件服务。
- 链上数据：metadata hash、价格、卖家、买家、订单状态、访问凭证、评价记录。
- 性能指标：TPS、平均延迟、P95 延迟、成功率、CPU/内存/网络 IO、账本增长、节点数、背书策略、区块大小、并发用户。
- 可选创新：数据质量评分、访问授权、押金仲裁、隐私身份认证、链上链下混合存储对比、Fabric/FISCO BCOS/Ethereum 平台性能对比。

## 开源项目定位

1. Hyperledger Fabric Samples
   - 适合作为主实现底座。
   - 可复用 test-network、asset-transfer、private-data、state-based endorsement、ABAC 等样例思想。
   - 与“数据访问权交易系统”的联盟链场景匹配。

2. Hyperledger Caliper / caliper-benchmarks
   - 适合作为性能评估底座。
   - 能输出吞吐、延迟、成功率等指标，便于形成论文实验章节。

3. Ocean Protocol market / ocean.js / ocean-cli
   - 适合作为成熟数据市场参考。
   - 不建议作为主底座：Web3 代币、NFT、数据服务组件较重，改造成硕士论文实验系统成本高。

4. FISCO BCOS
   - 适合作为国产联盟链对比或扩展章节。
   - 不建议第一阶段同时实现 Fabric 与 FISCO BCOS，否则系统集成和实验工作量会过大。

5. BlockBench / DiabloBench
   - 适合作为基准测试方法参考。
   - 不建议直接作为主测试框架，因为本课题更需要围绕自定义交易流程测性能。

6. MSec-H2020/IoT_Marketplace
   - 适合作为 IoT 市场业务流程和界面参考。
   - 不建议作为主实现底座，除非论文主题明确转向 IoT 智慧城市数据交易。

## 推荐技术路线

主线：
- Fabric test-network + Go/TypeScript chaincode + Node.js API + MinIO/IPFS + Caliper。

核心业务：
- 数据发布：卖家上传链下数据，链上登记 metadataHash、dataHash、price、qualityScore、seller。
- 订单创建：买家下单并锁定资金/押金。
- 授权发放：系统生成访问凭证 tokenHash，链下服务校验后提供下载。
- 质量评价：买家评价，系统更新质量评分与信誉。
- 押金仲裁：超时、哈希不匹配、无法下载等场景进入争议状态。

实验：
- 并发用户：50/100/200/500。
- 背书策略：单组织、双组织、多组织。
- 区块参数：不同 BatchTimeout/MaxMessageCount。
- 对比机制：无质量评分 vs 质量信誉排序；无仲裁押金 vs 押金仲裁。
