/**
 * 打开站外/同站其它入口（仅 H5）。
 * App / 小程序不执行，避免误开系统浏览器。
 */
export function openExternalUrl(url: string | undefined | null): void {
  const target = (url || "").trim();
  if (!target) {
    return;
  }
  // #ifdef H5
  window.open(target, "_blank", "noopener,noreferrer");
  // #endif
  // #ifndef H5
  uni.showToast({ title: "请在浏览器 H5 中打开", icon: "none" });
  // #endif
}
