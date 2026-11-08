/**
 * 页面路径常量。
 * navigateTo / switchTab / reLaunch 等跳转时使用，避免业务里手写路径字符串。
 */
export const ROUTES = {
  /** 首页 Tab */
  HOME: "/pages/home/home",
  /** 购物车 Tab */
  CART: "/pages/cart/cart",
  /** 我的 Tab */
  MINE: "/pages/mine/mine",
  /** 登录页（非 Tab） */
  LOGIN: "/pages/login/login",
} as const;
