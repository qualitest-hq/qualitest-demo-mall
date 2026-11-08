# C 端 uni 落地清单

工程：[demo-uni/](../demo-uni/)（uni-app Vue3 + Vite + TS）。  
**范围**：按预览复刻页面并接客户端 `/api/**`；接口对不上时**改接口适配页面**，不把 UI 砍瘦。  
视觉与交互以 [c-end-ui-preview.html](./c-end-ui-preview.html) 为准；设计 token 见 [expansion-roadmap.md](./expansion-roadmap.md) §6.1。  
预览示意增强（收藏 / 秒杀等）见 [c-end-preview-roadmap.md](./c-end-preview-roadmap.md)，与本文**可并行**，不互为硬门槛。

目标不止「靶场能演示」：目录分层、主题与配置可集中改，避免业务页散落魔法值。  
不追求微前端、巨型组件库或过度抽象；**薄而稳**即可。

按**小批次**落地：一次只盯一批，合入后再翻下一批。  
「状态」取值：未开始 / 进行中 / 已完成。  
**当前批次**：`U1`（改这里即可）。

---

## 1. 怎么干（约定）

不是「整站切图再一次性接接口」，也不是「每屏纯 mock 完再回头改」。

| 原则 | 说明 |
|---|---|
| 预览锁交互 | 屏名、主路径、字段形态跟预览；uni 不另发明信息架构 |
| 按屏落地 | 该屏 UI 按预览复刻 → 有接口就接 → 缺口记本文或改 `/api` |
| 假数据仅过渡 | 仅骨架或后端未就绪的示意屏；接真后删掉，禁止长期双轨 |
| 造数不归客户端 | 场景仍走管理端 `POST /web/test/scenario/load/{id}` 或 SQL |
| 演示账号 | `13800000001` / `Test@123456` |
| 联调 | `baseUrl` 默认 `http://localhost:8801`；Bearer 客户端 token |
| 多端节奏 | **一套代码**写 H5/小程序/App；日常主调 **H5**；碰登录/支付/分享时抽验微信小程序；App 打包靠后 |

主路径（须优先跑通）：登录 → 首页/分类/搜索 → 详情 SKU → 购物车 → 结算 → 支付 → 订单。

---

## 2. 工程化基线

U0 就要落齐；后续批次只增量，不另起一套习惯。

### 2.1 技术选型

底座已有：uni-app（Vue3 + Vite + TS）。基础控件**不从零造**，业务页与商城特有组件才自研。

