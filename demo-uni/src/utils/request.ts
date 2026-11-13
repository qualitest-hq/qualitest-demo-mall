import { ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import { API_SUCCESS, API_UNAUTHORIZED, type ApiResult } from "@/types/api";

/** 发起业务请求时的可选参数 */
export interface RequestOptions {
  /** 接口路径：相对路径会拼上环境变量里的根地址；也可传完整 http(s) URL */
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  header?: Record<string, string>;
  /** 失败时是否弹出 toast，默认弹出 */
  showError?: boolean;
  /** 超时毫秒数，默认 15000 */
  timeout?: number;
}

/** 将相对路径与 VITE_API_BASE_URL 拼成最终请求地址 */
function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * 未授权处理：清空登录态。
 * 若当前页不是登录页，则清空页面栈并打开登录页，避免重复跳转。
 */
function handleUnauthorized() {
  const user = useUserStore();
  user.logout();
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as { route?: string } | undefined;
  if (current?.route !== "pages/login/login") {
    uni.reLaunch({ url: ROUTES.LOGIN });
  }
}

/** toast 过长会被截断；完整错误一律打控制台便于排查 */
function toastShort(message: string) {
  const text = (message || "请求失败").replace(/\s+/g, " ").trim();
  uni.showToast({
    title: text.length > 40 ? `${text.slice(0, 40)}…` : text,
    icon: "none",
  });
}

function logRequestError(
  kind: string,
  detail: {
    method: string;
    url: string;
    status?: number;
    code?: number;
    msg?: string;
    body?: unknown;
    err?: unknown;
  },
) {
  console.error(`[api] ${kind}`, detail);
}

/**
 * 统一 HTTP 请求入口。
 * - 自动携带 Authorization Bearer（已登录时）
 * - 解析响应体 code / msg / data；成功时 Promise 只返回 data
 * - HTTP 状态或业务 code 为 401 时清登录并进登录页
 * - 其它业务失败可 toast（可用 showError 关闭）；完整错误打 console
 */
export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = "GET", data, header = {}, showError = true, timeout = 15000 } = options;
  const user = useUserStore();
  const finalUrl = resolveUrl(url);

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method,
      data: data as UniApp.RequestOptions["data"],
      timeout,
      header: {
        "Content-Type": "application/json",
        ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        ...header,
      },
      success: (res) => {
        const status = res.statusCode || 0;
        if (status === API_UNAUTHORIZED) {
          logRequestError("unauthorized(http)", { method, url: finalUrl, status });
          handleUnauthorized();
          reject(new Error("未登录或登录已过期"));
          return;
        }

        const body = res.data as ApiResult<T> | undefined;
        if (!body || typeof body !== "object" || !("code" in body)) {
          logRequestError("bad-response", { method, url: finalUrl, status, body: res.data });
          if (showError) {
            toastShort("响应格式异常");
          }
          reject(new Error("响应格式异常"));
          return;
        }

        if (body.code === API_UNAUTHORIZED) {
          logRequestError("unauthorized(biz)", {
            method,
            url: finalUrl,
            status,
            code: body.code,
            msg: body.msg,
            body,
          });
          handleUnauthorized();
          reject(new Error(body.msg || "未登录或登录已过期"));
          return;
        }

        if (body.code !== API_SUCCESS) {
          logRequestError("biz-fail", {
            method,
            url: finalUrl,
            status,
            code: body.code,
            msg: body.msg,
            body,
          });
          if (showError) {
            toastShort(body.msg || "请求失败");
          }
          reject(new Error(body.msg || "请求失败"));
          return;
        }

        resolve(body.data);
      },
      fail: (err) => {
        logRequestError("network", { method, url: finalUrl, err });
        if (showError) {
          toastShort("网络异常");
        }
        reject(err);
      },
    });
  });
}
