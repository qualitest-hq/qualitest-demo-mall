/** 订单状态数字与预览 Tab 文案 */

export const ORDER_STATUS = {
  UNPAID: 0,
  PENDING_SHIP: 1,
  PENDING_RECEIVE: 2,
  FINISHED: 3,
  CANCELLED: 4,
  REFUNDING: 5,
} as const;

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** 订单列表 Tab：label 展示，value 为查询 orderStatus；全部为 null */
export const ORDER_TABS: Array<{ label: string; value: number | null }> = [
  { label: "全部", value: null },
  { label: "待付款", value: ORDER_STATUS.UNPAID },
  { label: "待发货", value: ORDER_STATUS.PENDING_SHIP },
  { label: "待收货", value: ORDER_STATUS.PENDING_RECEIVE },
  { label: "已完成", value: ORDER_STATUS.FINISHED },
  { label: "退款", value: ORDER_STATUS.REFUNDING },
  { label: "已取消", value: ORDER_STATUS.CANCELLED },
];

/** 我的页订单快捷入口（不含全部/已取消） */
export const MINE_ORDER_ENTRIES: Array<{ label: string; value: number }> = [
  { label: "待付款", value: ORDER_STATUS.UNPAID },
  { label: "待发货", value: ORDER_STATUS.PENDING_SHIP },
  { label: "待收货", value: ORDER_STATUS.PENDING_RECEIVE },
  { label: "已完成", value: ORDER_STATUS.FINISHED },
  { label: "退款", value: ORDER_STATUS.REFUNDING },
];

const STATUS_LABEL: Record<number, string> = {
  [ORDER_STATUS.UNPAID]: "待付款",
  [ORDER_STATUS.PENDING_SHIP]: "待发货",
  [ORDER_STATUS.PENDING_RECEIVE]: "待收货",
  [ORDER_STATUS.FINISHED]: "已完成",
  [ORDER_STATUS.CANCELLED]: "已取消",
  [ORDER_STATUS.REFUNDING]: "退款中",
};

/** 订单状态中文 */
export function orderStatusLabel(status?: number | string | null): string {
  if (status === undefined || status === null || status === "") return "未知";
  const n = Number(status);
  return STATUS_LABEL[n] || `状态${status}`;
}

/** 取消原因预设（提交时作为 cancelReason） */
export const CANCEL_REASON_PRESETS = ["不想要了", "信息填错了", "重新下单", "其他"] as const;
