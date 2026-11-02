# Fun (fun.xyz / The Fun Group, Inc.) 调研报告

> 调研日期：2026-10-30 · 调研范围：官方文档、官方资料、技术架构、融资与团队、发展史、商业模式、竞争格局
> 全部结论均附来源；公司自述数据已明确标注为"自述"。

---

## 0. 结论摘要

**Fun 是一家做"加密世界 Stripe 收银台"的公司**，实体为特拉华州注册公司 **The Fun Group, Inc.**（注册号 6659322），创始人兼 CEO **Alex Fine**，2022 年成立，总部纽约，2026 年在新加坡设立办公室。

核心业务：为加密原生及正在链上化的金融平台提供**白标嵌入式出入金与结算基础设施**（Deposit / Withdraw / Orchestration / Checkout 四个产品），让终端用户用法币、信用卡、交易所余额或任意链上代币完成充值/提现，全程不离开宿主 App。自述规模为**年处理交易额 $18B+、成功率 >99.999%、$1M 交易 5 秒内结算、覆盖 100+ 国家、50+ 支付方式**，客户 20+ 家，公开点名 **Polymarket、Lighter、Aave**。

三个对判断其性质最关键的事实：

1. **它 2022 年做的是钱包基础设施，不是支付**。Fun 最初是 Odsy Network / dWallet 生态上的"访问控制"产品公司，2023 年发布 ERC-4337 智能钱包协议 FunKit。转向支付是**静默完成的**——没有任何转型公告，Medium 至今只有 2023 年 8 月那一篇文章。
2. **它的开发者文档门户 `docs.fun.xyz` 是完全登录墙**，所有路径 307 跳转 `/login`。目前**最接近"公开官方文档"的其实是一个 Intercom 帮助中心**和**从公开 npm 包里逆向出来的接口契约**。
3. **它的合规姿态是"我不是 money service"**。Terms of Use 明确写明三种 Fulfillment Method，其中一种让 Fun 以**principal（自营交易对手）**身份直接买入用户代币——这是规避资金传输牌照（money transmission）的一种结构性设计，而非叙事包装。

对当前工作目录 `fun-xyz-research` 的直接相关性：**Lighter 是 Fun 的公开客户**，且 `@funkit/connect` SDK 里存在 `clients/lighter.tsx` 与 `clients/lighterRh.tsx` 两套白标主题，另有 `LIGHTER_CHAIN_ID = 3586256` / `LIGHTER_RH_CHAIN_ID = 548123634` 两条链常量。

---

## 1. 官方资料清单

用户问题的核心是"网上是否有相关的官方文档和资料"。答案是：**有，但分布极不均衡**——公开的营销/融资资料很多，**真正的技术文档几乎全被锁在登录墙后面**。按价值排序如下。

### 1.1 一级官方资料（公开可读）

| 资料 | URL | 说明 |
|---|---|---|
| 官网首页 | `https://fun.xyz/` | Webflow 搭建；口径：$18B+/年、>99.999%、<5s 结算 $1M |
| Series A 公告 | `https://fun.xyz/news/series-a` | 2026-05-01，含 Polymarket VP 完整引语 |
| 四个产品页 | `/products/deposit` `/products/withdraw` `/products/orchestration` `/products/checkout` | 唯一公开的"产品说明书" |
| 三个行业页 | `/solutions/fintech-payments` `/solutions/defi-trading` `/solutions/sports-gaming` | 含客户案例与指标 |
| Terms of Use | `https://fun.xyz/terms` | 最后更新 2026-08-13。**最重要的法律文件**，见 §6 |
| About / Careers / Contact | `/about` `/careers` `/contact` | 团队使命、价值观；Contact 表单含客户分级字段 |
| 官方新闻稿（BusinessWire） | `https://www.businesswire.com/news/home/20260501170322/en/` | **直接访问返回 403**，需用三方转载版 |
| 2022 年种子轮新闻稿 | `https://finance.yahoo.com/news/fun-announces-3-9m-pre-130000875.html` | PRNewswire，2022-10-27，见 §5 |

### 1.2 开发者文档（`docs.fun.xyz`）——**完全登录墙**

- 平台：**Mintlify**，站点部署 ID `funxyz-90639b95`，托管在 Vercel。
- 访问模型：**任何路径都 307 跳转** `https://docs.fun.xyz/login?redirect=%2F<原路径>`。已验证 `/`、`/llms.txt`、`/llms-full.txt`、`/sitemap.xml`、`/docs.json`、`/mint.json`、`/api/mint.json`、`.well-known/llms.txt`、`/api/mcp`、`/api/search`、`/api/site-config` 全部被拦。
- **没有 llms.txt / sitemap 逃生口**；Mintlify API（`api.mintlify.com`）对 `docs.fun.xyz` 返回 401。
- 静态资源**未设门禁**：`docs.fun.xyz/mintlify-assets/_next/static/chunks/*.css` 返回 200，可读 Next.js runtime 与 chunk manifest，但文档正文取不到。
- 历史上（2023 FunKit 时代）docs 曾公开，Wayback 存档可见 `/api-reference/fun-wallet`、`/api-reference/gas-sponsor/gasless-sponsor`、`/advanced/blacklist-gas-sponsor` 等页面。**2025-11-12 存档显示 docs 已退化为仅 `/login` 与 `/compliance`**。
- **结论：本次调研未能读到任何一页当前开发者文档。** API 认证方式、webhook 签名规范、SDK 快速开始、真实 SLA 数值，全部未知。

### 1.3 `api.fun.xyz` —— AWS API Gateway

- 任何路径返回 `403 {"message":"Missing Authentication Token"}`，响应头带 `x-amzn-errortype: MissingAuthenticationTokenException`。
- 这是 SDK 使用的 base URL：`API_BASE_URL = "https://api.fun.xyz/v1"`（取自 `@funkit/api-base`）。
- 附带发现的内部/周边主机：`frog.fun.xyz`（内部 Next.js 服务，404）、`data-api.fun.xyz/v1`（`403 RBAC: access denied`）、`sdk-cdn.fun.xyz`（S3 CDN，公开可读）。

### 1.4 ⭐ 最有价值的公开"文档"：Intercom 帮助中心

`https://intercom.help/funxyz/en/` —— **完全公开，无需登录**，是当前唯一可读的官方技术+商业说明。9 篇文章：

| 文章 | 内容要点 |
|---|---|
| **Fun.xyz's Fee Breakdown** | 五项费用构成（见 §3.5），最关键的公开商业信息 |
| Order Execution Guide | 订单执行流程 |
| Transfer Crypto Guide & FAQs | "Transfer Crypto" 通道（quoteless 报价） |
| Where's my order? | 订单状态追踪 |
| Regional Restrictions | **受限制国家名单，含美国**（见 §8 矛盾点） |
| Lightning FAQs | Lightning 通道，上限 $10,000/笔 |
| Rejection Verification | 被拒后的申诉流程（签名证明钱包归属 + 换钱包退款） |
| Why is my deposit under review? | 人工审核 ≤48 小时 |
| Contact Us | `support@fun.xyz`；开发者另有 `developers@fun.xyz` |

### 1.5 SDK / 开源资产（公开，含实质技术信息）

**npm**（scope `@funkit` / `@fun-xyz`）：

| 包 | 版本 | 月下载 | 作用 |
|---|---|---|---|
| `@funkit/connect` | 12.21.0 | **84,115** | 主 SDK。README 自述为 **closed beta**，`developers@fun.xyz` 申请 |
| `@fun-xyz/fiat-contract` | 0.47.0 | **114,541** | ⭐ **公开的法币入金"接口契约"**：FlowState/Transition 类型、zod schema、状态转移表（as data）、录制 fixtures、断言助手。MIT 协议 |
| `@funkit/connect-core` / `-rn` / `-js` | 12.0.0 / 11.0.0 / 1.1.1 | — | 无头核心逻辑、RN 绑定、框架无关构建 |
| `@funkit/api-base` | 10.0.0 | — | 后端服务客户端层（服务清单见 §3.4） |
| `@funkit/chains` | 2.6.1 | — | 链元数据与图标 |
| `@funkit/fun-relay` | 3.3.1 | — | Relay Protocol 集成 |
| `@funkit/wallet-phantom` | 0.1.0 | — | Phantom 深度链接钱包（RN 入金） |

