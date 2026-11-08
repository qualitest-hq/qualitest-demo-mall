/**
 * 缓存在本地的账号摘要。
 * 登录成功后写入，供「我的」等页展示昵称等信息。
 */
export interface UserProfile {
  /** 账号主键，用字符串避免大整数精度丢失 */
  accountId?: string;
  /** 昵称 */
  nickName?: string;
}
