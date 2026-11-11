/** 商家经营类目 */
export interface MerchantCategory {
  categoryId: string;
  categoryName: string;
  sortNum?: number;
  status?: number;
}

/** 生效店铺 */
export interface Merchant {
  merchantId: string;
  accountId?: string;
  merchantName: string;
  categoryId?: string;
  logo?: string;
  contactName?: string;
  contactPhone?: string;
  licenseFiles?: string;
  /** 0打烊 1营业 */
  openStatus?: number;
  /** 0正常 1停用 */
  status?: number;
  remark?: string;
}

/** 商家申请（入驻 / 资料变更） */
export interface MerchantApply {
  applyId: string;
  accountId?: string;
  merchantId?: string;
  /** 1入驻 2资料变更 */
  applyType?: string | number;
  merchantName?: string;
  categoryId?: string;
  logo?: string;
  contactName?: string;
  contactPhone?: string;
  licenseFiles?: string;
  openStatus?: number;
  /** 0待审 1已通过 2已驳回 3已撤销 */
  status?: number;
  rejectReason?: string;
  auditTime?: string;
  remark?: string;
}

/** 提交入驻 / 资料变更 */
export interface MerchantApplySubmitPayload {
  merchantName: string;
  categoryId: string | number;
  logo?: string;
  contactName: string;
  contactPhone: string;
  licenseFiles?: string;
  openStatus?: number;
}

/** 申请状态 */
export const APPLY_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  WITHDRAWN: 3,
} as const;