**GitHub** `github.com/fun-xyz`（组织建于 2022-11-17）：公开仓库 `funkit-ios`（Swift，2026-10-29 仍在更新）、`safe-utils`、`hardhat`、`web3-react-magic-auth`。**`fun-xyz/funkit` 与 `fun-xyz/fiat-contract` 两个主仓库为私有**（npm metadata 引用但 404）。

**iOS SDK 内部依赖**（来自 `funkit-ios` 的 `Package.swift`）：二进制 XCFramework 来自 `sdk-cdn.fun.xyz/funkit-swift/0.1.0-rc.6/`，含 **IdensicMobileSDK**（Identific，KYC 证件识别）、`FunkitStripe`（依赖 `stripe-ios-spm` 26.13.0，引用 `StripeCryptoOnramp`、`StripePaymentSheet`、`StripeApplePay`）。

### 1.6 投资方 / 媒体 / 演讲

- **SignalFire（联合领投方）投资信**：`https://www.signalfire.com/blog/fun-investor`（2026-05-06）——**公开资料里技术叙述最详细的一篇**
- **Multicoin Summit 2025 演讲全文**："Making Payments Fun"（Alex Fine，2025-12-08，YouTube `ignlyX4aWow`）——**公开资料里架构细节最丰富的一篇**
- **Mercury 创始人访谈**（2026-09-01）：`mercury.com/blog/alex-fine-fun-founder-payments-blockchain-polymarket`
- **Fortune 独家**（2026-05-01，Ben Weiss）：`fortune.com/2026/05/01/fun-series-a-fundraise-multicoin-capital-signalfire`
- **CoinDesk**（2026-08-02）：`coindesk.com/tech/2026/08/02/the-future-of-crypto-payments-won-t-include-on-ramps-or-bridges-fun-ceo-says`
- **Fireblocks 对比报告**（2026-06-09）：`fireblocks.com/report/compare-stablecoin-acceptance-infrastructure` —— **唯一一份点名 Fun 的第三方横评**（竞品撰写，需注意立场）

---

## 2. 公司速览

| 项目 | 内容 |
|---|---|
| 法律实体 | The Fun Group, Inc.，特拉华州，注册号 6659322 |
| 成立 | 2022 年（Fine 2020 年从斯坦福退学后创业；LinkedIn 记录为 2022-08） |
| 创始人/CEO | Alex Fine（26 岁，斯坦福数学与 CS，Z Fellows；16 岁创办学习 App Quill，2018-02 被收购） |
| 联合创始人/CTO | Mario Baxter（斯坦福 AI，提前毕业，前 Meta AI 工程师，西班牙托塔纳人）。来源为 2022 年公司官网 team.html 存档，2026 年 LinkedIn 显示现任 CTO 为 **Connor McEwen**，另见 Shiv Shrivastava（CSO）、Jeffrey Caron（CFO） |
| 总部 | 纽约 Midtown（周一至周四到岗，周五可远程）+ 新加坡 |
| 团队 | 约 30 人（2026-05 Fortune）→ 32 名全职 + 10 名全职承包商（2026-09 Mercury）。LinkedIn 页面显示 104 名员工（含历史关联） |
| 收入 | **未披露**（Fine 明确拒绝透露营收与是否盈利） |
| 客户端数 | 20+ |

**目标客户画像（官方口径）**：预测市场、永续合约 DEX、加密游戏、稳定币 Neobank、跨境 B2B fintech、在线博彩、TradFi 交易所与薪资平台、全球电商。SignalFire 补充的市场分层："这几类合计代表**数十万亿美元**的年支付流水，但仍在为更慢、更碎片化的世界所建的基础设施上运行。"

---

## 3. 产品与技术架构

### 3.1 四个产品

| 产品 | 定位 | 关键能力（官方原话要点） |
|---|---|---|
| **Deposit** | "优化加密入金转化率" | 智能弹窗适配 100+ 国家 / 50+ 支付方式；任意链任意代币入金，近乎即时结算到你指定的 token 或法币；每种支付方式都像原生 UI（用户不离开你的界面）；每笔交易由合规供应商筛查；支持团队进你的频道 7×24 处理工单；"有一支 **30+ 工程师与设计师**的团队持续为你提升交易量" |
| **Withdraw** | "让用户回来的提现" | 多链路由、法币出金、已保存账户、流动性管理由 Fun 托管；非技术用户可直接提现到银行账户；提现到涉 illicit 活动地址会被拦截 |
| **Orchestration** | "编排全球稳定币支付" | ⭐ 核心差异化：Fun 提供 **"合规优先的稳定币网关"（compliance-first stablecoin gateways）**——不只是给一个充值地址，而是让用户用任意支付方式把稳定币打到你的**持牌伙伴**的充值地址；支持**即时法币出金至 FBO 账户**（美国经纪商合规账户）以满足 flow of funds 要求 |
| **Checkout** | "在结账环节用加密支付" | 50+ 支付方式 / 100+ 国家；即时结算到指定 token 或法币；多角色分账、托管、复杂资金流配置；"为买家处理 gas、跨链和代币授权" |

> **Orchestration 是最容易被误读的产品**。Fun 官网自己给出的对比是：单纯提供充值地址的稳定币网关只能"on-ramp 或 off-ramp 用户"，而 Fun 的做法是在该充值地址之上叠加一层支付方式层——用户用法币/卡/交易所余额出资，Fun 负责路由并把稳定币结算到客户自己的持牌伙伴地址。这正是与 Mesh / Across / LI.FI 这类纯地址/桥接服务商的区别。

### 3.2 架构关键点（来自 Multicoin Summit 2025 演讲，最有价值的技术来源）

1. **反向拾取交易（核心设计）**。常规做法是用户广播交易到你的地址；Fun 反过来——"如果要让用户能发送任意资产，你需要做的是**拾取交易**"。用户拿到的是**一个地址**，"发送任意 token 到这个地址，所有资产都接受"。技术上需要逐链逐块反解区块，在数亿个事件中实时筛出属于自己的那几笔。Fine 明确表示 **Solana 最难**（"数据量最大"）。
2. **执行引擎反转滑点**。链上市场的规律是订单越大价格越差、吃单越深滑点越大，但用户心理是"我转的钱越多，应该拿到更好的价格"。Fun 为此做了**独立的 OTC 式执行引擎**，在链上完成百万美元级 USDT（甚至 SOL→ETH 这类跨币种）兑换。演讲中提到的**最大单笔处理为 $41M**。
3. **法币侧的解法是稳定币**。"即使我们服务的是 web2 客户、用的是 web2 支付方式，**底下跑的全是稳定币轨道**"——终端用户感知不到任何加密。
4. **有状态性（statefulness）**。本地 fintech 所有人支付方式相同，不需要 stateful；一旦面对全球碎片化，"系统必须非常 stateful 且智能，能预判这个用户到来时会做什么"。
5. **拉/推（pull/push）二分**。pull = 商户发起（绑卡、ACH，类 Plaid）；push = 用户发起（卡端入金）。当时市面上最好的 push 通道仍是聚合器。
6. **下沉到非加密金融**。演讲结论："全球金融科技远不止于加密。"当本地 fintech 想国际化时，**瓶颈往往不是产品市场匹配，而是接入本地支付轨道的通道**。

演讲中一个值得注意的用户研究细节：Fun 访谈的 10–12 个法币客户里，**没有一个人能成功完成入金**（受设备指纹、VPN、风控影响而被"莫名拦截"）；访谈的 10–12 个加密客户里，**有三四个人在直播访谈中把资金打进了黑洞**（把充值地址粘到 Binance，忽略链/币种警告）。

