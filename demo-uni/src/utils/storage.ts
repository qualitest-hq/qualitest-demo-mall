/**
 * 本地存储读写封装。
 * 统一处理空值与异常，业务代码不必直接调用 uni 的同步存储 API。
 */

/** 读取本地值；键不存在或读写异常时返回 fallback */
export function getStorage<T>(key: string, fallback: T | null = null): T | null {
  try {
    const raw = uni.getStorageSync(key);
    if (raw === "" || raw === undefined || raw === null) {
      return fallback;
    }
    return raw as T;
  } catch {
    return fallback;
  }
}

/** 写入本地值 */
export function setStorage(key: string, value: unknown): void {
  uni.setStorageSync(key, value);
}

/** 删除本地键 */
export function removeStorage(key: string): void {
  uni.removeStorageSync(key);
}
