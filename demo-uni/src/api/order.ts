import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type {
  MallOrder,
  MallOrderCancelParams,
  MallOrderListQuery,
  MallOrderPayParams,
  MallOrderPreview,
  MallOrderSubmitParams,
  MallOrderUpdateReceiverParams,
} from "@/types/order";

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

/** 我的订单分页列表；可按 orderStatus / 时间筛选 */
export function listMyOrders(query: MallOrderListQuery = {}) {
  const data: Record<string, string | number> = {
    pageNum: query.pageNum ?? 1,
    pageSize: query.pageSize ?? 10,
  };
  if (query.orderStatus !== undefined && query.orderStatus !== null) {
    data.orderStatus = query.orderStatus;
  }
  if (query.orderNo) data.orderNo = query.orderNo;
  if (query.beginTime) data.beginTime = query.beginTime;
  if (query.endTime) data.endTime = query.endTime;
  return request<PageResult<MallOrder>>({
    url: "/api/mall/mallOrder/my",
    method: "GET",
    data,
  });
}

/** 我的订单详情（含明细） */
export function getMyOrder(orderId: string) {
  return request<MallOrder>({
    url: `/api/mall/mallOrder/my/${orderId}`,
    method: "GET",
  });
}

/** 取消待付款订单；须带 cancelReason */
export function cancelOrder(orderId: string, params: MallOrderCancelParams) {
  return request<void>({
    url: `/api/mall/mallOrder/my/${orderId}/cancel`,
    method: "POST",
    data: params,
  });
}

/** 确认收货（仅待收货） */
export function confirmReceiveOrder(orderId: string) {
  return request<void>({
    url: `/api/mall/mallOrder/my/${orderId}/confirmReceive`,
    method: "POST",
  });
}

/** 待付款改收货地址或留言 */
export function updateOrderReceiver(orderId: string, params: MallOrderUpdateReceiverParams) {
  return request<void>({
    url: `/api/mall/mallOrder/my/${orderId}/updateReceiver`,
    method: "POST",
    data: params,
  });
}