| 层 | 选型 | 说明 |
|---|---|---|
| UI | [wot-design-uni](https://wot-ui.cn/)（`wd-*`） | Vue3 + TS；CSS 变量改主题；覆盖 H5 / 微信小程序 / App（不追 QQ/百度全端） |
| 状态 | Pinia | `user` / `cart` 等跨页态 |
| 请求 | 自研薄封装 `uni.request` | 泛型解包、Bearer、401；不上 axios（小程序别扭） |
| 时间 | dayjs（按需） | 订单时间等 |
| 业务组件 | 自研薄层 | 仅商城特有：`ProductCard`、`SkuSheet`、`AppPrice` 等 |
| 通用控件 | 用 wot | Button、Form、Popup、Tabs、Empty、Navbar、Swiper、Stepper… |

**为何 wot（简述）**：原生 TS、主题变量好贴 §6.1；生态模板多。V2 另有「AI 友好」能力（`llms.txt`、`@wot-ui/cli`、MCP、Skills）——本质是少让模型瞎猜 props/事件/slot，属加分项，**不是**选型主因；本仓不强制接 CLI/MCP。

**不上**：整仓换 unibest 模板、UnoCSS 先行、过早 i18n / E2E、并行再引一套 uview。

U0 接入要点：`pnpm add wot-design-uni`；`pages.json` easycom `^wd-(.*)`；组件全局类型用 `src/types/wot-components.d.ts`（勿直接挂 `wot-design-uni/global`，会把库源码拉进 `vue-tsc`）；色板与 `$uni-*` 写在 `uni.scss`（勿再拆文件 `@import`），`App.vue` 挂 CSS 变量给 wot。

### 2.2 目录约定

```text
demo-uni/src/
  api/           # 按域拆分：auth / product / cart / order / account …
  types/         # 请求/响应与页面 VM 类型（可按域文件）
  stores/        # Pinia：user、cart 等跨页状态
  components/    # 业务复用件（ProductCard、SkuSheet、AppPrice…）；通用控件用 wd-*
  pages/         # 路由页；薄：组组件 + 调 store/api
  composables/   # 可复用组合逻辑（分页、倒计时等，按需加）
  utils/         # request、storage、format、navigate
  styles/        # 按需；全局色板以 uni.scss 为准（框架注入，勿拆文件互引）
  constants/     # 存储 key、路由 path、业务枚举文案
  config/        # 品牌名、slogan 等集中配置
```

| 层 | 职责 | 禁止 |
|---|---|---|
| `pages/` | 路由、拼屏、生命周期 | 直接拼 URL、散落魔法色、复制粘贴改字段名 |
| `components/` | 商城业务展示与轻交互 | 重复造 wot 已有通用控件；非业务组件里调具体 API |
| `api/` | 只描述 path/method/入参出参 | toast、跳转、改 storage |
| `stores/` | 登录态、购物车等跨页 | 页面私有临时 UI 态硬塞全局 |
| `utils/request` | baseURL、Bearer、码表、401 | 业务字段映射 |

### 2.3 配置与主题面

优先改这些，而不是翻遍页面：

| 面 | 放哪 | 说明 |
|---|---|---|
| 品牌名 / slogan | `config/app.ts` | 导航标题、关于、分享文案共用 |
| 色板与圆角 | `uni.scss`（令牌 + `$uni-*`）→ `App.vue` CSS 变量 / wot | 对齐 §6.1；禁止页面硬编码品牌色；uni.scss 内禁止再 @import 色板文件 |
| 环境 | `.env` / `.env.development` / `.env.production` | `VITE_API_BASE_URL`；H5 开发可走 Vite proxy |
| 渠道差 | `#ifdef` + 少量 `platform` 工具 | 登录 / 支付 / 提现 / 分享按端分支；勿用全局布尔开关冒充端能力；勿复制整页 |

### 2.4 请求与类型

- 统一 `request<T>()`：超时、`Authorization`、业务码成功判断、失败 toast（可关）、401 清 token 并 `reLaunch` 登录  
- 后端包一层 `{ code, msg, data }` 时在 request 内解包，**页面只拿 `data`**  
- `api/*` 函数带入参/出参类型；列表分页参数与预览字段对齐处集中映射，避免每个页面 `res.data.rows` 各写一套  
- 路径别名 `@/` → `src/`（vite + tsconfig）

### 2.5 质量门槛（轻量）

| 项 | 要求 |
|---|---|
| TypeScript | 业务代码尽量严格；少用 `any`；`pnpm type-check` 合入前过 |
| 命名 | 文件/组件 PascalCase 或域内一致；API 方法 `getX` / `createX` |
| 注释 | 只写非显而易见的契约/渠道差；不写废话 README |
| 依赖 | 通用 UI 用 wot；状态 Pinia；请求薄封装；业务组件按需自研；不平行再引第二套 UI 库 |
| 密钥 | 不把小程序 secret、商户密钥写进仓；仅放前端可公开的 appId 类配置 |

### 2.6 明确后置（避免过度工程）

- 不引入微前端 / monorepo 拆包（本仓已是多仓工作区）  
- 不做完整 Design System 文档站  
- 不做 E2E 到 U2 跑通前；需要时再加  
- 不强制接入 `@wot-ui/cli` / MCP / Skills（需要时再加）  
- 商家端同栈后置（expansion §6.3），先留「我的 → 商家中心」入口位即可  

---

## 3. 分期切片

| 批次 | 范围 | 本批要落地的点 | 合入标准 | 状态 |
|---|---|---|---|---|
| U0 | 工程骨架 | §2 目录与基线；接入 wot；token；request + Pinia user；env/proxy；Tab 壳；清 Hello；品牌 config | `dev:h5` 起得来；`type-check` 过；请求能打 8801；未登录逛购壳不炸 | 已完成 |
| U1 | 登录 + 逛购 | App/H5 登录（密码优先）；首页双列；分类；搜索；详情 + SKU；`api/auth` `api/product` | 登录落 token；能浏览并选 SKU | 未开始 |
| U2 | 车 + 结算 + 付 | 购物车；结算 preview；下单；余额收银台；成功页；`api/cart` `api/order` | 主路径余额下单支付可演示 | 未开始 |
| U3 | 订单与售后 | 订单列表/详情；取消/确认收货；退款申请+列表；物流可占位 | 订单态对齐预览；退款能申请 | 未开始 |
| U4 | 我的资产 | 资料；改密；地址；券；余额/提现；协议静态页 | 「我的」主能力可点 | 未开始 |
| U5 | 收尾与选修 | 店铺；消息；评价（可示意）；空态/加载；渠道差补齐；商家入口；预览 C 批搬迁 | 主路径无挡路 | 未开始 |

依赖：U0 → U1 → U2 顺序硬；U3 / U4 在 U2 后可对调；U5 可穿插。  
预览 C1–C5 **不**阻塞 U0–U2。

---

## 4. 明细清单

做某批时只扫该批行。屏名对齐预览 `SCREENS`。

### 4.1 U0 · 工程骨架

| 点 | 建议 | 位置 / 改动 | 状态 |
|---|---|---|---|
| 目录骨架 | 建好 `api/ types/ stores/ components/ composables/ utils/ styles/ constants/ config/`（可先空 `index` 占位） | `src/*` | 已完成 |
| 路径别名 | `@/` → `src/` | `vite.config.ts`、`tsconfig` | 已完成 |
| 品牌 config | 名称「衡物」、默认演示说明 | `config/app.ts` | 已完成 |
| 设计 token | brand/price/bg/surface/ink/radius；映射 `$uni-color-primary`；App 挂 CSS 变量 | `uni.scss`、`App.vue` | 已完成 |
| 接入 wot | 依赖 + easycom + 全局类型；用 `wd-button` 等冒烟一处即可 | `package.json`、`pages.json`、`tsconfig` | 已完成 |
| 请求封装 | 泛型解包、Bearer、401、可关 toast | `utils/request.ts` | 已完成 |
| 登录态 | Pinia `user` + storage key 常量 | `stores/user.ts`、`constants/storage.ts` | 已完成 |
| 环境 | `VITE_API_BASE_URL`；H5 proxy `/api` → 8801 | `.env*`、`vite.config.ts` | 已完成 |
| Tab 壳 | 首页 / 购物车 / 我的三页占位；选中色用 brand | `pages.json`、`pages/home|cart|mine` | 已完成 |
| 业务组件壳 | `AppPrice` 等商城特有先空壳；Empty 等通用走 wot | `components/` | 已完成 |
| 清理脚手架 | 去掉 Hello；manifest/导航「衡物」 | `pages/`、`manifest.json` | 已完成 |

### 4.2 U1 · 登录 + 逛购

| 点 | 建议 | 接口（现有） | 状态 |
|---|---|---|---|
| App/H5 登录 | 密码优先；协议勾选；对齐 `login` | `POST /api/account/auth/login` 等 | 未开始 |
| 小程序登录 | 可本批末或 U5；对齐 `loginMp` | 手机号/短信相关 | 未开始 |
| 首页 | 分类入口 + 双列；Banner/秒杀示意 | `mallCategory/enabled`、`mallProduct/list` | 未开始 |
| 分类 | 侧栏 + 商品 | 同上 | 未开始 |
| 搜索 | keyword + 空结果 | `mallProduct/list` | 未开始 |
| 详情 + SKU | 选规格回填；加购可挂 U2 | `mallProduct/{id}/detail` | 未开始 |
| ProductCard | 列表复用；价格走 `AppPrice` | `components/` | 未开始 |

### 4.3 U2 · 车 + 结算 + 付

| 点 | 建议 | 接口（现有） | 状态 |
|---|---|---|---|
| 购物车 | 勾选、加减、失效行；cart store | `mallCart/my*` | 未开始 |
| 结算 | 地址 + 券 + 金额预览 | `accountAddress`、`accountCoupon`、`mallOrder/preview` | 未开始 |
| 下单 | 创建后进收银台 | `mallOrder/create` | 未开始 |
| 收银台 | 余额优先；不足引导充值；微信/支付宝可示意 | `mallOrder/.../pay`、充值相关 | 未开始 |
| 支付成功 | 订单号/金额；去订单或首页 | 前端结果态 | 未开始 |

### 4.4 U3 · 订单与售后

| 点 | 建议 | 接口（现有） | 状态 |
|---|---|---|---|
| 订单列表 | 全部/待付款/待发货/待收货/已完成/退款 | `mallOrder/my*` | 未开始 |
| 订单详情 | 状态机、退款入口 | 详情或 my 字段 | 未开始 |
| 取消 / 确认收货 | 与预览一致 | cancel / confirmReceive | 未开始 |
| 申请退款 / 列表 | 原因、凭证图 | `mallOrderRefund/*` | 未开始 |
| 物流 | 时间轴；后端未就绪可占位 | — | 未开始 |

### 4.5 U4 · 我的资产

| 点 | 建议 | 接口（现有） | 状态 |
|---|---|---|---|
| 资料 | 昵称、头像 | `auth/profile` | 未开始 |
| 改密 | 验证码策略跟后端 | 改密 + 短信 | 未开始 |
| 地址 | CRUD / 默认；地图选点可示意 | `accountAddress` | 未开始 |
| 优惠券 | 未用/已用/过期 | `accountCoupon` | 未开始 |
| 余额 / 提现 | 流水 + 充值/提现；渠道差用 features + 文案 | `accountBalanceRecord` | 未开始 |
| 协议 | 用户协议 / 隐私 / 共享清单 | 静态 | 未开始 |

### 4.6 U5 · 收尾与选修

| 点 | 建议 | 说明 | 状态 |
|---|---|---|---|
| 店铺页 | 店招 + 店内商品 | 预览已有 | 未开始 |
| 消息 | 列表跳转订单/券 | 可先薄接口 | 未开始 |
| 评价 | 列表 / 发表 | 后端未就绪则示意 | 未开始 |
| 空态 / 加载 | 统一 `AppEmpty` / 骨架 | 体验 | 未开始 |
| 渠道差异 | 登录、支付、分享 | `#ifdef` + 说明 | 未开始 |
| 商家中心入口 | 需要时再挂入口；端差用 `#ifdef` | expansion §6.3 | 未开始 |
| 预览 C 批搬迁 | 收藏 / 秒杀 / 分享等 | 不挡主路径 | 未开始 |

---

## 5. 合入约定

每批合入前建议核对：

1. 对照预览同名屏：主按钮、空态、关键字段不丢  
2. 真接口屏：演示账号在 H5（或微信开发者工具）点通本批路径  
3. token 过期可回登录；不写死主键 ID  
4. `pnpm type-check` 通过；无新增页面硬编码品牌色（应用 token）  
5. 进度只改本文「状态」与文首「当前批次」；不另起长 README  
6. 接口契约变更时同步 [expansion-roadmap.md](./expansion-roadmap.md) §6.2 状态列  

---

## 6. 相关文档

- 业务与接口总册：[expansion-roadmap.md](./expansion-roadmap.md)（§6 可选 C 端客户端）  
- C 端预览：[c-end-ui-preview.html](./c-end-ui-preview.html)  
- 预览增强批次：[c-end-preview-roadmap.md](./c-end-preview-roadmap.md)  
- 商家预览：[merchant-ui-preview.html](./merchant-ui-preview.html)  
- 联调端口 / 账号：[deploy.md](./deploy.md)、仓根 README  

