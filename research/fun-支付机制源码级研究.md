# Fun (fun.xyz) 支付机制源码级研究

> 依据:`@funkit/core@2.3.68`、`@funkit/api-base@10.0.0`、`@funkit/chains@2.6.1`、`@funkit/utils@5.1.1`
> 这四个包发布在 npm,dist 里带内嵌 `sourcesContent` 的 sourcemap,本文所有内容均来自还原后的真实 TypeScript 源码
> (还原源码见 `research/fun-sdk-source/`),文末附文件索引。

---

## 1. 核心抽象:一切支付都是 Checkout

Fun 把所有资金移动统一为一个 **Checkout(结账)** 会话模型,由三个正交维度组成:

```
资金流方向 (RailConfigType)     ×    资金来源 (sourceOfFund)      ×    执行方式 (DirectExecutionType)
FIAT_TO_CRYPTO  法币→加密            card / bank / exchange /        RELAY / OFT / ACROSS / FLASHNET /
CRYPTO_TO_FIAT   加密→法币            crypto / lightning ...          CONTRACT_CALL / EXTERNALLY_FULFILLED
CRYPTO_TO_CRYPTO 加密→加密(跨链)
```

一次 Checkout 的完整旅程:

```
报价 quoteV2 → 初始化(init / direct-execution / 入金地址)
→ 用户付款(卡/银行/交易所划转/链上转账/Lightning invoice)
→ 后端检测到账(FROM_FUNDED) → 路由执行(RELAY/OFT/ACROSS…)
→ 目标侧记账(TO_FUNDED → TO_READY → PENDING_RECEIVAL)→ COMPLETED
→ (失败路径:CHECKOUT_ERROR / EXPIRED / CANCELLED / RefundState 退款机)
```

关键设计:**入金即合约调用**。老版 `POST /checkout` 的请求体里直接携带已签名的 ERC-4337 `UserOperation`(`CheckoutApiInitParams.userOp`)——资金一到账,后端直接用这笔钱执行用户预签名的链上动作(兑换、桥接、存款),而不是"先入账再让用户发起交易"。这正是 Fun 宣称"highest converting rails"的机制基础:用户在支付环节只需一次法币操作,链上动作由入金自动驱动。

> ⚠️ 源码注释明确:`POST /checkout` **2026-12-21 下线**,替代路径为 `createDirectExecution`(relay 执行)和 `initializeCheckoutTokenTransferAddress`(纯入金地址)。

## 2. 报价系统:`POST /checkout/quoteV2`

单端点、按 `fromChainId` 分发到不同 rail(包括 Lightning)。请求(`CheckoutQuoteRequestV2`):

| 字段 | 说明 |
|---|---|
| `fromChainId` / `fromTokenAddress` | 源链+源币(地址可用 EVM 或 Solana base58) |
| `toChainId` / `toTokenAddress` | 目标链+目标币 |
| `fromAmountBaseUnit` XOR `toAmountBaseUnit` | **二选一**:EXACT_INPUT 或 EXACT_OUTPUT 报价 |
| `userAddress` / `recipientAddress` | 用户地址 / 收款地址(`FunAddress` 可为 Lighter 账户号) |
| `usePermit` | 显式指定源侧授权方式:`true`=permit 签名,`false`=approve 流程,缺省=后端决定 |
| `routing` | 选择加入 provider-aware 路由,响应变为 `RoutedQuoteResponse` |
| `actionParams` | 附带的链上动作参数(报价时即把要执行的合约调用算进路径) |
| `bridgeOverride` | 强制桥:`'across' \| 'relay'` |

响应的 `RoutedQuoteResponse` 是最有意思的部分:

```ts
{
  provider: 'relay' | 'across',
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'EXPECTED_OUTPUT',
  expiresAtMs: number,
  execution: { steps: CheckoutExecutionStep[] },   // ⭐ 完整有序的钱包动作序列,含 approve
  metadata: {
    feeBreakdown: FeeBreakdownV2,
    oftEnabled?: boolean,        // 该路径是否可走 LayerZero OFT
    relayQuote?: SanitizedRelayQuote
  }
}

type CheckoutExecutionStep =
  | { vm: 'EVM';    to: Address;      data: Hex; value: string }
  | { vm: 'TRON';   to: TronAddress;  data: Hex; value: string }
  | { vm: 'SOLANA'; to: SolanaAddress; serializedTx: string }
```

即:**报价直接返回"客户端可执行的动作序列"**(三种 VM 都支持),客户端可以本地验证后再签——不是黑盒。

费用模型 `FeeBreakdownV2`:

