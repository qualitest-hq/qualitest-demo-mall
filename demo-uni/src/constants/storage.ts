/**
 * 本地持久化键名。
 * 集中定义，避免各处手写字符串造成读写键不一致。
 */
export const STORAGE_KEYS = {
  /** 客户端登录令牌 */
  TOKEN: "hengwu_token",
  /** 当前登录用户摘要 */
  USER: "hengwu_user",
} as const;
