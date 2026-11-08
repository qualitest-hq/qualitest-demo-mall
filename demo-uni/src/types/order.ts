/** 立即购买的一行商品 */
export interface MallOrderSubmitItem {
  skuId: string;
  quantity: number;
}

/**
 * 结算算价或创建订单的请求参数。
 * cartIds（购物车勾选）与 items（立即购买）二选一。
 */
export interface MallOrderSubmitParams {
  /** 购物车行主键列表 */
  cartIds?: string[];
  /** 立即购买的商品行 */
  items?: MallOrderSubmitItem[];
  /** 收货地址主键 */
  addressId?: string;
  /** 选用的优惠券主键（可选） */
  accountCouponId?: string | number;
  /** 买家留言 */
  buyerRemark?: string;
}

/** 算价结果中的商品行 */
export interface MallOrderPreviewItem {
  skuId?: string;
  productName?: string;
  skuName?: string;
  salePrice?: number | string;
  quantity?: number;
  /** 该行金额小计 */
  totalAmount?: number | string;
}

/** 算价结果中的收货地址快照 */
export interface MallOrderAddressSnapshot {
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
}

/** 结算算价或创建订单的返回体 */
export interface MallOrderPreview {
  /** 创建成功后的订单主键 */
  orderId?: string;
  /** 订单编号 */
  orderNo?: string;
  /** 商品合计 */
  totalAmount?: number | string;
  /** 优惠券抵扣 */
  couponAmount?: number | string;
  /** 其它折扣 */
  discountAmount?: number | string;
  /** 运费 */
  freightAmount?: number | string;
  /** 应付金额 */
  payAmount?: number | string;
  items?: MallOrderPreviewItem[];
  address?: MallOrderAddressSnapshot;
}

/** 支付请求体；payType=3 为余额支付 */
export interface MallOrderPayParams {
  /** 支付方式编码 */
  payType: number;
}