| 字段 | 含义 |
|---|---|
| `gasUsd` | 预估 gas |
| `fillCostUsd` / `fillCostPercent` | 路径填充成本 |
| `swapImpact` / `swapImpactUsd` | 兑换价格冲击 |
| `maxSlippage` / `minReceived` | 滑点保护与保底到账 |
| `appFeePercent` / `appFeeUsd` / `appFeeLabel` | **集成方抽成**(Lighter 场景 label 就是 "Fun fee") |
| `exchangeRate` | 仅兑换时有 |

### Lightning 报价

`fromChainId` 传 Lightning 的魔法链 ID `29780` 即走 **Flashnet** rail,响应为 `LightningQuoteResponse`:内含 `invoice.bolt11`(闪电网络支付发票)+ `flashnet.{quoteId, orderId}`。也就是说闪电网络是报价系统里的一等 rail。

## 3. Checkout 生命周期状态机(源码原文)

```ts
enum CheckoutState {
  // 进行中 —— 源侧
  FROM_UNFUNDED, FROM_FUNDED, FROM_POOLED,
  // 进行中 —— 目标侧
  TO_UNFUNDED, TO_FUNDED, TO_POOLED, TO_READY, PENDING_RECEIVAL,
  // 终态
  COMPLETED, CHECKOUT_ERROR, EXPIRED, CANCELLED,
}

enum CheckoutRefundState {
  INITIATED → WAITING_FOR_FULFILLMENT → FULFILLED | REFUNDED | PROCEEDED | ERROR
}
```

`FROM_*`(钱到没到源侧)与 `TO_*`(目标侧记账进度)分离,天然描述跨链两阶段;每条历史记录(`CheckoutHistoryItem`)带 `stateTimestampMs`(各状态时间戳)、`refundState`、`sourceOfFund`、`clientMetadata`、`salt`、`version`。

## 4. 多 VM 入金地址体系

`initializeCheckoutTokenTransferAddress` 一次返回全 VM 地址:

```ts
{
  depositAddr: EVM 地址,
  solanaAddr: Solana 地址,
  btcAddrSegwit / btcAddrTaproot / btcDepositAddr: 比特币三格式,
  tronAddr: Tron 地址,
  blocked?: boolean   // ⚠️ 合规风控命中时为 true,前端必须检查
}
```

配套类型 `FunAddress = EVM | Solana | Bitcoin | Tron | LighterAccountIndex`——**Lighter 账户号(`"1234"` 这种纯数字串)在 Fun 的类型系统里是一种地址**,这就是"一笔入金直达交易账户"的实现基础。

## 5. 执行引擎:`/direct-execution`

七种执行类型(源码注释原文翻译):

| 类型 | 机制 |
|---|---|
| `RELAY` | 经 **Reservoir 的 relay-kit**(源码直接引用其仓库)做意图式跨链执行 |
| `OFT` | **LayerZero OFT** 桥,状态追踪深入到 `lzCompose` 组合交易 |
| `ACROSS` | Across CCTP 桥(注释注明用于 HyperCore USDH) |
| `FLASHNET` | 闪电网络入金,经 Flashnet 编排 webhook 处理 |
| `CONTRACT_CALL` | **SDK 自签自发**直调第三方合约(例:Aave `Pool.supply`),Fun 只记账不路由 |
| `EXTERNALLY_FULFILLED` | 纯追踪:执行与结算完全在 Fun 体系外,后端只落库不轮询 |
| `TEST_EXECUTION` | 测试专用 |

`DirectExecution` 记录含 `listenerInfo`——执行监听器把三个体系的原始状态都存下来:Relay 执行请求(含费用明细 `fees/feesUsd/appFees`)、LayerZero 端到端路径(`srcEid/dstEid/pathway/compose`)、以及 **Lighter 专属执行状态响应**(L2 交易从 `queued_at → committed_at → verified_at → executed_at` 的全生命周期)。`isDepositDetectionDE` 标记"由链上事件检测合成的临时记录,待真实记录确认后替换"。

## 6. 法币通道:Frog 网关 + fops

### 6.1 fops = Forms Of Payment

`POST /fops` 按 `{userId, countryCode}` 返回该用户可用的支付 rail 配置,如 `SwappedFiatToCryptoRailConfig`(法币→加密):

```ts
{
  type: 'FIAT_TO_CRYPTO',
  fiatCurrencyCode,                    // 区域推导的默认法币
  baseCurrencyCode / baseCurrencyAmount / lockAmount / lockBaseCurrency,  // 预填金额/锁定的 UI 配置
  recipientTargets: RecipientTarget[], // 可选收款目标
  checkoutLimitsCriteria: { defaultMinAmount, defaultMaxAmount },  // ⚠️ 以 EUR 计(Swapped 的要求)
  thirdPartyPaymentConfigs,
}
```

