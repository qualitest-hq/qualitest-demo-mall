/**
 * 本地存储键名。
 * 集中定义，避免各处手写字符串导致读写键不一致。
 */
export const STORAGE_KEYS = {
  /** 客户端访问令牌 */
  TOKEN: "hengwu_token",
  /** 当前登录用户摘要（昵称等） */
  USER: "hengwu_user",
  /**
   * 待选中的分类主键。
   * 首页宫格切到分类 Tab 前写入；分类页显示时读取一次并立即删除。
   * 底部 Tab 切换不能携带查询参数，用该短生命周期键传递意图。
   */
  PENDING_CATEGORY_ID: "hengwu_pending_category_id",
  /** 确认订单页选择地址后回写 */
  CHECKOUT_PICK_ADDRESS: "checkout_pick_address",
  /** 确认订单页选择优惠券后回写（0 表示不使用） */
  CHECKOUT_PICK_COUPON: "checkout_pick_coupon",
} as const;
