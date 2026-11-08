import { request } from "@/utils/request";
import type { MallOrderPayParams, MallOrderPreview, MallOrderSubmitParams } from "@/types/order";

/** 结算算价：返回商品明细、运费、优惠与应付金额，不落库订单 */
export function previewOrder(params: MallOrderSubmitParams) {
  return request<MallOrderPreview>({
    url: "/api/mall/mallOrder/preview",
    method: "POST",
    data: params,
  });
}

/** 创建待支付订单并返回订单主键、编号与应付金额 */
export function createOrder(params: MallOrderSubmitParams) {
  return request<MallOrderPreview>({
    url: "/api/mall/mallOrder/create",
    method: "POST",
    data: params,
  });
}

/**
 * 支付指定订单。
 * @param params.payType 支付方式；3 表示余额支付
 */
export function payOrder(orderId: string, params: MallOrderPayParams) {
  return request<void>({
    url: `/api/mall/mallOrder/my/${orderId}/pay`,
    method: "POST",
    data: params,
  });
}
