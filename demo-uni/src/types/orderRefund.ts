/** 退款申请明细 */
export interface MallOrderRefundApplyItem {
  orderItemId: string | number;
  refundQuantity: number;
}

/** 退款预览 / 申请入参 */
export interface MallOrderRefundApplyParams {
  orderId: string | number;
  refundType: number;
  refundReason: string;
  items?: MallOrderRefundApplyItem[];
}

/** 退款预览明细 */
export interface MallOrderRefundPreviewItem {
  orderItemId?: string;
  productName?: string;
  skuName?: string;
  salePrice?: number | string;
  quantity?: number;
  refundedQuantity?: number;
  refundableQuantity?: number;
  refundQuantity?: number;
  refundAmount?: number | string;
}

/** 退款预览 */
export interface MallOrderRefundPreview {
  canRefund?: boolean;
  refuseReason?: string;
  orderId?: string;
  payAmount?: number | string;
  refundedAmount?: number | string;
  refundAmount?: number | string;
  items?: MallOrderRefundPreviewItem[];
}

/** 退款单 */
export interface MallOrderRefund {
  refundId?: string;
  refundNo?: string;
  orderId?: string;
  refundType?: number;
  refundAmount?: number | string;
  refundStatus?: number | string;
  refundReason?: string;
  applyTime?: string;
  handleRemark?: string;
}