### 3.3 真实技术栈

| 层 | 技术 |
|---|---|
| 后端 | **TypeScript**，运行于 **AWS**（Mercury 访谈中 Fine 原话） |
| SDK / 前端 | **React**（`@funkit/connect`，另含 RN 绑定） |
| 智能合约 | **Solidity / Rust / Move**（Protocol Engineer JD 原文），生产级部署、多链、安全审计 |
| 数据 | `@datadog/browser-logs`、`@statsig/react-bindings`、SQL |
| 内部服务 | `frog.fun.xyz`（Next.js 内部服务）、`data-api.fun.xyz`（RBAC） |
| 代码托管 | GitHub `fun-xyz` org；Linear 工单（`linear.app/funxyz`）、Slack、Notion |
| 工程文化 | 高度偏 TypeScript 的全栈产品型团队；Protocol Engineer 岗同时覆盖 Ethereum/Solana/L2 |

### 3.4 `@funkit/api-base` 暴露的后端服务清单（逆向自公开 npm 包）

| 服务模块 | 用途 |
|---|---|
| `fiat` | 法币入金状态机客户端。`sendFiatTransition()` 返回 **host-signed identity assertion** 作为 bearer 凭证 |
| `assets` | 代币价格/白名单；**"仅返回 Alchemy 上已验证的 token（过滤 spam）"**；**UDA 源资产与最低额**；Lido stETH 提现 |
| `checkout` | `getCheckoutQuoteV2`（`routing: true` 走路由报价）、`getLightningQuote`、`initializeCheckout`（**已废弃："POST /checkout 于 2026-12-21 下线"**） |
| `direct-execution` | 直连执行：`txHash / fromChainId / fromTokenAddress / toChainId / toTokenAddress / fromAmountBaseUnit / sourceOfFund / type` |
| `bridge` | **Bridge（bridge.xyz）**：银行账户 + KYC（`guid / name / email / endorsement`） |
| `bluvo` | **Bluvo**：卡端提现，`requestQuotation` + `executeWithdrawal`（幂等键 + quoteId） |
| `meld` | **Meld**：加密入金 widget |
| `swapped` | **Swapped**：卡与银行通道 |
| `geo` | 呼叫方 IP 地理解析；注释明确"apiKey 只用于给 frog 的请求日志打客户标签，端点本身不按 key 鉴权" |
| `fw-paymaster` | **Fun Wallet gas paymaster** |
| `fw-operation`, `fops`（forms of payment）, `exchange-rates`, `xstocks` | 运营与报价支撑 |

### 3.5 商业模式与费用（唯一公开的商业信息）

Fun 不按订阅收费，而是**从价差/手续费中抽取**。Intercom 公开的 Checkout 费用结构（**注意：无任何数字或费率公开**）：

| 费用项 | 覆盖什么 | 从哪扣 |
|---|---|---|
| Transfer Gas Cost | 把源资产转入 Fun checkout pool 的 gas | 源链原生代币（ETH、POL…） |
| Market Maker (MM) Fee | 兑换、跨链、合约部署的 gas | 源资产 |
| Liquidity Provider (LP) Fee | 持有与保管链上资产的成本 | 源资产 |
| Exchange Processing Fee | 交易所连接方费用 + 其提现 gas | 源资产 |
| Card Processing Fee | 法币入金方运营与链上费用，含其手续费、**AML/KYC 成本**与 gas | 所用法币方式（卡） |

SDK 中还有一项重要机制：**`feeSubsidy`** —— "伙伴在结算后补偿的费用。该笔入金未被补贴时不存在。**一个预测：由结算时再次决定**"。这说明 Fun 与上游伙伴之间存在**费率补贴谈判**，最终费率在结算时敲定。

### 3.6 支持的链与代币

**链**（`@funkit/chains` v2.6.1 还原）：Ethereum、Base、Arbitrum、Optimism、Polygon、BSC、Avalanche、Gnosis、zkSync、Scroll、Linea、Blast、Manta、Mantle、Klaytn、Cronos、Ronin、Zora、Ink、Abstract、ZetaChain、XinFin、HyperEVM、Monad、Ethereal、Solana、Bitcoin、Lightning、Tron、HyperCore、**Lighter**、**Robinhood Chain**。

非 EVM chain id 常量（原文）：`SOLANA_MAINNET_CHAIN_ID = 1151111081099710`、`BITCOIN_MAINNET_CHAIN_ID = 8253038`、`TRON_MAINNET_CHAIN_ID = 728126428`、`LIGHTNING_MAINNET_CHAIN_ID = 29780`、`LIGHTER_CHAIN_ID = 3586256`、`LIGHTER_RH_CHAIN_ID = 548123634`、`MONAD_CHAIN_ID = 143`、`ROBINHOOD_MAINNET_CHAIN_ID = 4663`、`HYPERCORE_CHAIN_ID = 1337`、`HYPER_EVM_CHAIN_ID = 999`。

**代币**：公开帮助文章列出 USDC、USDC.e、USDT、DAI、ETH、WETH、MATIC、POL、SOL、CBBTC、ARB；SDK 中另有 USDe、USDG、pUSD、USDT0、BTC、xStocks（代币化股票）、Lido stETH。

**白名单策略**（SDK 注释）："我们对 Checkout 可用代币有**流动性门槛**限制。"

### 3.7 上游供应商（公开 SDK 枚举）

| 类别 | 供应商 |
|---|---|
| 法币入金（`FiatProvider` 枚举） | **Transak、Swapped、Banxa、MoonPay、MoonPay Guest、Stripe、Coinbase、Crossmint** |
| 路由（`RoutingProvider`） | Transak、Banxa、MoonPay、MoonPay Guest、Stripe、Coinbase（**注意 Swapped 与 Crossmint 不在路由集内**） |
| KYC（`KYCProvider`） | **Sumsub**（注释："SUMSUB alone at 0.7"）；iOS 端另含 Identific Mobile SDK |
| 卡与银行 | Bluvo（卡提现）、Swapped（卡与银行）、Bridge（银行账户 + KYC）、Meld（加密入金） |
| 跨链 | **Relay Protocol**（含 Solana-SVM / TRON / BTC adapter）、**Across**、内部 `oftEnabled`（OFT） |
| 索引/资产 | Alchemy（token 列表）、Lido（stETH）、xStocks、Flashnet（Lightning 通道） |
| 风控 | Fun 称"trusted vendors"但**未点名**；Fireblocks 亦指其"未披露任何具体能力、工作流或合作方" |

---

## 4. 融资

| 轮次 | 时间 | 金额 | 投资方 |
|---|---|---|---|
| 种子（Pre-Seed） | 2022-10-27 | **$3.9M** | **JAM Fund（领投，Tinder 联创 Justin Mateen）**、Soma Capital、NOMO Ventures、Great Oaks Venture Capital、Cory Levy |
| Series A | 2026-01 关闭，2026-05-01 公布 | **$72M** | **Multicoin Capital + SignalFire 联合领投**；Infinity Ventures、Pharsalus Capital、Justin Mateen；另据 Mercury：Streamlined Ventures、Cory Levy、Charles Songhurst，共约 80 位天使与机构股东 |
| （仅 Forge Global 记录，无公告） | 2026-10-14 | $25.59M @ $14.47/股，$609.81M 投后 | 未披露 |

**累计融资口径混乱**：CB Insights / cryptorank 记 **$75.9M**（2 轮）；CoinDesk 记 ">$75M"；Forge Global 的分档明细显示 2026-05-01 四个 Series A 子类合计 $70.23M + 2022 年 $3.9M ≈ $74.1M；但 Fun 官网在 2025-07-29 与 2025-09-09 两个快照上均写 **"has raised >$47m"**——**该数字无法与任何融资记录对上，标记为未解决矛盾**。

