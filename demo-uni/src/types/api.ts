/**
 * 接口统一外层响应。
 * 请求封装校验 code 后只把 data 交给调用方。
 */
export interface ApiResult<T = unknown> {
  /** 业务状态码，成功为 200 */
  code: number;
  /** 提示文案 */
  msg: string;
  /** 业务数据 */
  data: T;
}

/**
 * 分页列表数据。
 * 请求封装解包后，页面拿到的就是这一层（含 rows 与 total），无需再取一层 data。
 */
export interface PageResult<T> {
  /** 当前页记录 */
  rows: T[];
  /** 符合条件的总条数 */
  total: number;
}

/** 业务成功码 */
export const API_SUCCESS = 200;
/** 未登录或令牌失效码 */
export const API_UNAUTHORIZED = 401;
