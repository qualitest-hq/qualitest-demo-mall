import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type { AccountAddress, AccountProfile } from "@/types/account";

/** 查询当前账号资料 */
export function getProfile() {
  return request<AccountProfile>({
    url: "/api/account/auth/profile",
    method: "GET",
  });
}

/** 查询我的收货地址 */
export function listMyAddresses(pageNum = 1, pageSize = 50) {
  return request<PageResult<AccountAddress>>({
    url: "/api/account/accountAddress/my",
    method: "GET",
    data: { pageNum, pageSize },
  });
}

/**
 * 模拟充值：向当前账号余额增加指定金额（演示用，非真实支付）。
 * @param amount 充值金额，一般为应付差额向上取整
 */
export function rechargeBalance(amount: number) {
  return request<void>({
    url: "/api/account/accountBalanceRecord/recharge",
    method: "POST",
    data: { amount },
  });
}
