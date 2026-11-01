/**
 * C 端 / 商家端 HTML 预览共用：
 * 站内通知（非 IM）、退款同步、商品分类、提现账户/手续费、退款状态映射。
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

  const GOODS_SHELF_OPTIONS = [
    { value: "on", label: "在售" },
    { value: "pending", label: "审核中" },
    { value: "off", label: "已下架" }
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

  /** @deprecated 保留兼容；请用 hwSelectHtml */
  function selectOptionsHtml(items, selected) {
    return normalizePickItems(items).map((it) =>
      `<option value="${escapeAttr(it.value)}" ${String(it.value) === String(selected) ? "selected" : ""}>${escapeAttr(it.label)}</option>`
    ).join("");
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
            <button type="button" class="${ch === "app" ? "on" : ""}" data-preview-channel="app">App/H5</button>
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
  function asideTabsHtml(labels, active) {
    return Object.entries(labels || {}).map(([k, label]) =>
      `<button type="button" data-screen="${k}" class="${k === active ? "active" : ""}">${label}</button>`
    ).join("");
  }

  /** App/H5 全类型；小程序仅微信 */
  function allowedWithdrawTypes(channel) {
    return channel === "mp" ? ["wechat"] : WITHDRAW_TYPE_ORDER.slice();
  }

  function withdrawChannelTip(role, channel) {
    const merchant = role === "merchant" || role === "m";
    if (channel === "mp") {
      return merchant
        ? "当前为微信小程序商家端：仅支持提现到微信商家零钱。支付宝、对公卡请使用 App/H5。"
        : "当前为微信小程序：仅支持提现到微信零钱。支付宝、银行卡请使用 App/H5。";
    }
    return merchant
      ? "App/H5 支持提现到微信商家零钱、支付宝企业账户、对公银行卡。"
      : "App/H5 支持提现到微信零钱、支付宝、银行卡。";
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
    PRODUCT_CATEGORIES,
    normalizeProductSpecs,
    defaultSkuPicks,
    syncSkuPicks,
    skuPicksText,
    skuPicksKey,
    normalizeOrderItems,
    orderGoodsAmount,
    orderTitleSummary,
    orderItemCount,
    BUSINESS_CATEGORIES,
    EXPRESS_COMPANIES,
    REFUND_REASONS,
    REFUND_REJECT_REASONS,
    GOODS_SHELF_OPTIONS,
    hwSelectHtml,
    selectOptionsHtml,
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
