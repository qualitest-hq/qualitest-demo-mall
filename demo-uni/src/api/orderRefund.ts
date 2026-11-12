import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type {
  MallOrderRefund,
  MallOrderRefundApplyParams,
  MallOrderRefundPreview,
} from "@/types/orderRefund";

/** 退款预览：是否可退与拟退金额 */
export function previewRefund(params: MallOrderRefundApplyParams) {
  return request<MallOrderRefundPreview>({
    url: "/api/mall/mallOrderRefund/preview",
    method: "POST",
    data: params,
  });
}

/** 提交退款申请 */
export function applyRefund(params: MallOrderRefundApplyParams) {
  return request<MallOrderRefund>({
    url: "/api/mall/mallOrderRefund/apply",
    method: "POST",
    data: params,
  });
}

/** 我的退款单分页 */
export function listMyRefunds(pageNum = 1, pageSize = 10) {
  return request<PageResult<MallOrderRefund>>({
    url: "/api/mall/mallOrderRefund/my",
    method: "GET",
    data: { pageNum, pageSize },
  });
}

/** 撤销待审核退款 */
export function cancelRefund(refundId: string) {
  return request<void>({
    url: `/api/mall/mallOrderRefund/my/${refundId}/cancel`,
    method: "POST",
  });
}
