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
}