有 `CRYPTO_TO_FIAT`(off-ramp)的对偶配置。客户端能力声明 `FiatClientCapability = 'payment_sheet_first'`——前端是"支付表单优先"的向导式 UI。

### 6.2 供应商矩阵(源码确认)

| 层 | 供应商 | 源码证据 |
|---|---|---|
| 法币聚合 on-ramp | **Meld**(`frog/api/meld/session|quote|fiat`,sessionType='BUY') | `meld/endpoints.ts` |
| 法币 on/off-ramp | **Swapped.com**(fops 配置、`/api/swapped/supportedCountries`) | `fops/types.ts` |
| 法币 on-ramp | **MoonPay**、**Banxa** | SDK 枚举 |
| 银行/稳定币 rails | **Bridge(bridge.xyz)**:`GetOrCreateFrogAccount`、`BridgeCustomer` + `KYCLinks`、`WalletSubAccount`/`BridgeSubAccount`、**`BridgeVirtualBankAccount`(虚拟银行账户)** | `bridge/types.ts` |
| CEX 直连 | **Bluvo**:`exchanges`(可用交易所)、`quote`、`balance`、`withdrawal`、`walletId` | `bluvo/endpoints.ts` |
| 支付方式(国家矩阵) | CARDS / APPLE_PAY / GOOGLE_PAY / PAYPAL / REVOLUT_PAY / SKRILL / PIX / NATIVE_CASH_APP_LIGHTNING / BANK_TRANSFER / SEPA / ACH | vendor bundle 按国别 priority variants |
| KYC / AML / 反bot | Persona / Chainalysis / Cloudflare Turnstile | SDK 枚举 + RiskAssessment 响应形状 |

### 6.3 fiat 服务:后端驱动的状态机

`SendFiatTransitionParams` 的设计很值得借鉴——**服务端在每步响应里下发下一个要调的端点字符串**(`'GET /fiat/...' | 'POST /fiat/...'`),客户端按状态机推进:

- 读操作不传幂等键;**写操作强制 `idempotencyKey`**(防止重试重复扣款,类型系统层面强制)
- 429 限流带语义化 `retryAfterSeconds`,>1s 才自动重试

## 7. 智能钱包与 gas 赞助(FunWallet)

- 标准 **ERC-4337**:EntryPoint `0xcA11bde05977b3631167028862bE2a173976CA11`,`FunWallet` + `FunWalletFactory`(CREATE3 确定性地址)+ `FunWalletProxy`
- 四种 Paymaster(`PaymasterType` 枚举):

| 类型 | 用途 |
|---|---|
| `base` | 基础代付 |
| `gasless` | GaslessSponsor,支持链白名单 `GASLESS_SPONSOR_SUPPORT_CHAINS` |
| `token` | TokenSponsor,用 ERC20 代币付 gas |
| `checkout` | **CheckoutSponsor:为 checkout 流程本身代付 gas**(入金动作零 gas 的关键) |

- 赞助支持双 VM:`sponsorEVMTransaction` / `sponsorSVMTransaction`(**Solana 交易也能代付**)
- 认证:`Auth.ts` + **`SessionKeyAuth`(会话密钥)**、Passkey(注册/恢复)、社交/邮箱/Telegram;CEX 划转成功后可触发 `triggerFundFromExchangeOnSuccess`
- `/dashboard/paymasters/add-transaction`:paymaster 代付记录上报(dashboard 体系)

## 8. 链 ID 体系(`@funkit/chains`)

非 EVM 链用十进制大数编码进统一的 `chainId: string` 字段:

| 链 | chainId |
|---|---|
| Ethereum/Arbitrum/Base/Optimism/Polygon/Avalanche 等 | 原生 EVM ID |
| HyperEVM | 999 |
| Monad | 143 |
| Robinhood Chain | 4663 |
| Ethereal | 5064014 |
| **Lighter 主网** | **3586256** |
| **Lighter@Robinhood 实例** | **548123634** |
| Solana | 1151111081099710 |
| Bitcoin | 8253038 |
| **Lightning** | **29780** |
| Tron | 728126428 |
| HyperCore | 1337 |

Lighter 专属配套:`LIGHTER_SIGNER_CHAIN_ID_BY_INSTANCE = {主网: 304, RH实例: 466324}`(WASM 签名域),API host 映射 `mainnet.zklighter.elliot.ai` / `api.rh.lighter.xyz`。源码把 Lighter 两个实例列为 first-class NON_EVM 链。

