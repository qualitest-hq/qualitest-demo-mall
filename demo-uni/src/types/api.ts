/**
 * 后端接口统一响应体形状。
 * 请求封装校验 code 后解出 data，调用方只拿到业务数据。
 */
export interface ApiResult<T = unknown> {
  /** 业务状态码，成功为 200 */
  code: number;
  /** 提示文案 */
  msg: string;
  /** 业务载荷 */
  data: T;
}

/** 业务成功码 */
export const API_SUCCESS = 200;
/** 未登录或令牌失效 */
export const API_UNAUTHORIZED = 401;
