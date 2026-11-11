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
  /** 商家商品（占位） */
  MERCHANT_GOODS: "/pages/merchant/goods",
} as const;

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
