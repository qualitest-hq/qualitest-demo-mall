import { request } from "@/utils/request";
import type { AuthSessionResult, LoginByPasswordParams } from "@/types/auth";

/**
 * 账号密码登录。
 * 请求成功后返回令牌与昵称；页面负责写入本地会话，本函数不做跳转或存储。
 */
export function loginByPassword(params: LoginByPasswordParams) {
  return request<AuthSessionResult>({
    url: "/api/account/auth/login",
    method: "POST",
    data: params,
  });
}
