import { ORDER_STATUS, orderStatusLabel } from "@/constants/orderStatus";
import type { MallOrder } from "@/types/order";

/** 列表/详情状态展示：退款中优先示「退款中」 */
export function displayOrderStatus(order: MallOrder | null | undefined): string {
  if (!order) return "";
  return orderStatusLabel(order.orderStatus);
}

export function isUnpaid(order: MallOrder): boolean {
  return Number(order.orderStatus) === ORDER_STATUS.UNPAID;
}

export function isPendingShip(order: MallOrder): boolean {
  return Number(order.orderStatus) === ORDER_STATUS.PENDING_SHIP;
}

export function isPendingReceive(order: MallOrder): boolean {
  return Number(order.orderStatus) === ORDER_STATUS.PENDING_RECEIVE;
}

export function isFinished(order: MallOrder): boolean {
  return Number(order.orderStatus) === ORDER_STATUS.FINISHED;
}

export function isRefunding(order: MallOrder): boolean {
  return Number(order.orderStatus) === ORDER_STATUS.REFUNDING;
}

/** 待收货或已完成可申请退款入口（薄；后端再判 canRefund） */
export function canApplyRefundEntry(order: MallOrder): boolean {
  const s = Number(order.orderStatus);
  return s === ORDER_STATUS.PENDING_RECEIVE || s === ORDER_STATUS.FINISHED;
}

/** 件数合计 */
export function orderItemCount(order: MallOrder): number {
  return (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
}
