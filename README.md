# fun-xyz-research

对 **fun.xyz(The Fun Group, Inc.)支付体系**的系统性研究仓库:业务流程、接入架构、API 契约与源码级支付机制。

研究对象是 **Fun 支付基础设施本身**:白标嵌入式出入金、报价与跨链路由、法币编排与国家适配。由于官方文档门户 `docs.fun.xyz` 处于登录墙后,全部结论来自公开 npm 包源码还原与线上实证。

## 📁 目录结构

```
research/
├── fun-xyz-调研报告.md              # 公司视角:背景、融资、商业模式、合规姿态、竞争格局
├── fun-出入金业务流程与接入架构.md   # 流程视角:鉴权模型、数币/法币两条流、接入方式
├── fun-功能与接口完整文档.md         # 工程手册:架构图、API 端点、字段、枚举、错误码
├── fun-支付机制源码级研究.md         # 机制视角:Checkout 模型、报价、路由执行、退款机
├── fun-国家适配与支付方式路由.md     # 路由视角:Geo→foppriority→路由表→收单 四层国家适配
└── fun-sdk-source/                  # 从 npm 包 sourcemap 还原的 SDK 源码(api-base/chains/
                                    #   connect-core/core/fiat-contract/utils,209 个 TS 文件)
```

## 📖 文档导航

| 文档 | 回答什么问题 |
|---|---|
| [调研报告](research/fun-xyz-调研报告.md) | Fun 是谁?合规姿态如何?竞争对手是谁? |
| [出入金业务流程与接入架构](research/fun-出入金业务流程与接入架构.md) | 用户走一遍充值/提现会发生什么?宿主要怎么接? |
| [功能与接口完整文档](research/fun-功能与接口完整文档.md) | 有哪些 API?请求/响应长什么样?错误码有哪些? |
| [支付机制源码级研究](research/fun-支付机制源码级研究.md) | 报价怎么算?跨链路由怎么选?"入金即合约调用"怎么实现? |
| [国家适配与支付方式路由](research/fun-国家适配与支付方式路由.md) | 不同国家的用户看到哪些支付方式?同一笔付款哪家供应商接单、报价差多少? |

## 🔑 核心发现速览

- **两条流、两种身份**:数币↔数币(UDA 入金地址)免登录、免 KYC,前端 `X-Api-Key` 直连即可;法币↔数币必须宿主签发 JWT(用户身份)+ Sumsub KYC(Fun 托管)。
- **一切支付都是 Checkout**:资金流方向 × 资金来源 × 执行方式(RELAY / OFT / ACROSS / FLASHNET…)三个正交维度统一建模;单端点 `POST /checkout/quoteV2` 按 `fromChainId` 分发路由。
- **入金即合约调用**:checkout 请求携带预签名的 ERC-4337 UserOperation,资金到账自动驱动链上动作——"highest converting rails" 的机制基础。
- **官方文档门户 `docs.fun.xyz` 完全登录墙**;本仓库的接口契约全部来自公开 npm 包(`@funkit/*`、`@fun-xyz/fiat-contract`)sourcemap 还源码与线上实证,而非官方文档。
- **法币上游 8 家供应商**(Stripe、MoonPay、Coinbase、Transak、Banxa、Swapped、Crossmint + Bridge 银行 rails / Bluvo CEX 连接),由 `frog.fun.xyz` 统一编排。
- **"按国家适配支付方式"是四层协作**:Geo(IP→国家码)→ `foppriority` 本地钱包优先矩阵(巴西 PIX、加拿大 INTERAC、印尼 GOPAY……)→ 路由表(国家×方式×金额→供应商)→ Meld 收单竞价;实测同一笔 $500 买 USDC,美国比香港多一条 Stripe 半价报价。

## ⚠️ 说明

- 接口与机制基于 2026-10/11 的 SDK 版本(`@funkit/connect-core@13.0.0` 等),后端演进后可能失效(如 `POST /checkout` 源码注明 2026-12-21 下线)。
- `research/fun-sdk-source/` 为逆向还原产物,仅供研究,版权归原作者所有。
