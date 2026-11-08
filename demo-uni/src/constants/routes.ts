/**
 * 页面路径常量与常用跳转。
 * 业务里通过本文件跳转，避免散落手写路径字符串。
 */
export const ROUTES = {
  /** 首页（底部 Tab） */
  HOME: "/pages/home/home",
  /** 分类（底部 Tab） */
  CATEGORY: "/pages/category/category",
  /** 购物车（底部 Tab） */
  CART: "/pages/cart/cart",
  /** 我的（底部 Tab） */
  MINE: "/pages/mine/mine",
  /** 登录页（普通栈页，不在 Tab 内） */
  LOGIN: "/pages/login/login",
  /** 搜索页（普通栈页） */
  SEARCH: "/pages/search/search",
  /** 商品详情页（普通栈页） */
  DETAIL: "/pages/detail/detail",
} as const;

/**
 * 拼出商品详情页地址（含商品主键查询参数）。
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
 * 返回上一页；若当前没有上一页（例如冷启动直达详情），则切换到首页 Tab。
 */
export function navigateBackOrHome() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: ROUTES.HOME });
    },
  });
}
