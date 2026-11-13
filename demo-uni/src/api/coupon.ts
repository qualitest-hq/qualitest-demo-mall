import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type {
  AccountCoupon,
  CouponAvailableQuery,
  CouponTemplate,
  MyCouponQuery,
} from "@/types/coupon";

/** 可领取的优惠券列表 */
export function listAvailableCoupons(query: CouponAvailableQuery = {}) {
  const { pageNum = 1, pageSize = 20, productIds, categoryIds } = query;
  return request<PageResult<CouponTemplate>>({
    url: "/api/coupon/coupon/available",
    method: "GET",
    data: {
      pageNum,
      pageSize,
      productIds: productIds?.length ? productIds.join(",") : undefined,
      categoryIds: categoryIds?.length ? categoryIds.join(",") : undefined,
    },
  });
}

/** 领取优惠券 */
export function receiveCoupon(couponId: string) {
  return request<AccountCoupon>({
    url: `/api/coupon/coupon/${encodeURIComponent(couponId)}/receive`,
    method: "POST",
  });
}

/** 我的优惠券分页；过期 Tab 传 expired=true */
export function listMyCoupons(query: MyCouponQuery = {}) {
  const { useStatus, expired, pageNum = 1, pageSize = 20 } = query;
  return request<PageResult<AccountCoupon>>({
    url: "/api/coupon/accountCoupon/my",
    method: "GET",
    data: {
      useStatus: expired ? undefined : useStatus,
      expired: expired ? true : undefined,
      pageNum,
      pageSize,
    },
  });
}

/** 当前订单可用券 */
export function listMyAvailableCoupons(orderAmount: number | string) {
  return request<AccountCoupon[]>({
    url: "/api/coupon/accountCoupon/my/available",
    method: "GET",
    data: { orderAmount },
  });
}
