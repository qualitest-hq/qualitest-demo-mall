/**
 * 页面路径与跳转封装，避免业务里手写路径字符串。
 */
export const ROUTES = {
  /** 首页 Tab */
  HOME: "/pages/home/home",
  /** 分类 Tab */
  CATEGORY: "/pages/category/category",
  /** 购物车 Tab */
  CART: "/pages/cart/cart",
  /** 我的 Tab */
  MINE: "/pages/mine/mine",
  /** 登录页 */
  LOGIN: "/pages/login/login",
  /** 搜索页 */
  SEARCH: "/pages/search/search",
  /** 商品详情页 */
  DETAIL: "/pages/detail/detail",
  /** 确认订单页 */
  CHECKOUT: "/pages/checkout/checkout",
  /** 收银台 */
  PAY: "/pages/pay/pay",
  /** 支付成功页 */
  PAY_RESULT: "/pages/pay-result/pay-result",
  /** 我的订单列表 */
  ORDER_LIST: "/pages/order/list",
  /** 订单详情 */
  ORDER_DETAIL: "/pages/order/detail",
  /** 物流占位 */
  LOGISTICS: "/pages/logistics/logistics",
  /** 申请退款 */
  REFUND_APPLY: "/pages/refund/apply",
  /** 我的退款 */
  REFUND_LIST: "/pages/refund/list",
  /** 商家中心入口（自动分流） */
  MERCHANT_INDEX: "/pages/merchant/index",
  /** 入驻申请 */
  MERCHANT_APPLY: "/pages/merchant/apply",
  /** 入驻待审 */
  MERCHANT_PENDING: "/pages/merchant/pending",
  /** 入驻驳回 */
  MERCHANT_REJECTED: "/pages/merchant/rejected",
  /** 商家工作台 */
  MERCHANT_DASH: "/pages/merchant/dash",
  /** 店铺资料变更 */
  MERCHANT_PROFILE: "/pages/merchant/profile",
  /** 商家商品列表 */
  MERCHANT_GOODS: "/pages/merchant/goods",
  /** 商家商品新建/编辑 */
  MERCHANT_GOODS_EDIT: "/pages/merchant/goods-edit",
  /** 个人资料 */
  PROFILE: "/pages/profile/profile",
  /** 修改密码 */
  PASSWORD: "/pages/account/password",
  /** 收货地址列表 */
  ADDRESS_LIST: "/pages/address/list",
  /** 编辑收货地址 */
  ADDRESS_EDIT: "/pages/address/edit",
  /** 优惠券 */
  COUPON_LIST: "/pages/coupon/list",
  /** 我的余额 */
  BALANCE: "/pages/balance/index",
  /** 用户协议 */
  LEGAL_USER: "/pages/legal/user-agreement",
  /** 隐私政策 */
  LEGAL_PRIVACY: "/pages/legal/privacy",
} as const;

/** 打开本店商品编辑页，不传 ID 为新建 */
export function openMerchantGoodsEdit(productId?: string) {
  const q = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  uni.navigateTo({ url: `${ROUTES.MERCHANT_GOODS_EDIT}${q}` });
}

/** 打开商家中心入口 */
export function openMerchantIndex() {
  uni.navigateTo({ url: ROUTES.MERCHANT_INDEX });
}

/**
 * 打开确认订单页。
 * @param query 查询串，如 cartIds=1,2 或 buySkuId=xx&buyQty=1
 */
export function openCheckout(query: string) {
  const q = query.startsWith("?") ? query : `?${query}`;
  uni.navigateTo({ url: `${ROUTES.CHECKOUT}${q}` });
}

/**
 * 打开收银台，携带订单主键、应付金额与可选订单编号。
 */
export function openPay(orderId: string, payAmount: string | number, orderNo?: string) {
  const amount = encodeURIComponent(String(payAmount ?? ""));
  const no = orderNo ? `&orderNo=${encodeURIComponent(orderNo)}` : "";
  uni.navigateTo({
    url: `${ROUTES.PAY}?orderId=${encodeURIComponent(orderId)}&payAmount=${amount}${no}`,
  });
}

/**
 * 打开支付成功页。
 * 使用 redirectTo 替换收银台，避免用户返回再次支付。
 */
