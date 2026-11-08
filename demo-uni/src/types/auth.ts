/**
 * 密码登录请求参数。
 */
export interface LoginByPasswordParams {
  /** 登录手机号 */
  mobile: string;
  /** 登录密码明文，仅用于本次请求 */
  password: string;
}

/**
 * 登录成功后的会话数据。
 * 由请求层解包后交给页面写入用户仓库。
 */
export interface AuthSessionResult {
  /** 账号主键；接口常以字符串返回，避免大整数精度丢失 */
  accountId: string;
  /** 访问令牌，后续请求放在 Authorization Bearer 头 */
  token: string;
  /** 展示用昵称 */
  nickName: string;
}