估值：Fortune 称 Fine 拒绝披露；Forge Global 的推算为 Series A 投后 **$324.95M**（2026-05），2026-10 后为 **$609.81M**。均非公司口径。

**用途**：工程投入、**新加坡办公室（亚太扩张）**、**可能的基础设施并购**、团队扩张。

**其他投资方**：IOSG Ventures 于 2026-10-26 宣布投资（金额未披露）。IOSG 在 2026-09-03 的分享中称 Fun 为"加密世界的 Stripe 收银台——一个**通用充值地址（UDA）**，所有进入 Polymarket 的钱都要经过它"。这是唯一明确 Fun 核心技术原语为 **UDA（Universal Deposit Address）** 的来源。

---

## 5. 发展史：2022 → 2026 的静默转型

这是本次调研中最有故事性、也最容易被外部资料误导的一段。

### 5.1 时间线

```
2022-09    AlexFine/fun.xyz 仓库建站。首页标题："The Wallet Development Platform"
            about.html 原文："Fun leverages account abstraction offered by EIP-4337"
2022-10-06 Wayback 首次抓取 fun.xyz
2022-10-27 宣布 $3.9M 种子轮。定位："基于 Odsy Network 构建 dWallet 应用"，
            自称"Odsy 生态的 ConsenSys"。团队仅 Alex Fine + Mario Baxter
2022-10-28 官网定位："Building decentralized multi-chain access control applications"
2023-01-02 该 GitHub 仓库最后一次提交
2023-08-31 FunKit 智能钱包协议主网发布（Medium 唯一一篇文章，577 claps）
2024-02-24 官网："FunKit — The wallet SDK to onboard users"，CTA 已变为"Buy crypto"
2024-07-23 ⭐ 转型标志："Checkout, built for web3"，CTA 变"PRIVATE ACCESS"
2025-07-29 官网："我们不关心新闻、帖子、演讲或炒作。**你不会在这里看到我们发推。**"
            同页："Fun processes >$1b in payments annually, and has raised >$47m"
2025-09-09 同页更新为 ">$2b in payments annually"
2025-11-01 ⭐ "Modern payment infrastructure for fast growing fintechs"；
            "$6b processed each year"；"Introducing a new category – Deposit"；
            客户 logo：Bankr, Based, Ethereal, Hyperbeat, Katana, Ostium,
            Polymarket, Hyperswap, MegaETH, AxonX, Degen, HyENA
2026-02-07 首页仪表盘："Annualized Transaction Volume >$6B / Median Transaction Time <5s /
            Transactions Processed $41.8m / Transaction Success Rate >99.999% /
            <1bp institutional grade order execution / >2m transactions processed each year"
2026-04-09 "Enterprise-grade infrastructure for internet capital markets"
2026-05-01 $72M Series A 公开
2026-10-30 现状：$18B+/年，20+ 客户，~30 人，纽约+新加坡
```

### 5.2 四个需要纠正的外部叙事

1. **"$3.9M 种子轮从未公开"是错的**。Fortune（2026-05-01）写 "previously unannounced"，The Block 跟着抄。但 2022-10-27 的 PRNewswire/GlobeNewswire 原文标题就是 *"Fun Announces $3.9M in Pre-Seed Funding"*，FinSMEs（2022-10-28）、CrowdFundInsider（2022-10）均有报道，Forge Global 也有 2022-10-27 的多档股份记录。**Fortune 的表述不准确。**

2. **Fun 与 Odsy/dWallet 是"合作"而非"被收购"**。新闻稿原文："Fun 是**第二家**获得 VC 支持、专门在 Odsy Network 上构建应用的公司，与 dWallet Labs 并列"。CB Insights 收录的 Soma Ventures 页面写得更直白："Becoming the ConsenSys of the Odsy network." 但 Fun 自己的 about.html 写的是 **EIP-4337**——Odsy/dWallet 是 PR 定位，FunKit 实际是自研的 ERC-4337 合约栈（`FunWallet` / `FunWalletFactory` / 验证与执行模块），2023 年 8 月的发布文章里**完全没有提到 Odsy**。Odsy/dWallet 最后可查的活动是 2024-04-09 的 "dWallet Network brings multi-chain DeFi to Sui"。

3. **FunKit 从未发币**。任何来源都找不到 Fun/FunKit 的代币、空投或创世事件。发布文里提到的 "hooks for developer monetization ... via native token or ERC-20" 指的是**商户自己的代币**。

4. **"Polymarket 合作始于 2024 年 8 月"未经证实**。该说法出自 Alex Fine 本人在 Multicoin 演讲中的口述，无任何有日期的公开来源；而 Wayback 显示 Fun 的支付定位在 **2024-07-23** 就已上线——**比 8 月更早**。可确认的是：2023 年 Polymarket 的法币入金合作方是 **MoonPay**（MoonPay 官方 newsroom 有公告），Fun 是后来取代者。

### 5.3 需要警惕的过期资料

**PitchBook 与 MaC Venture Capital 的公司描述至今仍是 2022 年口径**——"decentralized multi-chain access control platform"、"web3 access control wallet infrastructure"。这是 Fun **自己 2022–2023 年的钱包基础设施阶段**的残留，不是另一家公司。任何基于这两条描述做的竞品分析都是错的。PitchBook 还给出 "Employees: 47"（2022 年口径，与今日 ~30 人矛盾），且 CB Insights 的总部地址 "5 Spring Street, Wheatley Heights, New York" 自相矛盾，不可信。

**同名干扰项**（需澄清）：Treasure Fun XYZ（代币 TUFT，一个小游戏 App，空投活动）、FUN.com（家居零售品牌）、以及 PitchBook 上另一个 Fun（profile 187942-42，消费品牌）。**不存在另一个先于本公司的 "fun.xyz 协议"。**

---

## 6. 合规与法律姿态（被严重低估的部分）

fun.xyz Terms of Use（2026-08-13 最后修改）里有一句话，是理解 Fun 商业模型的钥匙：

> **"Fun is a technology company.** The Site is software that orchestrates deposit and withdrawal transactions across a range of execution methods... **Fun is defi payment infrastructure, not a money service.**"
> "A Deposit Address does not create any custodial, stored value, money transfer or account relationship between you and Fun."

### 6.1 三种 Fulfillment Method（原文）

| | 机制 | 后果 |
|---|---|---|
| **(a) Licensed providers** | 法币出入金由第三方持牌服务商执行，"该服务商——而非 Fun——提供支付或资金服务，其条款管辖该服务" | Fun 不承担 money service 角色 |
| **(b) On-chain infrastructure** | 通过第三方协议、DEX、桥、solver、做市商执行；**Fun 既不持有也不控制资产** | 非托管 |
| **(c) Fun as principal** | 对支持的代币，**Fun 直接从你手中买入代币**以换取你指定的目标代币；"**Fun 不是你的代理、经纪或服务提供商——Fun 是你的交易对手**" | Fun 变成商品买卖对手方（principal-to-principal crypto sale），进一步规避牌照 |

**3.1 选择权在 Fun**："Fun 自行决定每笔交易的 Fulfillment Method，**不承担最佳执行义务**（undertakes no duty of best execution）。" 考量因素包括价格、速度、可靠性、司法辖区与可用容量；方法可能逐笔不同，且**可能不提前告知用户**。

> **这是本次调研中最重要的单条发现**：Fun 的合规结构不是"我们申请了牌照"，而是"我们从结构上就不是资金服务商"。这解释了为什么它能处理 $18B/年的全球出入金而没有自有牌照——代价是它在法律上不承担最佳执行义务、不提供托管、也不保证用户拿到最优价格。

### 6.2 其他关键条款