export function openPayResult(orderId: string, payAmount: string | number, orderNo?: string) {
  const amount = encodeURIComponent(String(payAmount ?? ""));
  const no = orderNo ? `&orderNo=${encodeURIComponent(orderNo)}` : "";
  uni.redirectTo({
    url: `${ROUTES.PAY_RESULT}?orderId=${encodeURIComponent(orderId)}&payAmount=${amount}${no}`,
  });
}

/**
 * 打开我的订单列表。
 * @param orderStatus Tab 对应状态；不传为全部
 */
export function openOrders(orderStatus?: number | null) {
  const q =
    orderStatus === undefined || orderStatus === null
      ? ""
      : `?orderStatus=${encodeURIComponent(String(orderStatus))}`;
  uni.navigateTo({ url: `${ROUTES.ORDER_LIST}${q}` });
}

/** 打开订单详情 */
export function openOrderDetail(orderId: string) {
  uni.navigateTo({
    url: `${ROUTES.ORDER_DETAIL}?orderId=${encodeURIComponent(orderId)}`,
  });
}

/** 打开物流占位页 */
export function openLogistics(orderId: string) {
  uni.navigateTo({
    url: `${ROUTES.LOGISTICS}?orderId=${encodeURIComponent(orderId)}`,
  });
}

/** 打开申请退款 */
export function openRefundApply(orderId: string) {
  uni.navigateTo({
    url: `${ROUTES.REFUND_APPLY}?orderId=${encodeURIComponent(orderId)}`,
  });
}

/** 打开我的退款列表 */
export function openRefundList() {
  uni.navigateTo({ url: ROUTES.REFUND_LIST });
}

/**
 * 拼商品详情页地址。
 * @param productId 商品主键
 */
export function toDetail(productId: string) {
  return `${ROUTES.DETAIL}?productId=${encodeURIComponent(productId)}`;
}

/**
 * 打开商品详情页。
 * @param productId 商品主键
 */
export function openProduct(productId: string) {
  uni.navigateTo({ url: toDetail(productId) });
}

/** 打开搜索页 */
export function openSearch() {
  uni.navigateTo({ url: ROUTES.SEARCH });
}

/**
 * 返回上一页；没有上一页时切到首页 Tab。
 */
export function navigateBackOrHome() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: ROUTES.HOME });
    },
  });
}

/** 个人资料 */
export function openProfile() {
  uni.navigateTo({ url: ROUTES.PROFILE });
}

/** 修改密码 */
export function openPassword() {
  uni.navigateTo({ url: ROUTES.PASSWORD });
}

/**
 * 收货地址列表。
 * @param pick 为 true 时进入选择模式（确认订单）
 */
export function openAddressList(options?: { pick?: boolean }) {
  const q = options?.pick ? "?pick=1" : "";
  uni.navigateTo({ url: `${ROUTES.ADDRESS_LIST}${q}` });
}

/**
 * 新建或编辑收货地址。
 * @param id 地址主键，不传为新建
 */
export function openAddressEdit(options?: { id?: string }) {
  const q = options?.id ? `?addressId=${encodeURIComponent(options.id)}` : "";
  uni.navigateTo({ url: `${ROUTES.ADDRESS_EDIT}${q}` });
}

/**
 * 优惠券列表。
 * @param pick 确认订单选券
 * @param orderAmount 选券时传入订单金额
 */
export function openCouponList(options?: { pick?: boolean; orderAmount?: number | string }) {
  const parts: string[] = [];
  if (options?.pick) {
    parts.push("pick=1");
  }
  if (options?.orderAmount !== undefined && options?.orderAmount !== "") {
    parts.push(`orderAmount=${encodeURIComponent(String(options.orderAmount))}`);
  }
  const q = parts.length ? `?${parts.join("&")}` : "";
  uni.navigateTo({ url: `${ROUTES.COUPON_LIST}${q}` });
}

/** 我的余额 */
export function openBalance() {
  uni.navigateTo({ url: ROUTES.BALANCE });
}

/** 用户协议 */
export function openLegalUserAgreement() {
  uni.navigateTo({ url: ROUTES.LEGAL_USER });
}

/** 隐私政策 */
export function openLegalPrivacy() {
  uni.navigateTo({ url: ROUTES.LEGAL_PRIVACY });
}
