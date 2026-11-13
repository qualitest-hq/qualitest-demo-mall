/** 可领取的优惠券模板 */
export interface CouponTemplate {
  couponId?: string;
  couponName?: string;
  thresholdAmount?: number | string;
  discountAmount?: number | string;
  totalCount?: number;
  receiveCount?: number;
  usedCount?: number;
  validStartTime?: string;
  validEndTime?: string;
  status?: number;
  remark?: string;
  /** 适用范围：0 全场，1 分类，2 商品 */
  scopeType?: number;
  /** 适用范围目标 ID，逗号分隔 */
  scopeIds?: string;
}

/** 我的优惠券 */
export interface AccountCoupon {
  accountCouponId?: string;
  couponId?: string;
  accountId?: string;
  couponName?: string;
  thresholdAmount?: number | string;
  discountAmount?: number | string;
  validStartTime?: string;
  validEndTime?: string;
  /** 使用状态：0 未使用，1 已使用 */
  useStatus?: number;
  /** 是否已过期 */
  expired?: boolean;
  /** 展示状态：0 未使用，1 已使用，2 已过期 */
  couponStatus?: number;
  receiveTime?: string;
  useTime?: string;
  orderId?: string;
  /** 适用范围：0 全场，1 分类，2 商品 */
  scopeType?: number;
  /** 适用范围目标 ID，逗号分隔 */
  scopeIds?: string;
}

/** 我的券列表查询 */
export interface MyCouponQuery {
  /** 使用状态：0 未使用，1 已使用 */
  useStatus?: number;
  /** 为 true 时查已过期未用券 */
  expired?: boolean;
  pageNum?: number;
  pageSize?: number;
}

/** 可领券列表查询 */
export interface CouponAvailableQuery {
  pageNum?: number;
  pageSize?: number;
  productIds?: string[];
  categoryIds?: string[];
}
