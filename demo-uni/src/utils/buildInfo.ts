/**
 * 构建期注入的版本信息（Vite：仅 VITE_ 前缀会打进客户端）。
 * 用于控制台辨认当前包是否已滚到演示机。
 */
export const buildInfo = {
  name: "demo-uni",
  version: import.meta.env.VITE_APP_VERSION || "0.0.0",
  gitSha: import.meta.env.VITE_GIT_SHA || "",
  buildTime: import.meta.env.VITE_BUILD_TIME || "",
  mode: import.meta.env.MODE || "",
};

/** 启动时打一行，便于对照 FreshDock / 本地包 */
export function logBuildInfo(): void {
  const sha = buildInfo.gitSha ? ` sha=${buildInfo.gitSha.slice(0, 7)}` : "";
  const built = buildInfo.buildTime ? ` built=${buildInfo.buildTime}` : "";
  console.info(`[${buildInfo.name}] v${buildInfo.version}${sha}${built} mode=${buildInfo.mode}`);
}