- **准入排除**：18+；**排除纽约、加州、佛罗里达、明尼苏达、路易斯安那州居民**。
- **适用法律**：特拉华州。争议解决：**ICC 仲裁**，一名仲裁员，英语，**仲裁地纽约**，集体诉讼放弃，诉前 30 天协商；争议金额 ≤ $10,000 时 Fun 承担全部仲裁费用。
- **风险提示**：发送不支持的代币"可能造成**不可恢复的损失**"；低于界面最低额的入金会导致"资金卡在充值地址里"。
- **无托管声明**贯穿官网页脚："Fun provides technology infrastructure only. Any payment and financial services are delivered by our partners under their own regulatory authorizations."

### 6.3 未公开的合规事实

- **没有任何公开的安全认证**（SOC 2 / ISO / NYDFS 等）。Fireblocks 明确指出这"对受监管 PSP 与 fintech 的供应商准入是实质性的卡点，与体量声明无关"。
- **没有公开牌照、监管机构、MSB/MIB 注册号**。
- **KYC 供应商在 SDK 契约中是明确的（Sumsub），但在官网上是匿名的**（"trusted vendors"）。
- **数据留存与申诉**：人工审核 ≤48 小时；"我们无法分享触发审核的具体细节"；被拒后需签名（无 gas）证明钱包归属，退款须走**另一个钱包**。
- **KYC 同意书语种**：`en, es, fr, ja, ko, ru, tr, zh`。
- **KYC 字段集**包含：法定姓名、出生日期、出生国/城市、国籍、邮箱及其所有权验证、手机号及其所有权验证、住址、**税号、美国 SSN 后四位、税务居民国、就业状态、职业行业/职称、资金来源/收入/财富来源声明、服务/交易目的、客户类别**。
- **合约里有一条未决问题**：`"v1 scope assumed yes for FCA/UK — product confirm."` —— 说明英国 FCA 合规范围在 v1 时尚未最终确认。

---

## 7. 竞争格局

### 7.1 唯一一份点名 Fun 的第三方横评

Fireblocks 于 2026-06-09 发布《Stablecoin Acceptance Infrastructure Comparison: Fireblocks Flow vs. Mesh vs. Fun.xyz vs. Swapped Connect》，署名 Nabil Manji（SVP/GM, Head of Crypto and Web3）。作为竞品撰写，立场需打折扣，但底层事实可核对，且与 Fun 官网自述一致：

| 维度 | Fireblocks Flow | Mesh | **Fun.xyz** | Swapped Connect |
|---|---|---|---|---|
| 定位 | PSP/fintech/iGaming 端到端稳定币受理 | 单一 API 从钱包/交易所入金 | **白标出入金与支付编排，完全嵌入 + 高接触交付** | iFrame 中间件 |
| 托管 | Fireblocks Vault / 嵌入式钱包 / 客户自配地址 | BYO wallet | **BYO wallet，客户自备托管** | BYO wallet |
| 钱包覆盖 | 800+ | 225 | **未公开披露广度** | 17 |
| 路由 | 内建，含自动路由与容错 | SmartFunding 自动路由 | **未公开文档化，每次定制集成内私有处理** | 自动 swap/bridge |
| 合规 | 内建制裁筛查 + TRM/Chainalysis 可插拔 | 未公开 | **匿名的 "trusted vendors"，能力与伙伴均未披露** | 仅出金端做 KYC |
| 对账 | 审计级端到端 | 无 | **未公开文档化** | 无 |
| 安全认证 | SOC 2 Type II / SOC 1 / ISO 27001,27017,27018 / CCSS L3 / ISO 22301 / NYDFS | 无 | **无公开披露** | 无 |
| 集成方式 | 自助，含 SDK、HMAC 签名 webhook、沙箱 | 5 个 SDK（Web/RN/iOS/Android/Flutter） | **无公开文档、无开发者门户、无自助接入；每个集成都由 Fun 工程师嵌入客户团队** | 仅 iFrame |

Fireblocks 的关键论断（原文要点）：

- "Fun.xyz **没有公开文档、没有开发者门户、没有 SDK 文档、没有自助 onboarding**。每个集成都需要 Fun 的工程师直接嵌进客户团队。"
- "Fun.xyz **没有任何公开披露的安全认证**，尽管其年处理 $180 亿。对需要走供应商准入流程的企业 PSP 与受监管 fintech，这是实质性的卡点。"
- "Fun.xyz 的客户基础高度集中在 DeFi 与加密原生公司，公开客户多为交易平台与预测市场；**PSP、受监管 fintech、持牌 iGaming 运营商三个垂直领域尚无公开客户**。"

但 Fireblocks 也罕见地给了正面评价：

> "Fun.xyz 在其细分市场有**真实的业绩证明**。其 $180 亿年交易额与经由 Polymarket 的 500 万+ 日交易量是可信的性能数据，其定制化模式为有资源、有时间表的团队产出了高转化的集成。**对于有定制需求和专职工程团队的 DeFi 原生平台，Fun.xyz 的白手套模式确实能交付结果。**"

### 7.2 竞品矩阵

| 公司 | 定位 | 融资/规模 | 托管 | 与 Fun 的关系 |
|---|---|---|---|---|
| **Fireblocks Flow** | PSP/fintech/iGaming 端到端稳定币受理 | Fireblocks $550M E 轮、$80 亿估值；2200+ 机构、$10T+ 资产、100+ 链 | 可选托管 | **直接竞品**，且是唯一写横评点名 Fun 的 |
| **Mesh** | 单 API 入金 + SmartFunding 自动路由 | $82M B 轮(2025-03)，C 轮 $75M → **$10 亿独角兽**；约 $100 亿/月 | BYO wallet | **直接竞品**；开发者优先，5 个 SDK |
| **Swapped Connect** | iFrame 入金中间件 | Crunchbase 在册 | BYO wallet | **直接竞品**；仅入金无出金，仅 iFrame |
| **Transak** | 法币↔加密 on/off-ramp | $37M；2026-04 最新 A 轮 | **持牌 VASP，托管** | **重叠在法币腿**——Transak 是 Fun 路由的持牌伙伴之一 |
| **MoonPay** | 消费品牌加密买入/卖出 | $645M，$34 亿估值 | 持牌托管 | 重叠；**MoonPay 曾是 Polymarket 2023 年的入金方**，也支撑 Stripe 的 onramp |
| **Ramp Network** | 非托管钱包 + Ramp Instant | $300M→$750M→约 $18.5 亿（$60 亿估值） | 部分非托管 | 重叠；**Stripe 用的是 Ramp 而非 Fun** |
| **Banxa** | 嵌入式法币入金 | 2026-01-02 被 **OSL Group 收购**（获得 40+ 牌照） | 持牌 | 重叠；已成上市公司子公司 |
| **Bridge (bridge.xyz)** | 稳定币编排 API | **被 Stripe 以 $11 亿收购**（2024-10-21 宣布，2025-02-04 完成，Stripe 史上最大并购） | 基础设施 | **直接竞品**（稳定币编排），且已申请 OCC 银行信托牌照 |
| **Privy (UDA)** | 嵌入式钱包 + 通用充值地址（2026-05） | **被 Stripe 收购** | 非托管 | **直接竞品**，同一"充值地址"赛道 |
| **Conduit** | 稳定币钱包 + 全球出入金 | $36M A 轮(2025-05)，累计处理 $100 亿+ | 多选 | 直接竞品 |
| **Alchemy Pay** | on/off ramp + 加密卡 + 数字银行 | 仅 ~$10M 融资；19 个美国州 MTL | 持牌 VASP | 重叠 |
| **Stellar / MoneyGram** | 支付优先公链 + 汇款网络发 MGUSD | SDF 非营利；MoneyGram 全球网络 | 托管（MoneyGram） | 重叠在汇款/出金腿 |
| **Nuvei** | 卡收单 + 区块链支付方案 | 上市公司（NUVI），$27.5 亿全球协议 | 托管 | 重叠在商户结账；分销渠道而非加密原生 |
| **Simplex** | 卡优先即时入金 | 仅 $19M（该组最小） | 持牌 | 法币腿重叠 |
| **Strike / Lightning** | Bitcoin 支付 | 私营 | 非托管 | 仅在 Checkout 层面；Block 已将 Lightning 铺到 100 万美国商户(2026-05) |
| **Coinbase Commerce** | 商户加密结账 | Coinbase | 托管 | **2026-03-31 关停**，Coinbase 转向 "Coinbase Payments" |
| **MetaMask** | 消费钱包 + mUSD（Bridge/M0 支持） | Consensys 系 | 自托管 | 零售钱包 + 入金面的重叠 |

