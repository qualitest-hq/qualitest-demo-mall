import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type {
  AccountAddress,
  AccountAddressSaveParams,
  AccountBalanceRecord,
  AccountBalanceRecordQuery,
  AccountPasswordUpdateParams,
  AccountProfile,
  AccountProfileUpdateParams,
} from "@/types/account";

/** 查询当前账号资料 */
export function getProfile() {
  return request<AccountProfile>({
    url: "/api/account/auth/profile",
    method: "GET",
  });
}

/** 更新当前账号资料 */
export function updateProfile(params: AccountProfileUpdateParams) {
  return request<void>({
    url: "/api/account/auth/profile",
    method: "PUT",
    data: params,
  });
}

/** 修改登录密码 */
export function updatePassword(params: AccountPasswordUpdateParams) {
  return request<void>({
    url: "/api/account/auth/password",
    method: "PUT",
    data: params,
  });
}

/** 退出登录 */
export function logout() {
  return request<void>({
    url: "/api/account/auth/logout",
    method: "POST",
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

/** 收货地址详情 */
export function getAddress(addressId: string) {
  return request<AccountAddress>({
    url: `/api/account/accountAddress/my/${encodeURIComponent(addressId)}`,
    method: "GET",
  });
}

/** 新增收货地址 */
export function createAddress(params: AccountAddressSaveParams) {
  return request<AccountAddress>({
    url: "/api/account/accountAddress/my",
    method: "POST",
    data: params,
  });
}

/** 修改收货地址 */
export function updateAddress(params: AccountAddressSaveParams) {
  return request<void>({
    url: "/api/account/accountAddress/my",
    method: "PUT",
    data: params,
  });
}

/** 删除收货地址 */
export function deleteAddress(addressId: string) {
  return request<void>({
    url: `/api/account/accountAddress/my/${encodeURIComponent(addressId)}`,
    method: "DELETE",
  });
}

/** 设为默认地址 */
export function setDefaultAddress(addressId: string) {
  return request<void>({
    url: `/api/account/accountAddress/my/${encodeURIComponent(addressId)}/default`,
    method: "PUT",
  });
}

/** 我的余额流水 */
export function listBalanceRecords(query: AccountBalanceRecordQuery = {}) {
  const { pageNum = 1, pageSize = 20, recordType, changeType } = query;
  return request<PageResult<AccountBalanceRecord>>({
    url: "/api/account/accountBalanceRecord/my",
    method: "GET",
    data: { pageNum, pageSize, recordType, changeType },
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
