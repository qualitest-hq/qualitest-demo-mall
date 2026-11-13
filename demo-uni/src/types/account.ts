/** 收货地址 */
export interface AccountAddress {
  addressId: string;
  accountId?: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  postalCode?: string;
  /** 是否默认：0 否 1 是 */
  isDefault?: number;
  remark?: string;
}

/** 账号资料 */
export interface AccountProfile {
  accountId?: string;
  nickName?: string;
  mobile?: string;
  /** 账户余额 */
  balance?: number | string;
  /** 性别：0 男 1 女 2 未知 */
  gender?: number;
}

/** 修改资料 */
export interface AccountProfileUpdateParams {
  nickName?: string;
  gender?: number;
}

/** 修改密码 */
export interface AccountPasswordUpdateParams {
  oldPassword: string;
  newPassword: string;
}

/** 收货地址保存 */
export interface AccountAddressSaveParams {
  addressId?: string;
  receiverName?: string;
  /** 收货人手机号 */
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  postalCode?: string;
  isDefault?: number;
}

/** 余额流水 */
export interface AccountBalanceRecord {
  balanceRecordId?: string;
  accountId?: string;
  /** 1 充值 2 赠送 3 订单支付 4 订单退款 */
  recordType?: number;
  /** 1 收入 2 支出 */
  changeType?: number;
  changeAmount?: number | string;
  balanceBefore?: number | string;
  balanceAfter?: number | string;
  bizId?: string;
  bizNo?: string;
  remark?: string;
  createTime?: string;
}

/** 余额流水列表筛选 */
export interface AccountBalanceRecordQuery {
  recordType?: number;
  changeType?: number;
  pageNum?: number;
  pageSize?: number;
}