### 7.3 一个结构性判断

**Fun 在消费级 onramp 榜单上是隐形的。** Onramper《Best Crypto Onramp Guide 2026》、Openfort《7 MoonPay Alternatives for Developers in 2026》、Crossmint《MoonPay vs. Transak》、eco.com《Best Crypto Payment Gateways 2026》——全部覆盖 Fun 的竞品，**无一提及 Fun**。CB Insights 的 MoonPay 竞品集、Wyre 竞品集也不含 Fun。

原因很清楚：Fun 是 **B2B 白标后台**，不做消费者品牌，不做自助接入，因此不在任何面向开发者的选型清单里。这既是它的定位优势（深度定制、高转化），也是它的获客瓶颈（**95% 客户来自投资网络的暖启动推荐**，Mercury 访谈中 Fine 原话）。

---

## 8. 数据一致性与未解矛盾

### 8.1 关键指标的时间序列（说明差异多来自时间点）

| 指标 | 2022-10 | 2025-07 | 2025-09 | 2025-11 | 2026-02 | 2026-05 | 2026-08 |
|---|---|---|---|---|---|---|---|
| 年化交易额 | — | $1B+ | $2B+ | $6B | $6B | **$18B+** | $3B/月(≈$36B) |
| 融资额 | $3.9M | >$47m(官网) | >$47m(官网) | — | — | $72M | >$75M |
| 客户数 | — | — | — | — | — | 20+ | 20+ |
| 员工 | 2 | — | — | — | — | ~30 | 32+10 承包 |

> 注意：官网 2025-07 的 ">$47m raised" 与任何融资记录都对不上（2022 年 $3.9M + 2026 年 $72M = $75.9M）。**未解决。**
> CoinDesk 2026-08 的 "$3B/月" ≈ 年化 $36B，是所有口径中最高的，与官网 $18B 差一倍。时点不同，但差距超出"半年增长"可完全解释的范围，**建议按区间理解**。

### 8.2 ⭐ 重大矛盾：美国在受限名单上

Intercom《Regional Restrictions》把 **United States of America** 列入**不提供服务**名单，同时列出约 25 个受制裁/合规受限国家。

这与"100+ 国家"、"Polymarket 覆盖美国用户"**直接冲突**。最合理的解释是：该限制适用于 **Fun 自有的消费端 Checkout widget（Fun 的 App）**，而非面向持牌运营商（如 Polymarket）的合作方 API；但 **Fun 并未如此说明**。同时 Terms 又单独排除了 NY/CA/FL/MN/LA 居民。**此处存在公开口径冲突，未解决。**

### 8.3 其他需要打折看待的数字

| 数字 | 来源 | 评估 |
|---|---|---|
| 转化率提升 **3.4x–8x**（相对 MoonPay / Stripe）、法币量 **8x** | 厂商自述，经 CryptoBriefing 转述 Fortune | **自述且无法独立验证**。CryptoBriefing 自己就标注："Fun 的转化率声明是自述的，公司有明显动机以最有利方式呈现。**8x 这个数字尤其值得审视。在出现独立基准之前，投资者应将其视为指示性而非确定性。**" |
| ">99.999% 成功率" vs ">99.99% uptime" | 官网/PR vs SignalFire | 两个不同指标，不必然矛盾，但对外表述不统一 |
| "<5s 结算 $1M 交易" | 官网 | 未说明是链上最终性还是内部记账口径 |
| 峰值单笔 $41M | 演讲 + 2026-02 首页 | 相对可信（有截图佐证） |

### 8.4 ⭐ 一个安全观察：公开 npm 包中含 48 个客户 API Key

**本次调研已独立复核确认**：`@funkit/api-base@10.0.0` 的 npm tarball 中，`package/dist/src/consts/customers.d.ts` 逐条硬编码了 **48 个客户的生产环境 API Key**，命名格式为 `<CUSTOMER>_API_KEY`。例如：

```
export declare const AAVE_API_KEY = "EWzS...5ztS";
export declare const POLYMARKET_API_KEY = "Y53d...t1k6";
```

涉及的客户标识（按类别整理，标识符为原文）：

- **预测市场 / 博彩**：POLYMARKET、POLYMTRADE、PREDICT、OPINION、FLIP、FLIPGG、RAREBETSPORTS、MONKEY_TILT、VARIATIONAL、BETMOAR、EITGHTYEIGHTUPS
- **Perp DEX / 交易**：LIGHTERXYZ、LIGHTER_RH、HYPERDASH、HYPEREDGE、PERPL、TRADEFOX、WATERFOWL、MEGAPOT、CAMBRIA、KURU、LASTPACK、JTX
- **借贷 / DeFi**：AAVE、BENQI、BENTO、BULLPEN、DEGEN、QUICKSWAP、SUSHI、AXIOM、BASED、PUMPFUN、MONAD、NADO、ROLLY、YENO、GINZA、BSX、AVANTIS
- **券商 / 平台**：FANATICS、MALLARD、VENTUALS、WHOP、GIVEAWAYS、GLOBAL_COMPUTE

这些 key 看起来是**每客户一个**的（每个客户只在自己的 SDK 副本里看到自己那把），因此单个 key 泄漏的影响有限；但**完整客户名单可从一个公开制品枚举出来**。**本次调研未对任何 key 做 API 调用测试。** 对任何评估 Fun 密钥管理卫生的人，这是值得记录的点。

---

## 9. 对 `fun-xyz-research`（Lighter 案例）的相关性

若当前项目与 Lighter 相关，以下事实直接可用：

1. **Lighter 是 Fun 的公开客户**。fun.xyz/solutions/defi-trading 页称："Lighter 处理数十亿美元永续合约交易量，Fun 为每一笔流入流出的资金提供轨道服务。**交易在 Lighter 的 appchain 上执行**，带来了可访问性挑战。Fun 让用户能以任意方式在 Lighter 网络上即时出入金。"
2. **Lighter 与 Fun 存在 appchain 级耦合**。SDK 链常量含 `LIGHTER_CHAIN_ID = 3586256`（主链）与 `LIGHTER_RH_CHAIN_ID = 548123634`（Robinhood Chain 版）。`@funkit/chains` 中 Lighter 的浏览器标注为 **"Lighter Explorer (Robinhood)"**，另有独立的 `Robinhood Chain` 条目。
3. **存在两套白标 SDK 主题**：`clients/lighter.tsx` 与 `clients/lighterRh.tsx`。后者含 `LIGHTER_RH_STOCK_ASSETS`，并按资产路由：**`asset.symbol === "USDG" ? "perps" : "spot"`**。
4. **端到端流程形态**（SDK 注释）：Robinhood Chain 上 `Mallard` 主题带 `VAULT_DEPOSITOR_ABI`；`Rolly` 走 Arbitrum 的 `USDT0` → `VAULT_DEPOSITOR_ARBITRUM`（合约 `0xC8A6871D4eC4DaE64F605db0f8a0B3D9ef928D64`）。
5. **出入金链路**：Wallet 入金 <2 分钟、卡 <3 分钟、交易所 <4 分钟；"Transfer Crypto"（直接链上转入）为 quoteless 通道，大额会拆单以控制价格冲击；最低额 ETH/BTC/Tron >$10，Polygon/Base/Arbitrum/Solana >$3；订单 >35 分钟过期。
6. **api.fun.xyz 的白标主题可直接看出各客户链配置**，包括 `clients/aave.tsx`、`clients/axiom.tsx`、`clients/fanatics.tsx`、`clients/mallard.tsx`、`clients/nado.tsx`、`clients/rolly.tsx`、`clients/solana.tsx`、`clients/hypercore.tsx`。

