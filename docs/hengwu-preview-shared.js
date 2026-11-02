/**
 * C 端 / 商家端 HTML 预览共用：
 * 站内通知（非 IM）、商品种子与发布同步、订单/退款同步、商品分类、提现账户/手续费、退款状态映射。
 * 样式见 hengwu-preview-shared.css；通知种子由各页 defaultNotifs 提供。
 */
(function (global) {
  const NOTIF_KEY = { c: "hengwu-notif-c-v2", m: "hengwu-notif-m-v2" };
  const REFUND_SYNC_KEY = "hengwu-refunds-v3";

  function maskPhone(phone) {
    const p = String(phone || "");
    return p.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }

  function loadNotifs(side, fallback) {
    try {
      const raw = localStorage.getItem(NOTIF_KEY[side]);
      if (!raw) return fallback();
      const list = JSON.parse(raw);
      return Array.isArray(list) && list.length ? list : fallback();
    } catch {
      return fallback();
    }
  }

  function saveNotifs(side, list) {
    localStorage.setItem(NOTIF_KEY[side], JSON.stringify(list));
  }

  function notifUnread(list) {
    return (list || []).reduce((s, n) => s + (n.unread ? 1 : 0), 0);
  }

  function markNotifRead(side, fallback, id) {
    const list = loadNotifs(side, fallback);
    const n = list.find((x) => String(x.id) === String(id));
    if (n && n.unread) {
      n.unread = false;
      saveNotifs(side, list);
    }
    return list;
  }

  function markAllNotifsRead(side, fallback) {
    const list = loadNotifs(side, fallback).map((n) => ({ ...n, unread: false }));
    saveNotifs(side, list);
    return list;
  }

  /** 通知列表行：cat 短标签 → 头像字 */
  function notifCatGlyph(cat) {
    const m = { 物流: "物", 订单: "订", 售后: "售", 优惠: "券", 资金: "资", 经营: "营", 系统: "通" };
    return m[cat] || "通";
  }

  function loadRefundSync() {
    try {
      const list = JSON.parse(localStorage.getItem(REFUND_SYNC_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function upsertRefundSync(row) {
    const list = loadRefundSync();
    const i = list.findIndex((x) => x.id === row.id);
    if (i >= 0) list[i] = { ...list[i], ...row };
    else list.push(row);
    localStorage.setItem(REFUND_SYNC_KEY, JSON.stringify(list));
  }

  /** 订单跨端同步（C ↔ 商家）：支付后待发货起可见；发货/收货/取消/退款状态回写 */
  const ORDER_SYNC_KEY = "hengwu-orders-v3";

  /** pic-mug ↔ mug */
  function picKeyRaw(pic) {
    return String(pic || "").replace(/^pic-/, "") || "mug";
  }
  function picForSide(pic, side) {
    const raw = picKeyRaw(pic);
    return side === "c" ? `pic-${raw}` : raw;
  }

  /** 演示图库：CSS 渐变色块 + fixtures 实拍样图（免实际上传） */
  const PRODUCT_PIC_PRESETS = [
    { key: "mug", label: "马克杯", css: "mug" },
    { key: "kettle", label: "手冲壶", css: "kettle" },
    { key: "book", label: "手帐本", css: "book" },
    { key: "bag", label: "托特包", css: "bag" },
    { key: "lamp", label: "台灯", css: "lamp" },
    { key: "soap", label: "香氛皂", css: "soap" },
    { key: "cover", label: "实拍封面", css: "mug", src: "./fixtures/smoke-cover.png" },
    { key: "detail", label: "实拍细节", css: "soap", src: "./fixtures/sample-avatar.png" }
  ];
  const PRODUCT_PIC_MAP = Object.fromEntries(PRODUCT_PIC_PRESETS.map((p) => [p.key, p]));
  const PRODUCT_PIC_MAX = 6;

  function resolveProductPic(pic) {
    const key = picKeyRaw(pic);
    const preset = PRODUCT_PIC_MAP[key];
    return { key, css: preset?.css || key, src: preset?.src || "" };
  }

  /** 去重、截断；为空时用 fallback */
  function normalizePicList(list, { max = PRODUCT_PIC_MAX, fallback = [] } = {}) {
    const src = Array.isArray(list) && list.length ? list : fallback;
    return [...new Set((src || []).filter(Boolean).map(picKeyRaw))].slice(0, max);
  }

  /** 商品封面 key（列表图；新规格默认继承） */
  function productCoverPic(g) {
    return picKeyRaw(g?.pic);
  }

  /** 商品轮播图；空则回落封面 */
  function productBanners(g) {
    return normalizePicList(g?.banners, { fallback: [productCoverPic(g)] });
  }

  /** 商品详情长图；可为空 */
  function productDetailPics(g) {
    return normalizePicList(g?.detailPics);
  }

  /**
   * 缩略图 / 主图 HTML。side: "c" → pic-mug；"m" → mug
   * 有 src 时内嵌 <img>，否则仅用 CSS 色块类。
   * opts: { inner, style, attrs }
   */
  function productThumbHtml(pic, className = "thumb", side = "m", opts = {}) {
    const p = resolveProductPic(pic);
    const css = side === "c" ? `pic-${p.css}` : p.css;
    const cls = `${className || "thumb"} ${css}${p.src ? " has-img" : ""}`;
    const style = opts.style ? ` style="${opts.style}"` : "";
    const attrs = opts.attrs ? ` ${opts.attrs}` : "";
    const img = p.src ? `<img src="${p.src}" alt="" />` : "";
    return `<div class="${cls}"${style}${attrs}>${opts.inner || ""}${img}</div>`;
  }

  /** 演示「上传」：在预设图库中循环取下一张，优先跳过 exclude 中已用的 */
  function demoNextPicKey(current, exclude = []) {
    const keys = PRODUCT_PIC_PRESETS.map((p) => p.key);
    const used = new Set((exclude || []).map(picKeyRaw));
    let i = keys.indexOf(picKeyRaw(current));
    for (let n = 0; n < keys.length; n++) {
      i = (i + 1) % keys.length;
      if (!used.has(keys[i])) return keys[i];
    }
    return keys[(keys.indexOf(picKeyRaw(current)) + 1) % keys.length];
  }

  /**
   * 统一上传格 HTML。有图可点更换；无图显示 +。
   * opts: action, removeAction, removable, idx, field, badge, side, size("sm")
   */
  function uploadSlotHtml(pic, opts = {}) {
    const side = opts.side || "m";
    const size = opts.size === "sm" ? " sm" : "";
    const data = [
      opts.idx != null && opts.idx !== "" ? ` data-idx="${escapeAttr(String(opts.idx))}"` : "",
      opts.field ? ` data-field="${escapeAttr(opts.field)}"` : ""
    ].join("");
    const action = ` data-action="${escapeAttr(opts.action || "toast")}"`;
    if (!pic) {
      return `<div class="upload-slot empty${size}"${action}${data} title="点击上传">+</div>`;
    }
    const rm = opts.removable && opts.removeAction
      ? `<button type="button" class="rm" data-action="${escapeAttr(opts.removeAction)}"${data} aria-label="删除">×</button>`
      : "";
    const badge = opts.badge ? `<span class="badge-main">${escapeAttr(opts.badge)}</span>` : "";
    return `<div class="upload-slot filled${size}"${action}${data} title="点击更换">
      ${productThumbHtml(pic, "thumb", side)}${badge}${rm}
      <span class="upload-tip">更换</span>
    </div>`;
  }

  /** 多图上传行：已有图可更换/删除，未满显示 + */
  function multiUploadHtml(list, field, opts = {}) {
    const max = opts.max != null ? opts.max : PRODUCT_PIC_MAX;
    const base = { field, size: opts.size || "sm", side: opts.side || "m" };
    const pics = normalizePicList(list, { max });
    return `<div class="upload-row">
      ${pics.map((p, i) => uploadSlotHtml(p, {
        ...base,
        idx: i,
        action: opts.replaceAction || "edit-replace-pic",
        removeAction: opts.removeAction || "edit-remove-pic",
        removable: true
      })).join("")}
      ${pics.length >= max ? "" : uploadSlotHtml("", { ...base, action: opts.addAction || "edit-add-pic" })}
    </div>
    <div class="muted" style="margin-top:6px">最多 ${max} 张 · 点击 + 上传，点图更换</div>`;
  }

  /**
   * 商品种子（两端唯一来源）。shelf: on 在售 / pending 审核中 / off 已下架。
   * 改种子后需同步调高 GOODS_SEED_VER，两端会重置商品数据。
   */
  const GOODS_SEED_VER = 5;
  const GOODS_SYNC_KEY = "hengwu-goods-v1";
  /** 商品运费方式：template 运费模板 / none 无运费 / fixed 固定运费（元/件） */
  const FREIGHT_MODE_OPTIONS = [
    { value: "template", label: "运费模板" },
    { value: "none", label: "无运费" },
    { value: "fixed", label: "固定运费" }
  ];
  const GOODS_SEED = [
    { id: 1, title: "雾面陶瓷马克杯 350ml 哑光釉", cat: "咖啡", price: 68, old: 88, stock: 400, shelf: "on", pic: "mug",
      banners: ["mug", "cover", "detail"], detailPics: ["detail", "mug", "cover"], sales: 1283, virtualSales: 10717,
      sub: "哑光釉面 可微波 耐热易清洗", tags: ["满99减10", "包邮"], colors: ["雾白", "墨灰"], sizes: ["350ml", "500ml"],
      params: [{ k: "材质", v: "陶瓷" }, { k: "工艺", v: "哑光釉" }, { k: "是否可微波", v: "是" }, { k: "产地", v: "广东深圳" }],
      skus: [
        { attrs: { "颜色": "雾白", "尺码/容量": "350ml" }, price: 68, old: 88, stock: 200, weight: 0.4, pic: "mug" },
        { attrs: { "颜色": "雾白", "尺码/容量": "500ml" }, price: 78, old: 98, stock: 80, weight: 0.55, pic: "mug" },
        { attrs: { "颜色": "墨灰", "尺码/容量": "350ml" }, price: 68, old: 88, stock: 120, weight: 0.4, pic: "detail" },
        { attrs: { "颜色": "墨灰", "尺码/容量": "500ml" }, price: 78, old: 98, stock: 0, weight: 0.55, pic: "detail" }
      ] },
    { id: 2, title: "304 不锈钢细口手冲壶 600ml", cat: "咖啡", price: 169, old: 199, stock: 0, shelf: "on", pic: "kettle",
      banners: ["kettle", "cover"], detailPics: ["cover", "kettle"], sales: 452, virtualSales: 4130,
      sub: "细嘴控流 食品级不锈钢", tags: ["包邮", "热销"], colors: ["原色", "磨砂黑"], sizes: ["600ml"],
      params: [{ k: "材质", v: "304 不锈钢" }, { k: "容量", v: "600ml" }, { k: "适用", v: "手冲咖啡" }],
      skus: [
        { attrs: { "颜色": "原色", "尺码/容量": "600ml" }, price: 169, old: 199, stock: 0, weight: 0.9, pic: "kettle" },
        { attrs: { "颜色": "磨砂黑", "尺码/容量": "600ml" }, price: 179, old: 209, stock: 0, weight: 0.9, pic: "cover" }
      ] },
    { id: 3, title: "棉纸方格手帐本 A5 160页", cat: "文具", price: 42, old: 52, stock: 520, shelf: "on", pic: "book",
      banners: ["book", "detail"], detailPics: ["detail", "book"], sales: 906, virtualSales: 2385,
      sub: "轻薄棉纸 方格内页", tags: ["新品"],
      specs: [{ name: "封面", values: ["米白", "浅灰"] }, { name: "尺寸", values: ["A5", "A6"] }],
      params: [{ k: "纸张", v: "棉纸" }, { k: "页数", v: "160 页" }, { k: "尺寸", v: "A5" }],
      skus: [
        { attrs: { "封面": "米白", "尺寸": "A5" }, price: 42, old: 52, stock: 200, pic: "book" },
        { attrs: { "封面": "米白", "尺寸": "A6" }, price: 36, old: 46, stock: 120, pic: "book" },
        { attrs: { "封面": "浅灰", "尺寸": "A5" }, price: 42, old: 52, stock: 150, pic: "detail" },
        { attrs: { "封面": "浅灰", "尺寸": "A6" }, price: 36, old: 46, stock: 50, pic: "detail" }
      ] },
    { id: 4, title: "水洗棉托特包 中号 可机洗", cat: "收纳", price: 128, old: 158, stock: 0, shelf: "off", pic: "bag", sales: 906, virtualSales: 0,
      sub: "水洗棉 可机洗 日常通勤", tags: ["满99减10"], colors: ["米色", "卡其"], sizes: ["中号"],
      params: [{ k: "面料", v: "水洗棉" }, { k: "洗涤", v: "可机洗" }, { k: "尺码", v: "中号" }] },
    { id: 5, title: "胡桃木氛围台灯 三档调光", cat: "灯光", price: 199, old: 259, stock: 86, shelf: "on", pic: "lamp", sales: 211, virtualSales: 462,
      freightTplId: 2, weight: 1.8,
      sub: "三档触控 暖光护眼", tags: ["满199减20"], colors: ["原木色"], sizes: ["标准"],
      params: [{ k: "灯体", v: "胡桃木" }, { k: "调光", v: "三档触控" }, { k: "光源", v: "暖光 LED" }] },
    { id: 6, title: "雪松香氛洗手皂 3 块装", cat: "香氛", price: 39, old: 49, stock: 1200, shelf: "on", pic: "soap",
      banners: ["soap", "detail"], detailPics: ["detail", "soap", "cover"], sales: 3402, virtualSales: 20598,
      freightMode: "none",
      sub: "植物油脂 清爽不紧绷", tags: ["买赠", "包邮"],
      specs: [{ name: "香型", values: ["雪松", "白茶"] }, { name: "包装", values: ["单块", "3块装"] }],
      params: [{ k: "香型", v: "雪松" }, { k: "成分", v: "植物油脂" }, { k: "包装", v: "3 块装" }],
      skus: [
        { attrs: { "香型": "雪松", "包装": "单块" }, price: 16, old: 22, stock: 400, pic: "soap" },
        { attrs: { "香型": "雪松", "包装": "3块装" }, price: 39, old: 49, stock: 300, pic: "soap" },
        { attrs: { "香型": "白茶", "包装": "单块" }, price: 16, old: 22, stock: 280, pic: "detail" },
        { attrs: { "香型": "白茶", "包装": "3块装" }, price: 39, old: 49, stock: 220, pic: "detail" }
      ] },
    { id: 7, title: "日式粗陶茶杯 150ml", cat: "茶具", price: 48, old: 58, stock: 260, shelf: "on", pic: "mug", sales: 1208, virtualSales: 0,
      freightMode: "fixed", freightFixed: 6,
      sub: "手工粗陶 复古杯型", tags: ["包邮"], colors: ["原色", "釉青"], sizes: ["150ml"],
      params: [{ k: "材质", v: "粗陶" }, { k: "容量", v: "150ml" }, { k: "工艺", v: "手工" }] },
    { id: 8, title: "亚麻收纳篮 大号 可折叠", cat: "家居", price: 59, old: 79, stock: 140, shelf: "pending", pic: "bag", sales: 884, virtualSales: 0,
      sub: "可折叠 桌面收纳", tags: ["满99减10"], colors: ["原麻", "浅咖"], sizes: ["大号"],
      params: [{ k: "材质", v: "亚麻" }, { k: "规格", v: "大号" }, { k: "特性", v: "可折叠" }] }
  ];

  function seedGoods() {
    return JSON.parse(JSON.stringify(GOODS_SEED)).map((g) => ({ ...g, on: g.shelf === "on" }));
  }

  function normalizeFreightMode(g) {
    const m = g?.freightMode;
    return m === "none" || m === "fixed" ? m : "template";
  }

  function freightModeLabel(mode) {
    return (FREIGHT_MODE_OPTIONS.find((x) => x.value === mode) || FREIGHT_MODE_OPTIONS[0]).label;
  }

  /** 按运费方式清洗字段：无关的 freightTplId / freightFixed 置空 */
  function applyGoodsFreightFields(g) {
    const mode = normalizeFreightMode(g);
    const freightFixed = mode === "fixed" ? Math.max(0, Number(g?.freightFixed) || 0) : null;
    const freightTplId = mode === "template" ? (g?.freightTplId ?? null) : null;
    return { freightMode: mode, freightTplId, freightFixed };
  }

  /** 列表/摘要短文案：无运费 / 固定运费 ¥n/件 / 模板名（默认） */
  function goodsFreightLabel(g, tpls) {
    const mode = normalizeFreightMode(g);
    if (mode === "none") return "无运费";
    if (mode === "fixed") {
      const fee = Math.max(0, Number(g?.freightFixed) || 0);
      return fee > 0 ? `固定运费 ¥${fee}/件` : "固定运费";
    }
    const list = tpls || loadFreightTpls();
    const tpl = freightTplOf(list, g?.freightTplId);
    if (!tpl) return "运费模板";
    const bound = g?.freightTplId != null && list.some((t) => String(t.id) === String(g.freightTplId));
    return bound ? tpl.name : `${tpl.name}（默认）`;
  }

  /** 保存前校验；通过返回 ""，失败返回提示文案 */
  function validateGoodsFreight(g) {
    const { freightMode, freightFixed, freightTplId } = applyGoodsFreightFields(g);
    if (freightMode === "fixed" && !(freightFixed > 0)) return "请填写固定运费金额";
    if (freightMode === "template") {
      const tpl = freightTplOf(loadFreightTpls(), freightTplId);
      if (tpl?.mode === "weight" && mergeProductSkus(g, g?.skus).some((s) => !(Number(s.weight) > 0))) {
        return `「${tpl.name}」按重量计费，请给每个规格填写重量`;
      }
    }
    return "";
  }

  /** C 端可见字段快照（不含 shelf，发布即在售） */
  function goodsPublishSnapshot(g) {
    const pick = ["id", "title", "sub", "cat", "price", "old", "stock", "skus", "pic", "banners", "detailPics",
      "sales", "virtualSales", "tags", "specs", "colors", "sizes", "params", "weight"];
    const out = {};
    pick.forEach((k) => { if (g?.[k] !== undefined) out[k] = JSON.parse(JSON.stringify(g[k])); });
    Object.assign(out, applyGoodsFreightFields(g));
    return out;
  }

  /** 已发布商品列表；未初始化或版本不符返回 null */
  function loadGoodsSync() {
    try {
      const raw = localStorage.getItem(GOODS_SYNC_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d?.ver !== GOODS_SEED_VER || !Array.isArray(d.list)) return null;
      return d.list;
    } catch {
      return null;
    }
  }

  function saveGoodsSync(list) {
    localStorage.setItem(GOODS_SYNC_KEY, JSON.stringify({ ver: GOODS_SEED_VER, updatedAt: Date.now(), list }));
  }

  function findGoodsSync(id) {
    return (loadGoodsSync() || []).find((x) => String(x.id) === String(id)) || null;
  }

  /** 审核通过 / 上架：整份资料推到 C 端 */
  function publishGoodsSync(g) {
    if (g?.id == null) return;
    const list = loadGoodsSync() || [];
    const snap = goodsPublishSnapshot(g);
    const i = list.findIndex((x) => String(x.id) === String(g.id));
    if (i >= 0) list[i] = snap;
    else list.push(snap);
    saveGoodsSync(list);
  }

  function unpublishGoodsSync(id) {
    const list = loadGoodsSync();
    if (!list) return;
    saveGoodsSync(list.filter((x) => String(x.id) !== String(id)));
  }

  /**
   * 经营页免审：只改线上版本的价 / 库存 / 虚拟销量。
   * 按规格组合对齐写入；审核中改了规格结构时，线上旧版只更新仍存在的组合。
   */
  function patchGoodsSyncOps(id, patch) {
    const list = loadGoodsSync();
    if (!list) return false;
    const row = list.find((x) => String(x.id) === String(id));
    if (!row) return false;
    const byKey = {};
    (patch?.skus || []).forEach((s) => { byKey[skuAttrsKey(s.attrs || {})] = s; });
    row.skus = normalizeProductSkus(row).map((s) => {
      const hit = byKey[skuAttrsKey(s.attrs)];
      return hit ? {
        ...s,
        price: Number(hit.price) || s.price,
        old: Number(hit.old) || s.old,
        stock: Math.max(0, Number(hit.stock) || 0)
      } : s;
    });
    const agg = skuAggregate(row.skus, row.price);
    row.price = agg.price;
    row.old = agg.old;
    row.stock = agg.stock;
    if (patch?.virtualSales !== undefined) row.virtualSales = Math.max(0, Math.floor(Number(patch.virtualSales) || 0));
    saveGoodsSync(list);
    return true;
  }

  /** C 端在售目录：优先商家已发布版本，否则用种子里在售的 */
  function catalogForC() {
    return loadGoodsSync() || seedGoods().filter((g) => g.shelf === "on").map(goodsPublishSnapshot);
  }

  /** 线上商品改绑运费模板（模板删除时回落默认）；toId 为 null 表示用默认模板 */
  function reassignGoodsFreightTpl(fromId, toId) {
    const list = loadGoodsSync();
    if (!list) return;
    let hit = false;
    list.forEach((g) => {
      if (String(g.freightTplId) === String(fromId)) { g.freightTplId = toId; hit = true; }
    });
    if (hit) saveGoodsSync(list);
  }

  /** 店铺资料种子 / 发布同步（商家改资料需审核，通过后才推到 C 端） */
  const SHOP_SYNC_KEY = "hengwu-shop-v1";
  const SHOP_SEED = {
    name: "衡物官方旗舰店",
    category: "家居日用",
    notice: "工作日 16:00 前付款当日发货，顺丰/中通；破损包赔，支持 7 天无理由（定制款除外）。",
    open: true
  };

  function seedShop() {
    return JSON.parse(JSON.stringify(SHOP_SEED));
  }

  function shopPublishSnapshot(s) {
    return {
      name: String(s?.name || "").trim() || SHOP_SEED.name,
      category: String(s?.category || "").trim() || SHOP_SEED.category,
      notice: String(s?.notice || ""),
      open: s?.open !== false
    };
  }

  function loadShopSync() {
    try {
      const raw = localStorage.getItem(SHOP_SYNC_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || typeof d !== "object" || !d.shop) return null;
      return shopPublishSnapshot(d.shop);
    } catch {
      return null;
    }
  }

  function publishShopSync(s) {
    localStorage.setItem(SHOP_SYNC_KEY, JSON.stringify({
      updatedAt: Date.now(),
      shop: shopPublishSnapshot(s)
    }));
  }

  /** C 端店铺展示：优先商家已发布版本 */
  function shopForC() {
    return loadShopSync() || seedShop();
  }

  /**
   * 运费模板（商家端维护，C 端结算读取）。
   * mode: piece 按件 / weight 按重量（kg）；base 为未单独指定地区的默认运费；
   * rules / noDelivery / free.exclude 的地区码：
   *   - 「广东省」= 全省；「广东省 深圳市」= 指定市
   *   - 直辖市第二级为区（如「上海市 徐汇区」）
   * 匹配优先级：市/区精确命中 > 全省命中。
   */
  const REGION_TREE = [
    { province: "北京市", cities: ["东城区", "西城区", "朝阳区", "海淀区", "丰台区", "通州区", "昌平区", "大兴区"] },
    { province: "天津市", cities: ["和平区", "河西区", "南开区", "滨海新区", "武清区"] },
    { province: "河北省", cities: ["石家庄市", "唐山市", "保定市", "廊坊市", "秦皇岛市", "邯郸市"] },
    { province: "山西省", cities: ["太原市", "大同市", "临汾市", "运城市"] },
    { province: "内蒙古自治区", cities: ["呼和浩特市", "包头市", "鄂尔多斯市", "赤峰市"] },
    { province: "辽宁省", cities: ["沈阳市", "大连市", "鞍山市", "锦州市"] },
    { province: "吉林省", cities: ["长春市", "吉林市", "延边朝鲜族自治州"] },
    { province: "黑龙江省", cities: ["哈尔滨市", "齐齐哈尔市", "大庆市", "牡丹江市"] },
    { province: "上海市", cities: ["黄浦区", "徐汇区", "长宁区", "静安区", "浦东新区", "闵行区", "宝山区", "嘉定区"] },
    { province: "江苏省", cities: ["南京市", "苏州市", "无锡市", "常州市", "南通市", "徐州市", "扬州市"] },
    { province: "浙江省", cities: ["杭州市", "宁波市", "温州市", "嘉兴市", "绍兴市", "金华市", "台州市"] },
    { province: "安徽省", cities: ["合肥市", "芜湖市", "蚌埠市", "阜阳市"] },
    { province: "福建省", cities: ["福州市", "厦门市", "泉州市", "漳州市"] },
    { province: "江西省", cities: ["南昌市", "赣州市", "九江市", "上饶市"] },
    { province: "山东省", cities: ["济南市", "青岛市", "烟台市", "潍坊市", "临沂市", "威海市"] },
    { province: "河南省", cities: ["郑州市", "洛阳市", "开封市", "南阳市", "新乡市"] },
    { province: "湖北省", cities: ["武汉市", "宜昌市", "襄阳市", "荆州市"] },
    { province: "湖南省", cities: ["长沙市", "株洲市", "湘潭市", "衡阳市", "岳阳市"] },
    { province: "广东省", cities: ["广州市", "深圳市", "东莞市", "佛山市", "珠海市", "中山市", "惠州市", "汕头市", "湛江市"] },
    { province: "广西壮族自治区", cities: ["南宁市", "桂林市", "柳州市", "北海市"] },
    { province: "海南省", cities: ["海口市", "三亚市", "儋州市"] },
    { province: "重庆市", cities: ["渝中区", "江北区", "沙坪坝区", "南岸区", "渝北区", "九龙坡区"] },
    { province: "四川省", cities: ["成都市", "绵阳市", "德阳市", "宜宾市", "南充市"] },
    { province: "贵州省", cities: ["贵阳市", "遵义市", "毕节市"] },
    { province: "云南省", cities: ["昆明市", "大理白族自治州", "丽江市", "曲靖市"] },
    { province: "西藏自治区", cities: ["拉萨市", "日喀则市", "林芝市"] },
    { province: "陕西省", cities: ["西安市", "宝鸡市", "咸阳市", "延安市"] },
    { province: "甘肃省", cities: ["兰州市", "天水市", "酒泉市"] },
    { province: "青海省", cities: ["西宁市", "海东市"] },
    { province: "宁夏回族自治区", cities: ["银川市", "石嘴山市", "吴忠市"] },
    { province: "新疆维吾尔自治区", cities: ["乌鲁木齐市", "克拉玛依市", "喀什地区", "伊犁哈萨克自治州", "哈密市"] },
    { province: "香港特别行政区", cities: ["香港岛", "九龙", "新界"] },
    { province: "澳门特别行政区", cities: ["澳门半岛", "氹仔", "路环"] },
    { province: "台湾省", cities: ["台北市", "新北市", "台中市", "高雄市", "台南市"] }
  ];
  const PROVINCE_GROUPS = [
    { name: "华东", list: ["上海市", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省"] },
    { name: "华南", list: ["广东省", "广西壮族自治区", "海南省"] },
    { name: "华北", list: ["北京市", "天津市", "河北省", "山西省", "内蒙古自治区"] },
    { name: "华中", list: ["河南省", "湖北省", "湖南省"] },
    { name: "西南", list: ["重庆市", "四川省", "贵州省", "云南省", "西藏自治区"] },
    { name: "西北", list: ["陕西省", "甘肃省", "青海省", "宁夏回族自治区", "新疆维吾尔自治区"] },
    { name: "东北", list: ["辽宁省", "吉林省", "黑龙江省"] },
    { name: "港澳台", list: ["香港特别行政区", "澳门特别行政区", "台湾省"] }
  ];
  const PROVINCES = REGION_TREE.map((r) => r.province);
  const REGION_BY_PROV = Object.fromEntries(REGION_TREE.map((r) => [r.province, r]));

  /** 新疆维吾尔自治区 → 新疆；深圳市 → 深圳；徐汇区 → 徐汇；浦东新区 → 浦东新 */
  function regionShort(name) {
    let s = String(name || "");
    s = s.replace(/(维吾尔|壮族|回族|哈萨克|朝鲜族|白族)?(自治区|自治州|特别行政区|地区)$/, "");
    if (/新区$/.test(s)) return s.replace(/区$/, "");
    return s.replace(/(省|市|区)$/, "");
  }
  function provinceShort(p) { return regionShort(p); }

  /** 地区码「广东省 深圳市」→ { province, city, key, whole }；全省时 city 为空、whole 为 true */
  function parseAreaCode(code) {
    const raw = String(code || "").trim().replace(/\s+/g, " ");
    if (!raw) return null;
    const parts = raw.split(" ");
    let province = PROVINCES.find((p) => p === parts[0])
      || PROVINCES.find((p) => parts[0].startsWith(provinceShort(p)))
      || "";
    if (!province && parts.length === 1) {
      /* 兼容旧数据只存市名时尽量回挂到省 */
      const hit = REGION_TREE.find((r) => r.cities.includes(parts[0]));
      if (hit) return { province: hit.province, city: parts[0], key: `${hit.province} ${parts[0]}`, whole: false };
    }
    if (!province) return null;
    const cityRaw = parts.slice(1).join(" ");
    const cities = REGION_BY_PROV[province]?.cities || [];
    const city = cityRaw
      ? (cities.find((c) => c === cityRaw) || cities.find((c) => cityRaw.startsWith(regionShort(c)) || c.startsWith(cityRaw)) || cityRaw)
      : "";
    return city
      ? { province, city, key: `${province} ${city}`, whole: false }
      : { province, city: "", key: province, whole: true };
  }

  function areaCode(province, city) {
    return city ? `${province} ${city}` : province;
  }

  /** 展示短名：全省 →「广东」；指定市 →「深圳」 */
  function areaLabel(code) {
    const a = parseAreaCode(code);
    if (!a) return String(code || "");
    return a.city ? regionShort(a.city) : provinceShort(a.province);
  }

  /** 地区列表短名，超过 max 个截断为「等 N 地」 */
  function provincesText(list, max = 6) {
    const arr = (list || []).map(areaLabel);
    if (!arr.length) return "无";
    return arr.length > max ? `${arr.slice(0, max).join("、")} 等 ${arr.length} 地` : arr.join("、");
  }
  const regionsText = provincesText;

  /** 收货「广东省 深圳市 南山区」→ { province, city, key } */
  function parseShipRegion(region) {
    const parts = String(region || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { province: "", city: "", key: "" };
    const province = PROVINCES.find((p) => p === parts[0])
      || PROVINCES.find((p) => parts[0].startsWith(provinceShort(p)))
      || "";
    if (!province) return { province: "", city: "", key: "" };
    const cities = REGION_BY_PROV[province]?.cities || [];
    const city = parts[1]
      ? (cities.find((c) => c === parts[1])
        || cities.find((c) => parts[1].startsWith(regionShort(c)) || c.startsWith(parts[1]))
        || parts[1])
      : "";
    return { province, city, key: city ? `${province} ${city}` : province };
  }

  function provinceOfRegion(region) {
    return parseShipRegion(region).province;
  }

  /** 地区码是否覆盖收货地：全省覆盖省内所有市；市码仅精确匹配 */
  function areaCovers(code, ship) {
    const a = typeof code === "string" ? parseAreaCode(code) : code;
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    if (!a?.province || !s?.province || a.province !== s.province) return false;
    if (a.whole) return true;
    return !!(a.city && s.city && a.city === s.city);
  }

  /** list 中是否有码覆盖收货地；优先返回市级命中 */
  function findCoveringArea(list, ship) {
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    if (!s?.province) return null;
    const cityHit = (list || []).find((code) => {
      const a = parseAreaCode(code);
      return a && !a.whole && areaCovers(a, s);
    });
    if (cityHit) return cityHit;
    return (list || []).find((code) => {
      const a = parseAreaCode(code);
      return a?.whole && areaCovers(a, s);
    }) || null;
  }

  /** 某省在已选列表中的状态：none / partial / whole */
  function provinceSelectState(selected, province) {
    const sel = selected || [];
    if (sel.includes(province)) return "whole";
    const prefix = `${province} `;
    return sel.some((c) => c.startsWith(prefix)) ? "partial" : "none";
  }

  /** 已占用地区：全省占用则其下所有市占用；市占用则全省不可再选 */
  function areaOccupiedSet(codes) {
    const used = new Set();
    (codes || []).forEach((code) => {
      const a = parseAreaCode(code);
      if (!a) return;
      used.add(a.key);
      if (a.whole) {
        (REGION_BY_PROV[a.province]?.cities || []).forEach((c) => used.add(areaCode(a.province, c)));
      } else {
        used.add(a.province);
      }
    });
    return used;
  }

  const FREIGHT_SEED_VER = 2;
  const FREIGHT_SYNC_KEY = "hengwu-freight-v1";
  const FREIGHT_HMT = ["香港特别行政区", "澳门特别行政区", "台湾省"];
  const FREIGHT_SEED = [
    { id: 1, name: "默认模板", mode: "piece", def: true,
      base: { first: 1, firstFee: 8, extra: 1, extraFee: 2 },
      rules: [
        { areas: ["上海市", "江苏省", "浙江省", "广东省"], first: 1, firstFee: 6, extra: 1, extraFee: 1 },
        { areas: ["新疆维吾尔自治区", "西藏自治区"], first: 1, firstFee: 20, extra: 1, extraFee: 10 }
      ],
      noDelivery: FREIGHT_HMT.slice(),
      free: { on: true, type: "amount", value: 99, exclude: ["新疆维吾尔自治区", "西藏自治区"] } },
    { id: 2, name: "大件按重量", mode: "weight", def: false,
      base: { first: 1, firstFee: 10, extra: 1, extraFee: 5 },
      rules: [],
      noDelivery: FREIGHT_HMT.slice(),
      free: { on: false, type: "amount", value: 199, exclude: [] } }
  ];

  /** 兼容旧字段 provinces → areas */
  function normalizeFreightTpl(t) {
    const row = JSON.parse(JSON.stringify(t || {}));
    row.rules = (row.rules || []).map((r) => ({
      ...r,
      areas: Array.isArray(r.areas) ? r.areas : (Array.isArray(r.provinces) ? r.provinces : [])
    }));
    row.noDelivery = Array.isArray(row.noDelivery) ? row.noDelivery : [];
    row.free = row.free || { on: false, type: "amount", value: 99, exclude: [] };
    row.free.exclude = Array.isArray(row.free.exclude) ? row.free.exclude : [];
    return row;
  }

  function loadFreightTpls() {
    try {
      const d = JSON.parse(localStorage.getItem(FREIGHT_SYNC_KEY) || "null");
      if (d?.ver === FREIGHT_SEED_VER && Array.isArray(d.list) && d.list.length) {
        return d.list.map(normalizeFreightTpl);
      }
    } catch { /* 回落种子 */ }
    return JSON.parse(JSON.stringify(FREIGHT_SEED)).map(normalizeFreightTpl);
  }

  function saveFreightTpls(list) {
    localStorage.setItem(FREIGHT_SYNC_KEY, JSON.stringify({
      ver: FREIGHT_SEED_VER,
      updatedAt: Date.now(),
      list: (list || []).map(normalizeFreightTpl)
    }));
  }

  function resetFreightTpls() {
    localStorage.removeItem(FREIGHT_SYNC_KEY);
  }

  /** 按 id 取模板；未绑定或已删除回落默认模板 */
  function freightTplOf(tpls, id) {
    const list = tpls || loadFreightTpls();
    return (id != null && list.find((t) => String(t.id) === String(id)))
      || list.find((t) => t.def)
      || list[0]
      || null;
  }

  function freightUnitLabel(mode) {
    return mode === "weight" ? { first: "首重", extra: "续重", unit: "kg" } : { first: "首件", extra: "续件", unit: "件" };
  }

  /** 首件 1 件 ¥8，续件 1 件 +¥2 */
  function freightRuleText(rule, mode) {
    const u = freightUnitLabel(mode);
    const r = rule || {};
    return `${u.first} ${r.first}${u.unit} ¥${r.firstFee}，${u.extra} ${r.extra}${u.unit} +¥${r.extraFee}`;
  }

  /** 满 ¥99 包邮 / 满 3 件包邮 / 满 5kg 包邮；未开启返回空串 */
  function freightFreeText(free) {
    if (!free?.on) return "";
    if (free.type === "piece") return `满 ${free.value} 件包邮`;
    if (free.type === "weight") return `满 ${free.value}kg 包邮`;
    return `满 ¥${free.value} 包邮`;
  }

  /** 收货地区命中的计费规则；市优先于省，无指定规则时用默认运费 */
  function freightRuleFor(tpl, ship) {
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    let hit = null;
    for (const r of (tpl?.rules || [])) {
      const areas = r.areas || r.provinces || [];
      if (findCoveringArea(areas, s)) { hit = r; break; }
    }
    if (hit) {
      const areas = hit.areas || hit.provinces || [];
      return { ...hit, areas, hit: `指定地区（${regionsText(areas, 3)}）` };
    }
    return { ...(tpl?.base || {}), hit: "默认运费" };
  }

  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const round3 = (n) => Math.round((Number(n) || 0) * 1000) / 1000;

  /** 运费 = 首费 + ceil(max(0, 计费量 − 首件) / 续件) × 续费 */
  function freightByUnits(rule, units) {
    const u = round3(units);
    if (u <= 0) return 0;
    const first = Number(rule?.first) || 0;
    const extra = Number(rule?.extra) || 0;
    const over = Math.max(0, u - first);
    const steps = over > 0 && extra > 0 ? Math.ceil(Math.round((over / extra) * 1e6) / 1e6) : 0;
    return round2((Number(rule?.firstFee) || 0) + steps * (Number(rule?.extraFee) || 0));
  }

  /** 单件计费重量（kg）：规格重量 > 商品重量 > 1kg */
  function goodsWeight(g, sku) {
    const sw = Number(sku?.weight);
    if (sw > 0) return sw;
    const w = Number(g?.weight);
    return w > 0 ? w : 1;
  }

  /** 规格重量区间文案：1.8kg / 0.4–0.6kg；全未填返回空串 */
  function skuWeightText(g) {
    const ws = normalizeProductSkus(g).map((s) => Number(s.weight)).filter((w) => w > 0);
    if (!ws.length) return "";
    const min = Math.min(...ws);
    const max = Math.max(...ws);
    return min === max ? `${min}kg` : `${min}–${max}kg`;
  }

  /** 单个模板分组计费：{ fee, units, rule, free, blocked }；ship 可为地区字符串或 parseShipRegion 结果 */
  function freightForTpl(tpl, ship, { amount = 0, qty = 0, weight = 0 } = {}) {
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    const units = round3(tpl?.mode === "weight" ? weight : qty);
    const rule = freightRuleFor(tpl, s);
    if (s.province && findCoveringArea(tpl?.noDelivery || [], s)) {
      return { fee: 0, units, rule, free: false, blocked: true };
    }
    const f = tpl?.free;
    const reach = f?.on && (
      f.type === "piece" ? qty >= Number(f.value)
        : f.type === "weight" ? weight >= Number(f.value)
          : amount >= Number(f.value)
    );
    const free = !!reach && !findCoveringArea(f?.exclude || [], s);
    return { fee: free ? 0 : freightByUnits(rule, units), units, rule, free, blocked: false };
  }

  /**
   * 整单运费：按商品运费方式分组（无运费 / 固定运费 / 各运费模板），各组独立计费后求和。
   * items: [{ productId, title, price, qty }]；opts.tpls / opts.catalog 缺省读同步数据。
   * 返回 { total, province, city, regionKey, groups[], blocked[] }。
   */
  function calcFreight(items, region, opts) {
    const o = opts || {};
    const tpls = o.tpls || loadFreightTpls();
    const catalog = o.catalog || catalogForC();
    const ship = o.ship || parseShipRegion(region);
    const byKey = new Map();
    (items || []).forEach((it) => {
      const g = catalog.find((x) => String(x.id) === String(it.productId));
      const qty = Math.max(1, Number(it.qty) || 1);
      const amountAdd = (Number(it.price) || 0) * qty;
      const mode = normalizeFreightMode(g);

      if (mode === "none") {
        const key = "none";
        const row = byKey.get(key) || {
          kind: "none", tplId: null, tplName: "无运费", mode: "none",
          items: [], amount: 0, qty: 0, weight: 0, fee: 0, free: true, blocked: false
        };
        row.items.push(it);
        row.amount += amountAdd;
        row.qty += qty;
        byKey.set(key, row);
        return;
      }

      if (mode === "fixed") {
        const unit = Math.max(0, Number(g?.freightFixed) || 0);
        const key = "fixed";
        const row = byKey.get(key) || {
          kind: "fixed", tplId: null, tplName: "固定运费", mode: "fixed",
          items: [], amount: 0, qty: 0, weight: 0, fee: 0, free: false, blocked: false
        };
        row.items.push(it);
        row.amount += amountAdd;
        row.qty += qty;
        row.fee = round2(row.fee + unit * qty);
        byKey.set(key, row);
        return;
      }

      const tpl = freightTplOf(tpls, g?.freightTplId);
      if (!tpl) return;
      const key = `tpl:${tpl.id}`;
      const row = byKey.get(key) || {
        kind: "template", tpl, tplId: tpl.id, tplName: tpl.name, mode: tpl.mode,
        items: [], amount: 0, qty: 0, weight: 0
      };
      row.items.push(it);
      row.amount += amountAdd;
      row.qty += qty;
      row.weight += goodsWeight(g, g ? findSkuByLabel(g, it.sku) : null) * qty;
      byKey.set(key, row);
    });

    const groups = [...byKey.values()].map((row) => {
      if (row.kind === "template") {
        return {
          kind: "template",
          tplId: row.tplId,
          tplName: row.tplName,
          mode: row.mode,
          items: row.items,
          amount: round2(row.amount),
          qty: row.qty,
          weight: round3(row.weight),
          ...freightForTpl(row.tpl, ship, { amount: row.amount, qty: row.qty, weight: row.weight })
        };
      }
      return {
        kind: row.kind,
        tplId: row.tplId,
        tplName: row.tplName,
        mode: row.mode,
        items: row.items,
        amount: round2(row.amount),
        qty: row.qty,
        weight: round3(row.weight || 0),
        fee: row.kind === "none" ? 0 : round2(row.fee),
        free: row.kind === "none",
        blocked: false,
        units: row.qty,
        rule: null
      };
    });
    return {
      total: round2(groups.reduce((s, g) => s + (g.blocked ? 0 : g.fee), 0)),
      province: ship.province,
      city: ship.city,
      regionKey: ship.key,
      groups,
      blocked: groups.filter((g) => g.blocked).flatMap((g) => g.items.map((it) => it.title))
    };
  }

  /** 商品详情「发货」说明：快递 ¥8 起 · 满 ¥99 包邮 / 深圳不配送 */
  function freightBrief(tpl, ship) {
    if (!tpl) return "快递发货";
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    const short = s.city ? regionShort(s.city) : provinceShort(s.province);
    if (s.province && findCoveringArea(tpl.noDelivery || [], s)) return `${short}地区暂不配送`;
    const rule = freightRuleFor(tpl, s);
    const parts = [`快递 ¥${rule.firstFee} 起${tpl.mode === "weight" ? `（${rule.first}kg 内）` : ""}`];
    const freeText = freightFreeText(tpl.free);
    if (freeText) {
      parts.push(findCoveringArea(tpl.free.exclude || [], s) ? `${short}不参与包邮` : freeText);
    }
    return parts.join(" · ");
  }

  /** 按商品运费方式生成发货说明（无运费 / 固定运费 / 运费模板） */
  function freightBriefForGoods(g, ship) {
    const mode = normalizeFreightMode(g);
    if (mode === "none") return "无运费";
    if (mode === "fixed") {
      const fee = Math.max(0, Number(g?.freightFixed) || 0);
      return fee > 0 ? `固定运费 ¥${fee}/件` : "固定运费 ¥0";
    }
    return freightBrief(freightTplOf(null, g?.freightTplId), ship);
  }

  /**
   * 详情「发货」行：{ brief, blocked, msg }
   * none/fixed 用 brief；template 补充地区/重量说明，不配送时 blocked
   */
  function freightShipHint(g, ship) {
    const s = ship && typeof ship === "object" ? ship : parseShipRegion(ship);
    const brief = freightBriefForGoods(g, s);
    const mode = normalizeFreightMode(g);
    if (mode !== "template") return { brief, blocked: false, msg: brief };
    const tpl = freightTplOf(null, g?.freightTplId);
    const place = s.city ? regionShort(s.city) : provinceShort(s.province);
    const blocked = !!(tpl && s.province && findCoveringArea(tpl.noDelivery || [], s));
    if (!tpl) return { brief, blocked: false, msg: "快递发货" };
    if (blocked) return { brief, blocked: true, msg: `${place}地区暂不配送，请更换收货地址` };
    const rule = freightRuleFor(tpl, s);
    const weightHint = tpl.mode === "weight"
      ? `，每件约 ${skuWeightText(g) || `${goodsWeight(g)}kg`}`
      : "";
    return {
      brief,
      blocked: false,
      msg: `配送至${place || "默认地址"}：${freightRuleText(rule, tpl.mode)}${weightHint}`
    };
  }

  /**
   * 商品评价（两端共用）：reply 商家回复；hide 隐藏申请
   * hide.status: pending 平台审核中 / approved 已隐藏（C 端不展示）/ rejected 驳回
   */
  const REVIEW_SEED_VER = 1;
  const REVIEW_SYNC_KEY = "hengwu-reviews-v1";
  const REVIEW_HIDE_REASONS = ["辱骂 / 人身攻击", "广告 / 引流信息", "与商品无关", "泄露个人隐私", "恶意差评 / 内容不实"];
  const REVIEW_HIDE_REJECT_REASON = "评价内容属实且未违反社区规范，不予隐藏";
  const REVIEW_SEED = [
    { id: 1, productId: 1, user: "小***周", stars: 5, text: "釉面很细，350ml 刚好一杯美式，和详情图一致。", time: "10-12", pics: ["mug", "mug"],
      reply: "感谢喜欢～雾面釉需避免钢丝球擦洗，可以用得更久。" },
    { id: 2, productId: 1, user: "阿***林", stars: 5, text: "雾白不显指纹，快递包装有泡沫，没有磕碰。", time: "10-08", pics: ["mug"] },
    { id: 3, productId: 1, user: "陈***", stars: 4, text: "同事问链接，又回购了一个墨灰。", time: "09-28" },
    { id: 4, productId: 1, user: "推***号", stars: 1, text: "加微信 hw888 领返现，比这里便宜一半。", time: "09-20",
      hide: { status: "approved", reason: "广告 / 引流信息", note: "引导站外交易" } },
    { id: 5, productId: 2, user: "咖***迷", stars: 5, text: "出水很稳，手感沉但不累，推荐。", time: "10-20", pics: ["kettle", "kettle"] },
    { id: 6, productId: 2, user: "周***", stars: 5, text: "嘴细好控，比之前那把强。", time: "10-02", pics: ["kettle"] },
    { id: 7, productId: 3, user: "阿***林", stars: 4, text: "纸张舒服，封面容易折角。", time: "10-08", pics: ["book"] },
    { id: 8, productId: 3, user: "路***人", stars: 1, text: "什么破本子，卖家就是骗子，垃圾店！！", time: "10-15",
      hide: { status: "pending", reason: "辱骂 / 人身攻击", note: "买家未说明具体问题，含辱骂词" } },
    { id: 9, productId: 6, user: "陈***", stars: 5, text: "香味清爽，包装也完整。", time: "09-28", pics: ["soap", "soap"] },
    { id: 10, productId: 7, user: "周***", stars: 5, text: "手作感强，喝茶很有仪式感。", time: "10-02" }
  ];

  function loadReviews() {
    try {
      const d = JSON.parse(localStorage.getItem(REVIEW_SYNC_KEY) || "null");
      if (d?.ver === REVIEW_SEED_VER && Array.isArray(d.list)) return d.list;
    } catch { /* 回落种子 */ }
    return JSON.parse(JSON.stringify(REVIEW_SEED));
  }

  function saveReviews(list) {
    localStorage.setItem(REVIEW_SYNC_KEY, JSON.stringify({ ver: REVIEW_SEED_VER, list }));
  }

  function clearReviews() {
    localStorage.removeItem(REVIEW_SYNC_KEY);
  }

  function addReview(row) {
    const list = loadReviews();
    const id = Math.max(0, ...list.map((r) => Number(r.id) || 0)) + 1;
    const next = { id, ...row };
    list.unshift(next);
    saveReviews(list);
    return next;
  }

  function updateReview(id, patch) {
    const list = loadReviews();
    const r = list.find((x) => String(x.id) === String(id));
    if (!r) return null;
    Object.assign(r, typeof patch === "function" ? patch(r) : patch);
    saveReviews(list);
    return r;
  }

  function reviewHidden(r) {
    return r?.hide?.status === "approved";
  }

  /** C 端可见评价：平台已同意隐藏的不展示 */
  function reviewsForC(productId) {
    return loadReviews().filter((r) => String(r.productId) === String(productId) && !reviewHidden(r));
  }

  /** 支付扣库存流水：C 端支付写入，商家端按订单号回写一次 */
  const STOCK_DEDUCT_KEY = "hengwu-stock-deducts-v1";

  /** 「雾白；350ml」「雾白 / 350ml」→ ["雾白", "350ml"] */
  function skuLabelParts(label) {
    return String(label || "").split(/\s*[；;\/，,]\s*/).map((s) => s.trim()).filter(Boolean);
  }

  function findSkuByLabel(g, label) {
    const want = skuLabelParts(label).join("|");
    return normalizeProductSkus(g).find((s) => Object.values(s.attrs || {}).map(String).join("|") === want) || null;
  }

  function loadStockDeducts() {
    try {
      const d = JSON.parse(localStorage.getItem(STOCK_DEDUCT_KEY) || "null");
      return d?.ver === GOODS_SEED_VER && Array.isArray(d.list) ? d.list : [];
    } catch {
      return [];
    }
  }

  function saveStockDeducts(list) {
    localStorage.setItem(STOCK_DEDUCT_KEY, JSON.stringify({ ver: GOODS_SEED_VER, list }));
  }

  function clearStockDeducts() {
    localStorage.removeItem(STOCK_DEDUCT_KEY);
  }

  function deductSku(g, attrsKey, qty) {
    g.skus = normalizeProductSkus(g).map((s) => (
      skuAttrsKey(s.attrs) === attrsKey ? { ...s, stock: Math.max(0, (Number(s.stock) || 0) - qty) } : s
    ));
    const agg = skuAggregate(g.skus, g.price);
    g.stock = agg.stock;
    g.sales = (Number(g.sales) || 0) + qty;
  }

  /**
   * 整单库存预检：同规格多行合并后校验（下架 / 规格失效 / 售罄 / 超库存）。
   * 返回 { ok, msg?, need? }；need 供扣库存复用。
   */
  function planStockDeduction(goodsList, items) {
    const need = new Map();
    for (const it of items || []) {
      const g = (goodsList || []).find((x) => String(x.id) === String(it.productId));
      if (!g) return { ok: false, msg: `「${it.title}」已下架` };
      const sku = findSkuByLabel(g, it.sku);
      if (!sku) return { ok: false, msg: `「${it.title}」规格已失效，请重新选择` };
      const attrsKey = skuAttrsKey(sku.attrs);
      const key = `${g.id}#${attrsKey}`;
      const row = need.get(key) || {
        g, sku, attrsKey, stock: Number(sku.stock) || 0, qty: 0, it, price: Number(sku.price) || 0
      };
      row.qty += Math.max(1, Number(it.qty) || 1);
      need.set(key, row);
    }
    for (const r of need.values()) {
      if (r.stock <= 0) return { ok: false, msg: `「${r.it.title} ${r.it.sku}」已售罄` };
      if (r.qty > r.stock) return { ok: false, msg: `「${r.it.title} ${r.it.sku}」库存仅剩 ${r.stock} 件` };
    }
    return { ok: true, need };
  }

  /**
   * 支付时扣线上库存：整单都够才扣，并记流水给商家端。
   * 返回 { ok, msg }；同一订单重复调用不会重复扣。
   */
  function deductStockForOrder(orderId, items) {
    const ledger = loadStockDeducts();
    if (ledger.some((x) => String(x.orderId) === String(orderId))) return { ok: true };
    const goods = loadGoodsSync() || catalogForC();
    const plan = planStockDeduction(goods, items);
    if (!plan.ok) return plan;
    plan.need.forEach((r) => deductSku(r.g, r.attrsKey, r.qty));
    saveGoodsSync(goods);
    ledger.push({
      orderId: String(orderId),
      at: Date.now(),
      items: [...plan.need.values()].map((r) => ({ productId: r.g.id, sku: r.it.sku, qty: r.qty }))
    });
    saveStockDeducts(ledger);
    return { ok: true };
  }

  /** 商家端回写：把未处理的扣减应用到自身商品，返回本次处理的订单号 */
  function applyStockDeducts(goods, appliedIds) {
    const done = new Set((appliedIds || []).map(String));
    const fresh = [];
    loadStockDeducts().forEach((rec) => {
      if (done.has(String(rec.orderId))) return;
      (rec.items || []).forEach((it) => {
        const g = (goods || []).find((x) => String(x.id) === String(it.productId));
        const sku = g && findSkuByLabel(g, it.sku);
        if (sku) deductSku(g, skuAttrsKey(sku.attrs), Math.max(1, Number(it.qty) || 1));
      });
      fresh.push(String(rec.orderId));
    });
    return fresh;
  }

  function loadOrderSync() {
    try {
      const list = JSON.parse(localStorage.getItem(ORDER_SYNC_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function upsertOrderSync(row) {
    if (!row?.id) return;
    const list = loadOrderSync();
    const next = {
      ...row,
      id: String(row.id),
      updatedAt: row.updatedAt != null ? Number(row.updatedAt) : Date.now()
    };
    if (Array.isArray(next.items)) {
      next.items = next.items.map((it) => ({
        ...it,
        pic: picKeyRaw(it.pic)
      }));
    }
    if (next.pic) next.pic = picKeyRaw(next.pic);
    const i = list.findIndex((x) => String(x.id) === String(next.id));
    if (i >= 0) {
      const prev = list[i];
      if ((prev.updatedAt || 0) > (next.updatedAt || 0)) return;
      list[i] = { ...prev, ...next };
    } else {
      list.push(next);
    }
    localStorage.setItem(ORDER_SYNC_KEY, JSON.stringify(list));
  }

  /** 实付优先 price/amount，否则行合计 */
  function orderPayAmount(o) {
    if (o?.price != null && o.price !== "") return Number(o.price) || 0;
    if (o?.amount != null && o.amount !== "") return Number(o.amount) || 0;
    return orderGoodsAmount(o);
  }

  function buildOrderSyncPayload(o, extras) {
    const items = normalizeOrderItems(o).map((it) => ({
      productId: it.productId,
      title: it.title,
      sku: it.sku,
      price: it.price,
      qty: it.qty,
      pic: picKeyRaw(it.pic)
    }));
    const first = items[0];
    const amount = orderPayAmount(o);
    const expressNo = o.expressNo || "";
    const company = o.company || "";
    let express = o.express || "";
    if (!express && (company || expressNo)) express = [company, expressNo].filter(Boolean).join(" ");
    return {
      id: String(o.id),
      status: o.status || "待发货",
      amount,
      title: orderTitleSummary({ ...o, items }),
      buyer: o.buyer || "",
      items,
      pic: picKeyRaw(o.pic || first?.pic),
      expressNo,
      company,
      express,
      logistics: o.logistics || "",
      refundStatus: o.refundStatus || "",
      returnCompany: o.returnCompany || "",
      returnExpressNo: o.returnExpressNo || "",
      returnLogistics: o.returnLogistics || "",
      paidAt: o.paidAt || "",
      /* 下单侧字段：只在有值时带上，避免另一端合并时被空值覆盖 */
      ...(o.shippedAt ? { shippedAt: o.shippedAt } : {}),
      ...(o.address ? { address: { ...o.address } } : {}),
      ...(o.remark ? { remark: o.remark } : {}),
      ...(o.goodsAmount != null ? { goodsAmount: Number(o.goodsAmount) } : {}),
      ...(o.freightAmount != null ? { freightAmount: Number(o.freightAmount) } : {}),
      ...(o.discountAmount != null ? { discountAmount: Number(o.discountAmount) } : {}),
      ...(o.couponTitle ? { couponTitle: o.couponTitle } : {}),
      reviewed: !!o.reviewed,
      updatedAt: Date.now(),
      ...(extras || {})
    };
  }

  /** 商品前台分类（与 C 端分类页侧栏一致，不含「全部」） */
  const PRODUCT_CATEGORIES = ["咖啡", "文具", "家居", "收纳", "香氛", "茶具", "灯光"];

  /**
   * 商品规格：[{ name, values[] }]
   * 兼容旧字段 colors / sizes → 「颜色」「尺码/容量」
   */
  function normalizeProductSpecs(g) {
    if (Array.isArray(g?.specs) && g.specs.length) {
      return g.specs.map((s) => ({
        name: String(s?.name || "").trim() || "规格",
        values: (Array.isArray(s?.values) ? s.values : [])
          .map((v) => String(v ?? "").trim())
          .filter(Boolean)
      })).filter((s) => s.name);
    }
    const specs = [];
    if (Array.isArray(g?.colors) && g.colors.length) {
      specs.push({ name: "颜色", values: g.colors.map((v) => String(v).trim()).filter(Boolean) });
    }
    if (Array.isArray(g?.sizes) && g.sizes.length) {
      specs.push({ name: "尺码/容量", values: g.sizes.map((v) => String(v).trim()).filter(Boolean) });
    }
    return specs.length ? specs : [{ name: "规格", values: ["默认"] }];
  }

  function defaultSkuPicks(specs) {
    const picks = {};
    (specs || []).forEach((s) => {
      if (s.values && s.values[0]) picks[s.name] = s.values[0];
    });
    return picks;
  }

  function syncSkuPicks(picks, specs) {
    const next = { ...(picks || {}) };
    const list = specs || [];
    list.forEach((s) => {
      if (!s.values?.includes(next[s.name])) next[s.name] = s.values?.[0] || "";
    });
    Object.keys(next).forEach((k) => {
      if (!list.some((s) => s.name === k)) delete next[k];
    });
    return next;
  }

  function skuPicksText(picks, specs, sep = "，") {
    const list = specs || [];
    const parts = list.map((s) => picks?.[s.name] || s.values?.[0] || "").filter(Boolean);
    return parts.join(sep) || "默认";
  }

  function skuPicksKey(productId, picks, specs) {
    return `${productId}-${skuPicksText(picks, specs, "-")}`;
  }

  /** 规格笛卡尔积 → [{ 颜色:雾白, 尺码/容量:350ml }, ...] */
  function cartesianAttrCombos(specs) {
    const list = (specs || []).filter((s) => s?.values?.length);
    if (!list.length) return [{}];
    return list.reduce((acc, s) => {
      const next = [];
      acc.forEach((prev) => {
        s.values.forEach((v) => next.push({ ...prev, [s.name]: v }));
      });
      return next;
    }, [{}]);
  }

  function skuAttrsKey(attrs) {
    return Object.keys(attrs || {}).sort()
      .map((k) => `${k}:${attrs[k]}`)
      .join("|");
  }

  function picksToAttrs(picks, specs) {
    const synced = syncSkuPicks(picks, specs);
    const attrs = {};
    (specs || []).forEach((s) => {
      if (synced[s.name]) attrs[s.name] = synced[s.name];
    });
    return attrs;
  }

  /**
   * 规格级 SKU：价格 / 库存 / 封面图挂在组合上。
   * 有 g.skus 则按 attrs 对齐补齐；新规格封面默认用商品封面。
   */
  function normalizeProductSkus(g) {
    const specs = normalizeProductSpecs(g);
    const cover = productCoverPic(g);
    const basePrice = Number(g?.price) || 0;
    const baseOld = g?.old != null && g.old !== "" ? Number(g.old) : basePrice + 20;
    /* 规格重量（kg）；未填回落商品级 weight（旧数据） */
    const baseWeight = Number(g?.weight) > 0 ? Number(g.weight) : null;
    const baseStock = g?.stock != null && g.stock !== "" ? Math.max(0, Number(g.stock) || 0) : 100;
    const combos = cartesianAttrCombos(specs);
    const n = Math.max(1, combos.length);

    const fromSeed = {};
    if (Array.isArray(g?.skus) && g.skus.length) {
      g.skus.forEach((raw, i) => {
        let attrs = {};
        if (raw?.attrs && typeof raw.attrs === "object") {
          attrs = { ...raw.attrs };
        } else {
          specs.forEach((s) => {
            if (raw && raw[s.name] != null) attrs[s.name] = String(raw[s.name]);
          });
        }
        attrs = picksToAttrs(attrs, specs);
        const key = skuAttrsKey(attrs);
        if (!key && !Object.keys(attrs).length && combos[i]) attrs = { ...combos[i] };
        fromSeed[skuAttrsKey(attrs)] = {
          id: raw.id || `${g?.id || "p"}-sku-${i + 1}`,
          attrs,
          price: Number(raw.price) || basePrice,
          old: raw.old != null && raw.old !== "" ? Number(raw.old) : baseOld,
          stock: Math.max(0, Number(raw.stock) || 0),
          weight: Number(raw.weight) > 0 ? Number(raw.weight) : baseWeight,
          /* 已有规格保留自身封面；未设则回落商品封面 */
          pic: raw.pic != null && raw.pic !== "" ? picKeyRaw(raw.pic) : cover
        };
      });
    }

    const each = Math.floor(baseStock / n);
    let rem = baseStock - each * n;
    return combos.map((attrs, i) => {
      const key = skuAttrsKey(attrs);
      if (fromSeed[key]) return { ...fromSeed[key], attrs };
      const extra = rem > 0 ? 1 : 0;
      if (rem > 0) rem -= 1;
      return {
        id: `${g?.id || "p"}-sku-${i + 1}`,
        attrs: { ...attrs },
        price: basePrice,
        old: baseOld,
        stock: each + extra,
        weight: baseWeight,
        pic: cover
      };
    });
  }

  function findSkuByPicks(g, picks) {
    const specs = normalizeProductSpecs(g);
    const attrs = picksToAttrs(picks, specs);
    const key = skuAttrsKey(attrs);
    return normalizeProductSkus(g).find((s) => skuAttrsKey(s.attrs) === key) || null;
  }

  /** SKU 汇总为 SPU 兜底字段：最低售价 / 最低划线价 / 总库存 / 最高售价 */
  function skuAggregate(skus, fallbackPrice = 0) {
    const list = Array.isArray(skus) ? skus : [];
    if (!list.length) {
      const p = Number(fallbackPrice) || 0;
      return { price: p, maxPrice: p, old: p + 20, stock: 0 };
    }
    const prices = list.map((s) => Number(s.price) || 0);
    const price = Math.min(...prices);
    return {
      price,
      maxPrice: Math.max(...prices),
      old: Math.min(...list.map((s) => Number(s.old) || price + 20)),
      stock: list.reduce((sum, s) => sum + Math.max(0, Number(s.stock) || 0), 0)
    };
  }

  /** 同价 ¥68；区间 ¥68起 */
  function priceRangeLabel(min, max, { withSymbol = true } = {}) {
    const body = min === max ? String(min) : `${min}起`;
    return withSymbol ? `¥${body}` : body;
  }

  function productListPrice(g) {
    return skuAggregate(normalizeProductSkus(g), g?.price).price;
  }

  function productMaxPrice(g) {
    return skuAggregate(normalizeProductSkus(g), g?.price).maxPrice;
  }

  function productPriceLabel(g, opts) {
    const a = skuAggregate(normalizeProductSkus(g), g?.price);
    return priceRangeLabel(a.price, a.maxPrice, opts);
  }

  function productStockTotal(g) {
    return skuAggregate(normalizeProductSkus(g)).stock;
  }

  /** 展示销量 = 实际销量 sales + 虚拟销量 virtualSales */
  function productSoldTotal(g) {
    const real = Math.max(0, Number(g?.sales) || 0);
    const virt = Math.max(0, Number(g?.virtualSales) || 0);
    return real + virt;
  }

  /** 12000 → 1.2万+；4582 → 4582 */
  function formatSoldCount(n) {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    if (v >= 10000) return `${(Math.floor(v / 1000) / 10).toString().replace(/\.0$/, "")}万+`;
    return String(v);
  }

  function productSoldLabel(g) {
    return formatSoldCount(productSoldTotal(g));
  }

  /** 规格变更后合并旧 SKU 的价/库存/封面；新组合默认商品封面 */
  function mergeProductSkus(g, prevSkus) {
    const base = { ...g, skus: prevSkus };
    return normalizeProductSkus(base);
  }

  /** 规格封面；sku 可传 SKU 对象或选中 picks；无则商品封面 */
  function skuCoverPic(g, skuOrPicks) {
    const sku = skuOrPicks?.attrs ? skuOrPicks : (skuOrPicks ? findSkuByPicks(g, skuOrPicks) : null);
    return sku?.pic ? picKeyRaw(sku.pic) : productCoverPic(g);
  }

  /** 订单商品行：优先 items[]，兼容旧的单商品扁平字段 */
  function normalizeOrderItems(o) {
    if (Array.isArray(o?.items) && o.items.length) {
      return o.items.map((it) => ({
        productId: it.productId,
        title: it.title || "商品",
        sku: it.sku || "",
        price: Number(it.price) || 0,
        qty: Math.max(1, Number(it.qty) || 1),
        pic: it.pic || ""
      }));
    }
    if (o?.title) {
      return [{
        productId: o.productId,
        title: o.title,
        sku: o.sku || "",
        price: Number(o.price != null ? o.price : o.amount) || 0,
        qty: Math.max(1, Number(o.qty) || 1),
        pic: o.pic || ""
      }];
    }
    return [];
  }

  /** 金额明细：有字段用字段；早期订单按实付与商品合计推算运费 / 优惠 */
  function orderAmountBreakdown(o) {
    const pay = orderPayAmount(o);
    const goods = o?.goodsAmount != null ? Number(o.goodsAmount) : orderGoodsAmount(o);
    let freight = o?.freightAmount != null ? Number(o.freightAmount) : 0;
    let discount = o?.discountAmount != null ? Number(o.discountAmount) : 0;
    if (o?.goodsAmount == null) {
      const diff = Math.round((pay - goods) * 100) / 100;
      if (diff > 0) freight = diff;
      else discount = -diff;
    }
    return { goods, freight, discount, pay, couponTitle: o?.couponTitle || "" };
  }

  function orderGoodsAmount(o) {
    if (Array.isArray(o?.items) && o.items.length) {
      return o.items.reduce((s, it) => s + (Number(it.price) || 0) * Math.max(1, Number(it.qty) || 1), 0);
    }
    if (o?.amount != null) return Number(o.amount) || 0;
    if (o?.price != null) return Number(o.price) || 0;
    return 0;
  }

  function orderTitleSummary(o) {
    const items = normalizeOrderItems(o);
    if (!items.length) return o?.title || "订单商品";
    if (items.length === 1) return items[0].title;
    const n = items.reduce((s, it) => s + it.qty, 0);
    return `${items[0].title} 等${n}件`;
  }

  function orderItemCount(o) {
    return normalizeOrderItems(o).reduce((s, it) => s + it.qty, 0);
  }

  /** 商家入驻 / 店铺经营类目（比商品分类更粗） */
  const BUSINESS_CATEGORIES = ["家居日用", "咖啡茶饮", "文具文创", "收纳整理", "香氛个护", "茶具茶道"];

  const EXPRESS_COMPANIES = ["顺丰速运", "中通快递", "圆通速递", "韵达快递", "京东物流"];

  const REFUND_REASONS = ["七天无理由退货", "商品与描述不符", "质量问题 / 破损", "发错货 / 少件", "其他原因"];

  const REFUND_REJECT_REASONS = [
    "商品无质量问题，不符合退款条件",
    "已超过无理由退货时效",
    "退回商品不完整 / 影响二次销售",
    "其他原因"
  ];

  function normalizePickItems(items) {
    return (items || []).map((item) => (
      typeof item === "string" ? { value: item, label: item } : { value: item.value, label: item.label || item.value }
    ));
  }

  function escapeAttr(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * 自定义下拉（隐藏域兼容 document.getElementById(id).value）
   * @param {string} id
   * @param {Array<string|{value:string,label?:string}>} items
   * @param {string} selected
   * @param {{ compact?: boolean }} [opts]
   */
  function hwSelectHtml(id, items, selected, opts) {
    const list = normalizePickItems(items);
    const cur = list.find((x) => String(x.value) === String(selected)) || list[0] || { value: "", label: "请选择" };
    const compact = opts && opts.compact ? " is-compact" : "";
    const chev = `<svg class="hw-dd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
    return `<div class="hw-dd${compact}" data-hw-dd>
      <button type="button" class="hw-dd-trigger" data-hw-dd-toggle aria-expanded="false">
        <span class="hw-dd-label">${escapeAttr(cur.label)}</span>${chev}
      </button>
      <div class="hw-dd-menu" role="listbox">
        ${list.map((it) => {
          const on = String(it.value) === String(cur.value);
          return `<button type="button" class="hw-dd-opt${on ? " on" : ""}" role="option" data-hw-dd-pick data-value="${escapeAttr(it.value)}" data-label="${escapeAttr(it.label)}">${escapeAttr(it.label)}</button>`;
        }).join("")}
      </div>
      <input type="hidden" id="${escapeAttr(id)}" value="${escapeAttr(cur.value)}" />
    </div>`;
  }

  function closeHwSelects(root) {
    (root || document).querySelectorAll("[data-hw-dd].open").forEach((el) => {
      el.classList.remove("open", "drop-up");
      el.querySelector("[data-hw-dd-toggle]")?.setAttribute("aria-expanded", "false");
    });
  }

  /** 在机框根节点绑定一次：展开 / 选中 / 点外部关闭 */
  function bindHwSelect(root) {
    if (!root || root._hwDdBound) return;
    root._hwDdBound = true;
    root.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-hw-dd-pick]");
      if (pick && root.contains(pick)) {
        e.preventDefault();
        e.stopPropagation();
        const wrap = pick.closest("[data-hw-dd]");
        if (!wrap) return;
        const val = pick.getAttribute("data-value") || "";
        const label = pick.getAttribute("data-label") || pick.textContent || "";
        const input = wrap.querySelector('input[type="hidden"]');
        if (input) input.value = val;
        const lab = wrap.querySelector(".hw-dd-label");
        if (lab) lab.textContent = label;
        wrap.querySelectorAll(".hw-dd-opt").forEach((o) => o.classList.toggle("on", o === pick));
        wrap.classList.remove("open");
        wrap.querySelector("[data-hw-dd-toggle]")?.setAttribute("aria-expanded", "false");
        return;
      }
      const toggle = e.target.closest("[data-hw-dd-toggle]");
      if (toggle && root.contains(toggle)) {
        e.preventDefault();
        e.stopPropagation();
        const wrap = toggle.closest("[data-hw-dd]");
        if (!wrap) return;
        const willOpen = !wrap.classList.contains("open");
        closeHwSelects(root);
        if (willOpen) {
          wrap.classList.add("open");
          wrap.classList.toggle("drop-up", toggle.getBoundingClientRect().bottom > (window.innerHeight - 220));
          toggle.setAttribute("aria-expanded", "true");
        }
        return;
      }
      if (!e.target.closest("[data-hw-dd]")) closeHwSelects(root);
    });
  }

  /**
   * 短枚举点选（账户类型等）
   * @param {Array<string|{value:string,label?:string}>} items
   * @param {string} selected
   * @param {{ action?: string, attr?: string, stack?: boolean }} [opts]
   */
  function typePicksHtml(items, selected, opts) {
    const o = opts || {};
    const action = o.action || "pick";
    const attr = o.attr || "value";
    const stack = o.stack ? " stack" : "";
    return `<div class="type-picks${stack}">${normalizePickItems(items).map((it) => {
      const on = String(it.value) === String(selected);
      return `<button type="button" class="type-pick${on ? " on" : ""}" data-action="${action}" data-${attr}="${escapeAttr(it.value)}">${escapeAttr(it.label)}</button>`;
    }).join("")}</div>`;
  }

  /** 提现手续费：默认 0.6%，单笔最低 ¥1；手续费从提现金额中扣，到账 = 金额 − 手续费 */
  const WITHDRAW_FEE_RATE = 0.006;
  const WITHDRAW_FEE_MIN = 1;
  const WITHDRAW_TYPE_ORDER = ["wechat", "alipay", "bank"];

  /** role: c | merchant — 点选文案与到账标题略有差异 */
  const WITHDRAW_TYPE_META = {
    c: {
      wechat: { pick: "微信", sub: "零钱", name: "微信零钱", ledger: "提现至微信零钱" },
      alipay: { pick: "支付宝", sub: "个人账户", name: "支付宝", ledger: "提现至支付宝" },
      bank: { pick: "银行卡", sub: "储蓄卡", name: "银行卡", bankFallback: "银行卡" }
    },
    merchant: {
      wechat: { pick: "微信", sub: "商家零钱", name: "微信商家零钱", ledger: "提现至微信商家零钱" },
      alipay: { pick: "支付宝", sub: "企业账户", name: "支付宝", ledger: "提现至支付宝" },
      bank: { pick: "银行卡", sub: "对公账户", name: "对公银行卡", bankFallback: "对公银行卡" }
    }
  };

  function normalizeWithdrawType(t) {
    if (t === "corp") return "bank";
    if (t === "wechat" || t === "alipay" || t === "bank") return t;
    return "bank";
  }

  function withdrawTypeMeta(role, type) {
    const pack = WITHDRAW_TYPE_META[role] || WITHDRAW_TYPE_META.c;
    return pack[normalizeWithdrawType(type)] || pack.bank;
  }

  function withdrawTypeLabel(role, type) {
    return withdrawTypeMeta(role, type).name;
  }

  function withdrawAccountIcon(acc) {
    const t = normalizeWithdrawType(acc?.type);
    if (t === "wechat") return { bg: "#07c160", t: "微" };
    if (t === "alipay") return { bg: "#1677ff", t: "支" };
    return { bg: "#1a1a1a", t: "银" };
  }

  function withdrawAccountTitle(acc, role) {
    if (!acc) return "请添加提现账户";
    const t = normalizeWithdrawType(acc.type);
    const meta = withdrawTypeMeta(role, t);
    if (t === "wechat") return meta.name;
    if (t === "alipay") return `${meta.name} · ${acc.mask || acc.holder || ""}`;
    return `${acc.bank || meta.bankFallback || "银行卡"} · 卡号 ${acc.mask || "----"}`;
  }

  function withdrawAccountSub(acc) {
    if (!acc) return "提现前需先绑定到账账户";
    const t = normalizeWithdrawType(acc.type);
    const who = acc.holder || (t === "bank" ? "户名" : "账户名");
    if (t === "bank") return `${who} · 预计 T+1 到账`;
    return `${who} · 预计 2 小时内到账`;
  }

  function withdrawLedgerTitle(acc, role) {
    if (!acc) return "余额提现";
    const t = normalizeWithdrawType(acc.type);
    const meta = withdrawTypeMeta(role, t);
    if (meta.ledger) return meta.ledger;
    return `提现至${acc.bank || meta.bankFallback || "银行卡"}（卡号 ${acc.mask || ""}）`;
  }

  function pickWithdrawAccount(list, selectedId, allowTypes) {
    const allow = allowTypes ? new Set(allowTypes.map(normalizeWithdrawType)) : null;
    const visible = (list || []).filter((a) => !allow || allow.has(normalizeWithdrawType(a.type)));
    return visible.find((x) => x.id === Number(selectedId))
      || visible.find((x) => x.def)
      || visible[0]
      || null;
  }

  function calcWithdrawFee(amount, rate) {
    const a = Number(amount) || 0;
    if (a <= 0) return 0;
    const r = rate == null ? WITHDRAW_FEE_RATE : rate;
    return Math.max(WITHDRAW_FEE_MIN, Math.round(a * r * 100) / 100);
  }

  function withdrawArrive(amount) {
    const fee = calcWithdrawFee(amount);
    const a = Number(amount) || 0;
    const arrive = a > fee ? Math.round((a - fee) * 100) / 100 : 0;
    return { fee, arrive };
  }

  function withdrawFeeText(rate, min) {
    const r = rate == null ? WITHDRAW_FEE_RATE : rate;
    const m = min == null ? WITHDRAW_FEE_MIN : min;
    return `手续费（${(r * 100).toFixed(1)}%，最低 ¥${m}）`;
  }

  function withdrawFeeBoxHtml(fee, arrive) {
    return `<div id="withdraw-fee-box" style="background:#f7faf8;border-radius:10px;padding:12px;font-size:13px;line-height:1.7">
      <div style="display:flex;justify-content:space-between"><span class="muted">${withdrawFeeText()}</span><span id="withdraw-fee">¥${Number(fee).toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:650;margin-top:4px"><span>预计到账</span><span id="withdraw-arrive" style="color:var(--brand,#2f6f5e)">¥${Number(arrive).toFixed(2)}</span></div>
    </div>`;
  }

  /**
   * 账户类型点选（替代原生 select）
   * @param {{ role: string, current: string, allow?: string[], action?: string, lockedHint?: string }} opts
   */
  function withdrawTypePickHtml(opts) {
    const role = opts.role || "c";
    const allow = (opts.allow || WITHDRAW_TYPE_ORDER).map(normalizeWithdrawType);
    const current = allow.includes(normalizeWithdrawType(opts.current))
      ? normalizeWithdrawType(opts.current)
      : allow[0];
    const action = opts.action || "pick-wa-type";
    if (allow.length === 1) {
      const meta = withdrawTypeMeta(role, allow[0]);
      const hint = opts.lockedHint ? ` · ${opts.lockedHint}` : "";
      return `<div class="type-picks">
        <button type="button" class="type-pick on" disabled>${meta.pick}<span class="sub">${meta.sub}${hint}</span></button>
      </div><input type="hidden" id="wa-type" value="${allow[0]}" />`;
    }
    return `<div class="type-picks">
      ${allow.map((t) => {
        const meta = withdrawTypeMeta(role, t);
        return `<button type="button" class="type-pick ${current === t ? "on" : ""}" data-action="${action}" data-type="${t}">
          ${meta.pick}<span class="sub">${meta.sub}</span>
        </button>`;
      }).join("")}
    </div><input type="hidden" id="wa-type" value="${current}" />`;
  }

  /** 从编辑表单读取草稿；fallback 用于切类型重渲时保留未写入 DOM 的值 */
  function readWithdrawFormDraft(fallback, opts) {
    const o = opts || {};
    const allow = o.allow ? o.allow.map(normalizeWithdrawType) : null;
    let type = o.typeOverride
      || (typeof document !== "undefined" ? document.getElementById("wa-type")?.value : null)
      || fallback?.type
      || (allow && allow[0])
      || "bank";
    type = normalizeWithdrawType(type);
    if (allow && !allow.includes(type)) type = allow[0];
    const el = (id) => (typeof document !== "undefined" ? document.getElementById(id)?.value : null);
    return {
      type,
      holder: el("wa-holder") ?? fallback?.holder ?? "",
      bank: el("wa-bank") ?? fallback?.bank ?? "",
      mask: el("wa-mask") ?? fallback?.mask ?? ""
    };
  }

  /**
   * 退货退款主状态（同步字段）：
   * 待处理 → 待寄回（商家同意退货）→ 待收货（买家已寄回）→ 已同意（商家确认收货后退款）
   * 或 待处理 → 已拒绝
   * side: c → 买家展示文案；m → 商家侧规范状态
   */
  function normalizeRefundStatus(s) {
    const raw = String(s || "");
    if (raw === "退款成功" || raw === "已退款") return "已同意";
    if (raw === "退款关闭") return "已拒绝";
    if (raw === "退货中") return "待收货";
    if (raw === "退款中") return "待处理";
    if (["待处理", "待寄回", "待收货", "已同意", "已拒绝"].includes(raw)) return raw;
    return "待处理";
  }

  function mapRefundStatus(side, s) {
    const norm = normalizeRefundStatus(s);
    if (side === "c") {
      if (norm === "已同意") return "退款成功";
      if (norm === "已拒绝") return "已拒绝";
      if (norm === "待寄回") return "待寄回";
      if (norm === "待收货") return "退货中";
      return "退款中";
    }
    return norm;
  }

  function refundStatusHint(side, s) {
    const norm = normalizeRefundStatus(s);
    if (side === "c") {
      if (norm === "待处理") return "等待商家审核退货申请";
      if (norm === "待寄回") return "商家已同意，请填写退货物流";
      if (norm === "待收货") return "退货运输中，商家确认收货后将退款";
      if (norm === "已同意") return "商家已收货，退款已原路返回";
      if (norm === "已拒绝") return "商家已拒绝本次申请";
      return "";
    }
    if (norm === "待处理") return "请尽快审核；同意后需等买家寄回";
    if (norm === "待寄回") return "已同意退货，等待买家寄回";
    if (norm === "待收货") return "买家已寄出，确认收到退货后再退款";
    if (norm === "已同意") return "已确认收货并完成退款";
    if (norm === "已拒绝") return "已拒绝该退款申请";
    return "";
  }

  const CHANNEL_KEY = "hengwu-preview-channel";

  function getPreviewChannel() {
    try {
      const q = new URLSearchParams(location.search).get("channel");
      if (q === "mp" || q === "app") return q;
      const stored = localStorage.getItem(CHANNEL_KEY);
      if (stored === "mp" || stored === "app") return stored;
    } catch { /* ignore */ }
    return "app";
  }

  function setPreviewChannel(ch) {
    const channel = ch === "mp" ? "mp" : "app";
    try { localStorage.setItem(CHANNEL_KEY, channel); } catch { /* ignore */ }
    try {
      const url = new URL(location.href);
      url.searchParams.set("channel", channel);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch { /* ignore */ }
    return channel;
  }

  function previewSideHref(side, channel) {
    const file = side === "m" ? "merchant-ui-preview.html" : "c-end-ui-preview.html";
    const ch = channel === "mp" ? "mp" : "app";
    return `./${file}?channel=${ch}`;
  }

  function previewSwitcherHtml({ side, channel }) {
    const ch = channel === "mp" ? "mp" : "app";
    const sideC = side === "c";
    return `
      <div class="preview-switchers">
        <div class="switch-block">
          <div class="switch-lab">角色</div>
          <div class="seg-switch" role="tablist" aria-label="角色">
            <a class="${sideC ? "on" : ""}" href="${previewSideHref("c", ch)}">用户端</a>
            <a class="${sideC ? "" : "on"}" href="${previewSideHref("m", ch)}">商家端</a>
          </div>
        </div>
        <div class="switch-block">
          <div class="switch-lab">客户端</div>
          <div class="seg-switch" role="tablist" aria-label="客户端">
            <button type="button" class="${ch === "app" ? "on" : ""}" data-preview-channel="app">App</button>
            <button type="button" class="${ch === "mp" ? "on" : ""}" data-preview-channel="mp">小程序</button>
          </div>
        </div>
      </div>`;
  }

  function bindPreviewChannelSwitch(onChange) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-preview-channel]");
      if (!btn) return;
      e.preventDefault();
      const next = setPreviewChannel(btn.getAttribute("data-preview-channel"));
      onChange?.(next);
    });
  }

  /** 渲染侧栏角色/客户端切换；可选同步重置链接的 channel */
  function mountPreviewSwitchers({ side, channel, rootId = "preview-switchers", resetId } = {}) {
    const el = document.getElementById(rootId);
    if (el) el.innerHTML = previewSwitcherHtml({ side, channel });
    if (resetId) {
      const reset = document.getElementById(resetId);
      if (reset) {
        const ch = channel === "mp" ? "mp" : "app";
        reset.href = `?reset=1&channel=${ch}`;
      }
    }
  }

  /** 侧栏屏列表按钮 */
  /**
   * 滚动区底部留白：按机框内贴底的绝对定位栏（底部导航、购买栏、结算栏等）实际高度补足，
   * 保证滚到底时最后一块内容不被遮住。每次渲染后调用。
   */
  function fitScrollToBottomBars(phone) {
    if (!phone) return;
    const pr = phone.getBoundingClientRect();
    const scrolls = [...phone.querySelectorAll(".scroll")];
    if (!scrolls.length) return;
    let barTop = Infinity;
    [...phone.children].forEach((el) => {
      if (el.matches(".toast, .sheet-mask, .notch, .scroll, [data-toast]")) return;
      const cs = getComputedStyle(el);
      if (cs.position !== "absolute" && cs.position !== "fixed") return;
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return;
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.height > pr.height / 2) return;
      if (pr.bottom - r.bottom > 90) return;
      barTop = Math.min(barTop, r.top);
    });
    scrolls.forEach((s) => {
      const sr = s.getBoundingClientRect();
      const base = parseFloat(getComputedStyle(s).paddingBottom) || 0;
      const need = barTop === Infinity ? 0 : Math.ceil(sr.bottom - barTop) + 16;
      if (need > base) s.style.paddingBottom = `${need}px`;
    });
  }

  /** 同屏重绘前记下滚动；切屏则清零（避免改下拉等操作被拽回顶部） */
  let _phoneScrollKeep = { key: null, top: 0 };
  function capturePhoneScroll(phone, screenKey) {
    const same = _phoneScrollKeep.key === screenKey;
    _phoneScrollKeep = {
      key: screenKey,
      top: same && phone ? (phone.querySelector(".scroll")?.scrollTop || 0) : 0
    };
  }
  function restorePhoneScroll(phone) {
    if (phone && _phoneScrollKeep.top) {
      const sc = phone.querySelector(".scroll");
      if (sc) sc.scrollTop = _phoneScrollKeep.top;
    }
    fitScrollToBottomBars(phone);
  }

  /** 演示声明：协议正文顶部与登录 / 入驻入口展示 */
  const DEMO_NOTICE = "本项目仅用于功能演示，并非真实商城。页面中的商品、订单、支付、余额、提现、物流等均为模拟数据，不会产生真实交易或扣款；请勿填写真实的个人信息、银行卡号或密码。";
  const DEMO_NOTICE_SHORT = "本项目仅用于演示，所有数据均为模拟，不会产生真实交易或扣款，请勿填写真实个人信息。";

  function demoNoticeHtml({ compact = false } = {}) {
    return `<div class="demo-notice${compact ? " compact" : ""}"><b>演示声明</b>${compact ? DEMO_NOTICE_SHORT : DEMO_NOTICE}</div>`;
  }

  /** 地图选点示意：静态底图上的候选地点（x / y 为底图百分比坐标） */
  const MAP_MOCK_POIS = [
    { id: "p1", name: "深圳湾科技生态园", region: "广东省 深圳市 南山区", detail: "粤海街道科技园南路 16 号深圳湾科技生态园", x: 50, y: 46 },
    { id: "p2", name: "深圳湾创新科技中心", region: "广东省 深圳市 南山区", detail: "粤海街道科苑南路 3176 号深圳湾创新科技中心", x: 30, y: 30 },
    { id: "p3", name: "海岸城购物中心", region: "广东省 深圳市 南山区", detail: "粤海街道文心五路 33 号海岸城购物中心", x: 72, y: 26 },
    { id: "p4", name: "后海地铁站", region: "广东省 深圳市 南山区", detail: "粤海街道后海大道与创业路交汇处后海地铁站", x: 70, y: 66 },
    { id: "p5", name: "南山软件产业基地", region: "广东省 深圳市 南山区", detail: "粤海街道学府路 1 号南山软件产业基地", x: 24, y: 70 }
  ];

  function mapMockPoiById(id) {
    return MAP_MOCK_POIS.find((p) => p.id === id) || null;
  }

  /** 按地区 / 详细地址匹配已有选点，匹配不到返回 null */
  function mapMockPoiByAddr(region, detail) {
    const d = String(detail || "");
    return MAP_MOCK_POIS.find((p) => p.region === region && d && (d.includes(p.name) || p.detail.includes(d))) || null;
  }

  /** 示意底图：道路 / 水域 / 绿地 + 候选点 + 中心定位针 */
  function mapMockHtml(activeId) {
    const active = mapMockPoiById(activeId);
    return `<div class="map-mock">
      <i class="mm-water"></i>
      <i class="mm-park" style="left:8%;top:12%;width:22%;height:14%"></i>
      <i class="mm-park" style="left:58%;top:78%;width:26%;height:12%"></i>
      <i class="mm-road h" style="top:38%"></i>
      <i class="mm-road h thin" style="top:58%"></i>
      <i class="mm-road v" style="left:40%"></i>
      <i class="mm-road v thin" style="left:62%"></i>
      <i class="mm-road v thin" style="left:18%"></i>
      ${MAP_MOCK_POIS.map((p) => `
        <button type="button" class="mm-poi${p.id === activeId ? " on" : ""}" style="left:${p.x}%;top:${p.y}%"
          data-action="pick-map-poi" data-id="${p.id}"><i></i><span>${escapeAttr(p.name)}</span></button>`).join("")}
      ${active ? `<div class="mm-pin" style="left:${active.x}%;top:${active.y}%"></div>` : ""}
      <div class="mm-tip">示意地图 · 点击地点选择</div>
    </div>`;
  }

  /** 左侧「当前页面」说明卡；note 为字符串或 { desc, points[] } */
  function screenNoteHtml(label, note) {
    if (!note) return "";
    const n = typeof note === "string" ? { desc: note } : note;
    const points = Array.isArray(n.points) ? n.points : [];
    return `<div class="screen-note">
      <div class="hd">当前页面 · ${label || ""}</div>
      ${n.desc ? `<p>${n.desc}</p>` : ""}
      ${points.length ? `<ul>${points.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
    </div>`;
  }

  function asideTabsHtml(labels, active) {
    return Object.entries(labels || {}).map(([k, label]) =>
      `<button type="button" data-screen="${k}" class="${k === active ? "active" : ""}">${label}</button>`
    ).join("");
  }

  /** App 全类型；小程序仅微信 */
  function allowedWithdrawTypes(channel) {
    return channel === "mp" ? ["wechat"] : WITHDRAW_TYPE_ORDER.slice();
  }

  function withdrawChannelTip(role, channel) {
    const merchant = role === "merchant" || role === "m";
    if (channel === "mp") {
      return merchant
        ? "当前为微信小程序商家端：仅支持提现到微信商家零钱。支付宝、对公卡请使用 App。"
        : "当前为微信小程序：仅支持提现到微信零钱。支付宝、银行卡请使用 App。";
    }
    return merchant
      ? "App 支持提现到微信商家零钱、支付宝企业账户、对公银行卡。"
      : "App 支持提现到微信零钱、支付宝、银行卡。";
  }

  /** 微信小程序右上角固定胶囊菜单 */
  function mpCapsuleHtml() {
    return `<div class="mp-capsule" aria-hidden="true">
      <span class="mp-more">···</span>
      <span class="mp-sep"></span>
      <span class="mp-home"><i></i></span>
    </div>`;
  }

  /**
   * 状态栏：App 显示信号/电量；小程序左侧时间、右侧留白给胶囊。
   * @param {{ channel?: string, light?: boolean, mid?: string, color?: string }} opts
   */
  function statusBarHtml(opts) {
    const o = opts || {};
    const mp = o.channel === "mp";
    const styles = [];
    if (o.light) styles.push("background:#fff");
    if (o.color) styles.push(`color:${o.color}`);
    const styleAttr = styles.length ? ` style="${styles.join(";")}"` : "";
    if (mp) {
      return `<div class="status status-mp"${styleAttr}><span>9:41</span><span class="status-mp-pad"></span></div>`;
    }
    const mid = o.mid || "●●● 5G";
    return `<div class="status status-app"${styleAttr}><span>9:41</span><span>${mid}</span><span>100%</span></div>`;
  }

  function backIconHtml(attrs) {
    /* viewBox 内箭头几何居中，圆形按钮里再靠 CSS 微调 */
    return `<span class="back-ico" ${attrs || ""} aria-label="返回">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
    </span>`;
  }

  /**
   * 顶栏：返回图标在左，标题紧贴其右；右侧可选操作。
   * @param {{ title?: string, back?: boolean, backAction?: string, backNav?: string, right?: string }} opts
   */
  function subnavHtml(opts) {
    const o = opts || {};
    const title = o.title == null ? "" : o.title;
    const right = o.right || "";
    let back = "";
    if (o.back !== false) {
      const attr = o.backNav
        ? `data-nav="${o.backNav}"`
        : `data-action="${o.backAction || "back"}"`;
      back = backIconHtml(attr);
    }
    return `<div class="subnav">
      <div class="subnav-main">${back}<div class="subnav-title">${title}</div></div>
      ${right ? `<div class="subnav-right">${right}</div>` : ""}
    </div>`;
  }

  /** 消息入口铃铛；unread 有值时带红点数字 */
  function bellEntryHtml(unread) {
    const n = Number(unread) || 0;
    return `<span class="bell-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6.2 9.2a5.8 5.8 0 0 1 11.6 0c0 6.2 2.7 6.8 2.7 6.8H3.5s2.7-.6 2.7-6.8"/>
        <path d="M9.6 18.6a2.4 2.4 0 0 0 4.8 0"/>
      </svg>
    </span>${n > 0 ? `<i class="mbadge">${n > 99 ? "99+" : n}</i>` : ""}`;
  }

  /** 给机框打上 channel-app / channel-mp，并挂上小程序胶囊 */
  function applyChannelChrome(phoneEl, channel) {
    if (!phoneEl) return;
    const mp = channel === "mp";
    phoneEl.classList.toggle("channel-mp", mp);
    phoneEl.classList.toggle("channel-app", !mp);
    const old = phoneEl.querySelector(".mp-capsule");
    if (!mp) {
      old?.remove();
      return;
    }
    if (!old) phoneEl.insertAdjacentHTML("afterbegin", mpCapsuleHtml());
  }

  function startSmsCooldown(getSec, setSec, btnId) {
    setSec(60);
    const tick = () => {
      const next = getSec() - 1;
      setSec(next);
      const btn = document.getElementById(btnId);
      if (next > 0) {
        if (btn) {
          btn.disabled = true;
          btn.textContent = `${next}s`;
        }
        setTimeout(tick, 1000);
      } else {
        setSec(0);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "获取验证码";
        }
      }
    };
    tick();
  }

  global.HengwuPreview = {
    NOTIF_KEY,
    REFUND_SYNC_KEY,
    ORDER_SYNC_KEY,
    PRODUCT_CATEGORIES,
    normalizeProductSpecs,
    defaultSkuPicks,
    syncSkuPicks,
    skuPicksText,
    skuPicksKey,
    cartesianAttrCombos,
    skuAttrsKey,
    picksToAttrs,
    productCoverPic,
    normalizeProductSkus,
    findSkuByPicks,
    skuCoverPic,
    skuAggregate,
    priceRangeLabel,
    productListPrice,
    productMaxPrice,
    productPriceLabel,
    productStockTotal,
    productSoldLabel,
    mergeProductSkus,
    normalizeOrderItems,
    orderGoodsAmount,
    orderPayAmount,
    orderTitleSummary,
    orderItemCount,
    picKeyRaw,
    picForSide,
    PRODUCT_PIC_PRESETS,
    PRODUCT_PIC_MAX,
    normalizePicList,
    productBanners,
    productDetailPics,
    productThumbHtml,
    demoNextPicKey,
    uploadSlotHtml,
    multiUploadHtml,
    GOODS_SEED_VER,
    GOODS_SYNC_KEY,
    FREIGHT_MODE_OPTIONS,
    normalizeFreightMode,
    freightModeLabel,
    applyGoodsFreightFields,
    goodsFreightLabel,
    validateGoodsFreight,
    seedGoods,
    goodsPublishSnapshot,
    loadGoodsSync,
    saveGoodsSync,
    findGoodsSync,
    publishGoodsSync,
    unpublishGoodsSync,
    patchGoodsSyncOps,
    catalogForC,
    reassignGoodsFreightTpl,
    SHOP_SYNC_KEY,
    seedShop,
    shopPublishSnapshot,
    loadShopSync,
    publishShopSync,
    shopForC,
    REGION_TREE,
    REGION_BY_PROV,
    PROVINCE_GROUPS,
    PROVINCES,
    regionShort,
    provinceShort,
    parseAreaCode,
    areaCode,
    areaLabel,
    provincesText,
    regionsText,
    parseShipRegion,
    provinceOfRegion,
    areaCovers,
    findCoveringArea,
    provinceSelectState,
    areaOccupiedSet,
    normalizeFreightTpl,
    FREIGHT_SYNC_KEY,
    loadFreightTpls,
    saveFreightTpls,
    resetFreightTpls,
    freightTplOf,
    freightUnitLabel,
    freightRuleText,
    freightFreeText,
    freightRuleFor,
    freightByUnits,
    freightForTpl,
    goodsWeight,
    skuWeightText,
    calcFreight,
    freightBrief,
    freightBriefForGoods,
    freightShipHint,
    REVIEW_SYNC_KEY,
    REVIEW_HIDE_REASONS,
    REVIEW_HIDE_REJECT_REASON,
    loadReviews,
    saveReviews,
    clearReviews,
    addReview,
    updateReview,
    reviewHidden,
    reviewsForC,
    STOCK_DEDUCT_KEY,
    findSkuByLabel,
    loadStockDeducts,
    clearStockDeducts,
    planStockDeduction,
    deductStockForOrder,
    applyStockDeducts,
    loadOrderSync,
    upsertOrderSync,
    buildOrderSyncPayload,
    orderAmountBreakdown,
    BUSINESS_CATEGORIES,
    EXPRESS_COMPANIES,
    REFUND_REASONS,
    REFUND_REJECT_REASONS,
    hwSelectHtml,
    bindHwSelect,
    closeHwSelects,
    typePicksHtml,
    WITHDRAW_FEE_RATE,
    WITHDRAW_FEE_MIN,
    WITHDRAW_TYPE_ORDER,
    WITHDRAW_TYPE_META,
    maskPhone,
    loadNotifs,
    saveNotifs,
    notifUnread,
    markNotifRead,
    markAllNotifsRead,
    notifCatGlyph,
    normalizeWithdrawType,
    withdrawTypeMeta,
    withdrawTypeLabel,
    withdrawAccountIcon,
    withdrawAccountTitle,
    withdrawAccountSub,
    withdrawLedgerTitle,
    pickWithdrawAccount,
    calcWithdrawFee,
    withdrawArrive,
    withdrawFeeText,
    withdrawFeeBoxHtml,
    withdrawTypePickHtml,
    readWithdrawFormDraft,
    normalizeRefundStatus,
    mapRefundStatus,
    refundStatusHint,
    loadRefundSync,
    upsertRefundSync,
    startSmsCooldown,
    getPreviewChannel,
    setPreviewChannel,
    previewSideHref,
    previewSwitcherHtml,
    bindPreviewChannelSwitch,
    mountPreviewSwitchers,
    asideTabsHtml,
    screenNoteHtml,
    demoNoticeHtml,
    MAP_MOCK_POIS,
    mapMockPoiById,
    mapMockPoiByAddr,
    mapMockHtml,
    fitScrollToBottomBars,
    capturePhoneScroll,
    restorePhoneScroll,
    allowedWithdrawTypes,
    withdrawChannelTip,
    mpCapsuleHtml,
    statusBarHtml,
    backIconHtml,
    subnavHtml,
    bellEntryHtml,
    applyChannelChrome
  };
})(typeof window !== "undefined" ? window : globalThis);
