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

/** 取消订单；cancelReason 必填 1–64 字 */
export interface MallOrderCancelParams {
  cancelReason: string;
}

/** 待付款改收货 / 留言 */
export interface MallOrderUpdateReceiverParams {
  addressId?: string | number;
  buyerRemark?: string;
}

/** 我的订单列表查询 */
export interface MallOrderListQuery {
  orderStatus?: number | null;
  orderNo?: string;
  beginTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
}

/** 订单明细行 */
export interface MallOrderItem {
  orderItemId?: string;
  orderId?: string;
  productId?: string;
  skuId?: string;
  productName?: string;
  skuName?: string;
  salePrice?: number | string;
  quantity?: number;
  totalAmount?: number | string;
  refundedQuantity?: number;
  refundedAmount?: number | string;
  /** 关联商品主图；无图为空串 */
  productImage?: string;
}

/** 我的订单列表/详情 */
export interface MallOrder {
  orderId?: string;
  orderNo?: string;
  orderStatus?: number | string;
  totalAmount?: number | string;
  discountAmount?: number | string;
  couponName?: string;
  couponAmount?: number | string;
  freightAmount?: number | string;
  payAmount?: number | string;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  buyerRemark?: string;
  cancelReason?: string;
  deliveryTime?: string;
  receiveTime?: string;
  finishTime?: string;
  payType?: number;
  payStatus?: number;
  payTime?: string;
  refundAmount?: number | string;
  refundStatus?: number;
  createTime?: string;
  items?: MallOrderItem[];
}