---

## 10. 未能验证 / 仍存在的问题

1. **`docs.fun.xyz` 的任何一页内容**——完全登录墙。API 认证方式、webhook 签名规范、真实 SLA 数值、SDK 快速开始全部未知。
2. **`api.fun.xyz` 带有效 key 的行为**——全部路径 403。
3. **SLA 数值**——所有营销页列出 SLA 类别（Uptime、Settlement time、Asset coverage、Spreads、Availability、Response time）但**一个数字都不给**。
4. **费率**——只有五项费用构成，无任何百分比或费率表。
5. **营收与盈利**——Fine 明确拒绝披露；CB Insights 记为 $0。
6. **Series A 估值**——官方未披露；Forge Global 的 $324.95M / $609.81M 均为推算。
7. **官网 ">$47m raised" 的来源**——无法与任何融资记录对应。
8. **"Polymarket 合作始于 2024 年 8 月"**——仅有本人演讲口述，无有日期来源；Wayback 显示支付定位 2024-07-23 已上线。
9. **2026-10-14 的 $25.59M 一轮**——仅见于 Forge Global，无公司公告、无媒体报道。
10. **美国受限名单 vs "100+ 国家"**——公开口径冲突。
11. **Fun 的安全认证与具名合规伙伴**——无公开披露，Fun 亦未否认。
12. **首页三段视频证言**（Ostium 的 Kalodora Fontana Kiernan-Linn、Ventuals 的 Alvin Hsia、Polymarket 的 Mustafa Aljadery）——仅有视频资产，**无文字稿**。
13. **第二篇 Multicoin 演讲**（Alex Fine 的 X 帖提到 2026 年 Multicoin LP Summit 的 "on Deposits" 主题演讲，帖文称 300 万浏览）——**未找到视频或文字稿**。这是最值得追的下一步，很可能是最新的架构信息。
14. **BusinessWire 原稿**——三次尝试均 403；最接近的替代是 Financial IT 与 Electronic Payments International 的转载。注意 **Polymarket VP Josh Stevens 的引语在不同转载中有两个明显不同的版本**（长版见 fun.xyz/SignalFire/FinTech Global，短版见 Financial IT/Pulse 2.0），推测新闻稿在分发前后被修订过。
15. **联合创始人身份**——Mario Baxter 的 CTO 身份来自 2022 年官网存档；2026 年 LinkedIn 显示 CTO 为 Connor McEwen，未找到正式交接公告。
16. **CryptoBriefing 提到的"Fortune 8x 转化率"原文**——未找到对应的 fortune.com 原始 URL。
17. **无任何 Fun 代币**——多来源确认无代币、无空投。

---

## 11. 综合评估

**Fun 做对了什么**

- 卡位精准。它没有去卷消费级 onramp（MoonPay/Ramp 的地盘），而是选了"交易平台/预测市场的出入金后端"——一个转化率直接决定留存、且客户有专职工程团队愿意配合深度定制的窄门。
- 商业模式与合规结构自洽。"技术基础设施 + 三种 Fulfillment Method（含 principal 交易）"的结构让它能合法跑 $18B/年的全球出入金而不必自持牌照。
- 数据飞轮真实存在。SignalFire 的论证成立：每个新客户带来新的地域、币种、用户行为与边缘情况，改进全网路由性能，让下一个集成更好。Polymarket 的入金体验已成为"事实上的样板间"，多家潜在客户在没有 Fun 任何市场动作的情况下主动找上门。

**Fun 的结构性弱点**

- **没有自助接入能力**。这是 Fireblocks 的核心论点，也是客观事实：没有公开文档、没有开发者门户、没有自助 onboarding、没有公开的 SLA 数字、没有安全认证。对受监管的 PSP/fintech 而言，这些是供应商准入的硬门槛——它们失去了 PSP、持牌 fintech、持牌 iGaming 三个垂直市场。
- **没有网络效应护城河，正如他们自己承认**。Fine 在 Mercury 访谈中说得很坦白："今天大多数所谓的护城河只是起跑优势，真正的运营护城河要到极大规模才会形成。"Fun 的护城河只有**人才密度**——约 30 人做 $18B/年的业务，这确实是个奇迹，但也是脆弱的：核心路由逻辑无法被第三方复制，而关键人风险极高。
- **获客结构性受限**。95% 客户靠投资网络暖启动意味着增长上限受限于 Multicoin/SignalFire 的关系网半径。这解释了为什么 Fun 在所有开发者 onramp 榜单上隐形。
- **头部集中度风险**。48 个客户里，Polymarket 单家的量级（5M+ 日交易）可能是决定性的。对一家 30 人的公司，这是双向的——护城河和风险同源。

**最该盯的三条线**

1. **第二篇 Multicoin 演讲**（"on Deposits"）——最新架构信息，尤其是 3.4x–8x 转化率声明的方法论。
2. **Stripe/Bridge/Privy 的加码**。Stripe 同时控制着 Bridge（稳定币编排）、Privy（UDA 充值地址）、MoonPay + Ramp（法币腿）以及自有 Tempo 链——Fun 在 "Checkout" 和 "Orchestration" 两个方向上同时面对垂直整合的巨头。
3. **新加坡扩张**。这是公司唯一在公开意义上表示要"在亚太扩张"的举措，也是它第一次面对美国以外的监管辖区（MAS）。FCA/UK 范围在 SDK 契约里仍标注为未确认，说明合规扩张在 v1 时点还没走完。

---

## 7.5 开源情况专项核查（2026-10-30 实测）

**结论：法律上是 MIT，实践上是 "source-available"，不是开源。没有可提 PR 的公开仓库。**

### 7.5.1 GitHub 组织 `fun-xyz`（建于 2022-11-17）

公开仓库**仅 4 个**：

| 仓库 | 语言 | 性质 |
|---|---|---|
| `fun-xyz/funkit-ios` | Swift | 原生 iOS SDK，但**分发的是预编译 XCFramework**（从 `sdk-cdn.fun.xyz/funkit-swift/0.1.0-rc.6/` 下载），**不含源码** |
| `fun-xyz/safe-utils` | — | Foundry 脚本，调用 Safe API |
| `fun-xyz/hardhat` | TypeScript | Hardhat 的 fork（2023） |
| `fun-xyz/web3-react-magic-auth` | TypeScript | web3-react magic-auth 的 fork（2023） |

**私有（404）**：`fun-xyz/funkit`（**主 monorepo**）、`fun-xyz/fiat-contract`。组织 `TheFunGroup` 下 **0 个公开仓库**。

### 7.5.2 npm 包：全部 MIT，但都是编译产物

**`@funkit/connect` v12.21.0**（主前端 SDK，1.4 MB）

- `dist/` 下 **298 个 `.js` + 815 个 `.d.ts`**
- **无 `src/` 目录，无 `.js.map`** → 原始 TypeScript 源码**不可还原**
- 编译产物保留了 `// src/clients/lighter.tsx` 这类**源路径注释**与完整 ESM import 结构，**逻辑基本可读**
- 白标主题以编译形式发布：`dist/clients/{lighter,lighterRh,aave,axiom,fanatics,mallard,nado,rolly,solana,hypercore,polymarket}.js`
- **`CHANGELOG.md` 达 268 KB / 369 个版本条目**——完整发布历史，本身是高价值资料
- README 自述：**"This package is currently in closed beta"**，需联系 `developers@fun.xyz`
- `exports` 暴露子路径：`./wallets`、`./clients/*`、`./styles.css`、`./shadow-css`
- 技术栈线索：`sideEffects: ["src/css/reset.css.ts"]`（vanilla-extract）、vitest、storybook、`@vitest/ui`

