import { defineStore } from "pinia";
import { STORAGE_KEYS } from "@/constants/storage";
import type { UserProfile } from "@/types/user";
import { getStorage, removeStorage, setStorage } from "@/utils/storage";

/** 登录相关的内存状态 */
interface UserState {
  /** 访问令牌，请求头 Authorization 使用 */
  token: string;
  /** 当前用户摘要，可为空 */
  profile: UserProfile | null;
}

/**
 * 用户登录态仓库。
 * 内存与本地存储同步维护令牌和用户摘要；请求层读 token，启动时 hydrate 恢复。
 */
export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: "",
    profile: null,
  }),
  getters: {
    /** 是否已持有令牌（以此判断已登录） */
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    /** 从本地存储恢复 token 与用户摘要，应用启动时调用一次 */
    hydrate() {
      this.token = getStorage<string>(STORAGE_KEYS.TOKEN, "") || "";
      this.profile = getStorage<UserProfile>(STORAGE_KEYS.USER, null);
    },
    /**
     * 写入登录会话。
     * profile 传入对象则写入本地；传入 null 则清除用户摘要；不传则只更新令牌。
     */
    setSession(token: string, profile?: UserProfile | null) {
      this.token = token;
      setStorage(STORAGE_KEYS.TOKEN, token);
      if (profile !== undefined) {
        this.profile = profile;
        if (profile) {
          setStorage(STORAGE_KEYS.USER, profile);
        } else {
          removeStorage(STORAGE_KEYS.USER);
        }
      }
    },
    /** 清空内存与本地中的登录信息 */
    logout() {
      this.token = "";
      this.profile = null;
      removeStorage(STORAGE_KEYS.TOKEN);
      removeStorage(STORAGE_KEYS.USER);
    },
  },
});