## 9. 风控与合规

`POST /checkout/risk-assessment?address&chainId` 返回(响应结构与 Chainalysis API 同形):

```ts
{
  risk: 'Severe' | 'High' | 'Medium' | 'Low',
  riskReason, cluster: { name, category },
  addressType, addressIdentifications: [...],
  exposures: [{ category, value, exposureType: 'direct'|'indirect', direction }],
  triggers: [{ category, percentage, message }],
  poolMetadata: { fees, tokens }
}
```

配套:入金地址响应的 `blocked` 合规冻结标记、`/api/geo/ip-address` 地理判定、`/api/swapped/supportedCountries` 国别支持矩阵、Bridge KYCLinks(银行通道的持牌 KYC 由 Bridge 侧完成)。

## 10. 值得借鉴的工程细节

1. **写操作强制幂等键**:fiat 写端点的 `idempotencyKey` 在 TS 类型上是必填(union type 分支),从类型系统消灭重复扣款
2. **报价返回可执行动作序列**(`execution.steps[]`),客户端可本地校验,而非信任黑盒路由
3. **单端点 rail 分发**:quoteV2 用 `fromChainId` 区分 EVM/Lightning/Tron 等,API 面保持极简
4. **状态机对称分离**:FROM_*/TO_* 两侧独立推进,精确表达跨链两阶段承诺
5. **临时记录 + 事件替换**:`isDepositDetectionDE` 先落链上事件检测的合成记录,真实记录确认后替换——入金追踪不丢事件
6. **集成方抽成内建**:`appFee*` 三字段(比例/金额/自定义 label)贯穿报价与执行记录
7. **服务端驱动的 fiat 向导**:端点字符串由后端下发,前端零逻辑硬编码,上新 rail 不发版
8. ⚠️ **安全反面教材**:npm 包 sourcemap 内嵌完整源码(本文的来源),同目录已有报告 §8.4 还发现过 48 个客户 API key——供应链泄露风险自证

## 11. API 端点速查(从源码整理)

**api.fun.xyz/v1**(需 apiKey):
```
POST /checkout/quoteV2          报价(EVM/Lightning/Tron/Solana 源)
POST /checkout                  初始化(旧,2026-12-21 下线)
POST /checkout/update/{addr}    更新状态(如 CANCELLED)
GET  /checkout/{depositAddr}    按地址查
GET  /checkout/userId/{userId}?limit=   按用户查
POST /checkout/risk-assessment  地址风控
POST /direct-execution          创建执行记录
GET  /direct-execution/txHash/{hash}    按 tx 查
GET  /direct-execution/userId/{userId}  按用户查
POST /fops                      可用支付方式(按国家/用户)
GET  /assets/supported          资产注册表
GET  /assets/erc20s/{chain}     链上代币(仅验证过的)
GET  /asset/erc20/price/{chain}/{token}  价格
POST /eoa                       EOA
POST /dashboard/paymasters/add-transaction   paymaster 记录上报
```

**frog.fun.xyz**(法币侧):
```
GET/POST /api/meld/{fiat|quote|session}     Meld on-ramp
GET  /api/swapped/supportedCountries        Swapped 国别支持
GET  /api/bridge / /bank / /kyclink?guid=   Bridge 银行账户+KYC
POST /api/bluvo/{quote|withdrawal|...}      Bluvo CEX 直连
GET  /api/exchange-rates / /geo/ip-address  汇率与地理
(另有一组后端下发式的 /fiat/* 状态机端点)
```

## 附:源码文件索引

| 路径(research/fun-sdk-source/) | 内容 |
|---|---|
| `api-base/src/services/checkout/` | 报价、初始化、状态机、风控类型 |
| `api-base/src/services/direct-execution/` | 执行引擎七类型与监听器 |
| `api-base/src/services/{fiat,meld,bluvo,bridge,swapped,fops}/` | 法币与银行通道 |
| `api-base/src/services/{fw-paymaster,xstocks,exchange-rates,geo,assets}/` | paymaster、代币化股票等 |
| `core/src/wallet/FunWallet.ts` | 钱包类 |
| `core/src/sponsors/` | 四种 gas 赞助实现 |
| `core/src/abis/` | 19 个合约 ABI(FunWallet、CheckoutPaymaster、EntryPoint…) |
| `core/src/auth/` | Auth + SessionKeyAuth |
| `chains/src/const/` | 全链元数据与链 ID 常量 |

> 注:React 收银台 UI(`@funkit/checkout`)未发布 npm,只能从宿主 bundle(如 Lighter 的 vendor-ui-web3)逆向;但 UI 消费的全部协议层在上述包中是完整的。
