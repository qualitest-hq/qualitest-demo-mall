import { request } from "@/utils/request";
import type {
  Merchant,
  MerchantApply,
  MerchantApplySubmitPayload,
  MerchantCategory,
} from "@/types/merchant";

/** 启用经营类目（匿名） */
export function listEnabledMerchantCategories() {
  return request<MerchantCategory[]>({
    url: "/api/merchant/merchantCategory/enabled",
    method: "GET",
  });
}

/** 当前账号生效店铺；未开店返回 null */
export function getMyMerchant() {
  return request<Merchant | null>({
    url: "/api/merchant/merchant/my",
    method: "GET",
  });
}

/** 提交入驻申请 */
export function submitSettleApply(data: MerchantApplySubmitPayload) {
  return request<MerchantApply>({
    url: "/api/merchant/merchantApply/my/settle",
    method: "POST",
    data,
  });
}

/** 最新入驻申请 */
export function getLatestSettleApply() {
  return request<MerchantApply | null>({
    url: "/api/merchant/merchantApply/my/settle/latest",
    method: "GET",
  });
}

/** 提交资料变更申请 */
export function submitProfileApply(data: MerchantApplySubmitPayload) {
  return request<MerchantApply>({
    url: "/api/merchant/merchantApply/my/profile",
    method: "POST",
    data,
  });
}

/** 最新资料变更申请 */
export function getLatestProfileApply() {
  return request<MerchantApply | null>({
    url: "/api/merchant/merchantApply/my/profile/latest",
    method: "GET",
  });
}

/** 撤销待审申请 */
export function withdrawApply(applyId: string) {
  return request<void>({
    url: `/api/merchant/merchantApply/my/${encodeURIComponent(applyId)}/withdraw`,
    method: "PUT",
  });
}