**`@fun-xyz/fiat-contract` v0.47.0**（120 KB）—— ⭐ **最接近真正开源的产物**

> "Published conformance contract for Fun's headless fiat onramp: FlowState/Transition types, zod schemas, **the transition table as data**, recorded fixtures, assertion helpers."

实测 `require()` 后可直接读出：

| 导出 | 内容 |
|---|---|
| `TRANSITION_TABLE` | **17 个状态的对象**；每个状态含 `allowedTransitions[]`，每条转移带 `endpoint` / `mode` / `when` 条件 / `note` 说明 |
| `DOCUMENTED_ENDPOINTS` | 23 个已文档化端点，如 `"GET /fiat/payment-methods"` |
| `UNOFFERED_ENDPOINTS` | 7 个**明确未开放**的端点（带原因说明） |
| `STATE_KEYS` | 17 个状态键 |
| `TERMINAL_ORDER_STATUSES` | `SETTLED, EXPIRED, CANCELLED, FAILED, REFUNDED` |
| `TABLE_VERSION` | `0.47.0`（与包版本同步） |

示例（`QUOTE` 状态的转移表，节选原文）：

```json
{
  "key": "QUOTE", "kind": "QUOTE", "screens": [1], "docStatus": "SPECIFIED",
  "allowedTransitions": [
    { "id": "continue", "mode": "SUBMIT", "endpoint": "POST /fiat/session",
      "when": "no valid provider session token (own-tables check)" },
    { "id": "open_session", "mode": "SUBMIT", "endpoint": "POST /fiat/payment-session",
      "when": "returning user, session + KYC valid, capture-first rail — the method authorises before any order exists",
      "note": "Returns PAYMENT{CAPTURE} carrying the Surface. Without this entry the capture-first rail has no legal way in..." }
  ]
}
```

按 provider 拆分独立子路径：`/moonpay`、`/moonpay-guest`、`/coinbase`、`/routing`、`/terms`、`/types`、`/table`。**无 `.ts` 源文件，但 `table.js` 直接导出结构化数据——用 Node 就能完整读出协议状态机。**

**其余包**：`@funkit/connect-core`（无头核心）、`@funkit/connect-rn`（React Native）、`@funkit/connect-js`（框架无关）、`@funkit/api-base`、`@funkit/chains`、`@funkit/utils`、`@funkit/fun-relay`、`@funkit/wallet-phantom`、`@funkit/eslint-config`。
**历史包**（2023 FunKit 时代）：`fun-wallet` 0.3.4、`@funkit/core`、`@funkit/react`、`@funkit/shared`、`@funkit/wagmi-tools`。

### 7.5.3 判断

| 维度 | 结论 |
|---|---|
| 许可证 | ✅ MIT（`connect` 与 `fiat-contract` 均为），可商用、修改、闭源分发 |
| 源码可读 | ⚠️ **前端 SDK 不行**（无 src、无 sourcemap）；但编译产物保留源路径注释与完整 import 结构，逻辑可格式化还原 |
| 可审计 | ✅ 类型声明完整（815 个 `.d.ts`）；状态机契约完全公开 |
| 可贡献 | ❌ 无公开 monorepo、无 CONTRIBUTING、无 issue/PR 流程 |
| 可自建 | ✅ `fiat-contract` 的状态机以数据形式完全公开，据此可自行实现客户端或写一致性测试 |
| 可直接用 | ⚠️ `@funkit/connect` 需向 Fun 申请自己的 API key（包里硬编码的 48 把是各客户自己的，见 §8.4） |

**对 fun-xyz-research（Lighter 案例）的直接价值**：Lighter 的 appchain 接入参数**全部可从公开 npm 包直接读出**，无需 Fun 的开发者权限——包括 `LIGHTER_CHAIN_ID = 3586256`、`LIGHTER_RH_CHAIN_ID = 548123634`、`clients/lighter.tsx` 与 `clients/lighterRh.tsx` 的主题配置、以及各链的 `VAULT_DEPOSITOR` 合约地址（`0xC8A6871D4eC4DaE64F605db0f8a0B3D9ef928D64` 等）。

---

## 附录 A：来源清单

**一级 / 官方**
- fun.xyz 首页、/about、/careers、/contact、/terms、/privacy
- fun.xyz/products/{deposit,withdraw,orchestration,checkout}
- fun.xyz/solutions/{fintech-payments,defi-trading,sports-gaming}
- fun.xyz/news/series-a（2026-05-01）
- BusinessWire 新闻稿（403，需转载）：businesswire.com/news/home/20260501170322/en/
- PRNewswire 2022 种子轮：finance.yahoo.com/news/fun-announces-3-9m-pre-130000875.html
- Medium（仅一篇）：medium.com/@funxyz/introducing-funkit-the-complete-wallet-development-platform-ff57275938f8
- docs.fun.xyz（Mintlify，登录墙）、api.fun.xyz、frog.fun.xyz、data-api.fun.xyz、sdk-cdn.fun.xyz
- intercom.help/funxyz/en/（公开帮助中心）
- GitHub org `fun-xyz`：`funkit-ios`、`safe-utils`、`hardhat`、`web3-react-magic-auth`
- `AlexFine/fun.xyz`（2022 年官网源码）、`AlexFine/fun-wallet-examples`

**SDK / 包**
- npm `@funkit/connect` 12.21.0、`@fun-xyz/fiat-contract` 0.47.0、`@funkit/api-base` 10.0.0、`@funkit/chains` 2.6.1、`@funkit/connect-core`/`-rn`/`-js`、`@funkit/fun-relay`、`@funkit/wallet-phantom`
- 历史：`fun-wallet` 0.3.4、`@funkit/core`、`@funkit/react`

**投资方 / 媒体**
- SignalFire 投资信（2026-05-06）：signalfire.com/blog/fun-investor
- Fortune 独家（2026-05-01）：fortune.com/2026/05/01/fun-series-a-fundraise-multicoin-capital-signalfire
- CoinDesk（2026-08-02）：coindesk.com/tech/2026/08/02/the-future-of-crypto-payments-won-t-include-on-ramps-or-bridges-fun-ceo-says
- Mercury 创始人访谈（2026-09-01）：mercury.com/blog/alex-fine-fun-founder-payments-blockchain-polymarket
- The Block（2026-05-01）、FinTech Global、PYMNTS、Pulse 2.0、Electronic Payments International、Financial IT、citybiz、The Paypers、CryptoBriefing、crypto.news、FinTech Futures、StartupFortune
- Multicoin Summit 2025 演讲：youtube.com/watch?v=ignlyX4aWow
- Fireblocks 对比报告（2026-06-09）：fireblocks.com/report/compare-stablecoin-acceptance-infrastructure

**数据库 / 档案**
- CB Insights、PitchBook、Tracxn、cryptorank、Forge Global（funxyz_stock）、Welcome to the Jungle、Wayback Machine 多个快照
- IOSG 投资（2026-10-26，cryptorank）；IOSG 分享文字稿（chaincatcher.com/article/2287399）

## 附录 B：调研方法与可信度分级

- **直接验证**：官网/条款/帮助中心原文抓取；npm registry 元数据与 tarball 下载解包；`api.fun.xyz`、`docs.fun.xyz`、`sdk-cdn.fun.xyz` 的 HTTP 状态与响应头；GitHub API；Lever 招聘 API（jobs.lever.co/funxyz，14 个在招岗位的完整 JD）；Wayback 快照对比。
- **多源交叉验证**：融资、员工数、客户名单、指标序列——至少两个独立来源才写入正文，单源数据均标注。
- **自述数据**：转化率倍数、SLA、成功率、覆盖国家数等一律标注为公司自述。
- **单源/推断**：Forge Global 的 2026-10 一轮、IOSG 投资、48 客户 key 表之外的第三方名单推断——均已标注。
- **未验证即不写**：凡无法追溯到具体 URL 的说法一律未采信。
