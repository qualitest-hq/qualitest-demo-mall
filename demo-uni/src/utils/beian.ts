/** 演示站运行时 ICP / 公网安备（由站点根 /config.js 注入；镜像内留空则不展示） */

export type MpsBeian = {
  number: string;
  url: string;
};

type QualitestWindow = Window & {
  __QUALITEST_ICP__?: { number?: string };
  __QUALITEST_MPS__?: { number?: string; url?: string };
};

function win(): QualitestWindow | undefined {
  // #ifdef H5
  return typeof window !== "undefined" ? (window as QualitestWindow) : undefined;
  // #endif
  // #ifndef H5
  return undefined;
  // #endif
}

/** 读取网站 ICP 备案号（带 -1） */
export function readIcpNumber(): string {
  const raw = win()?.__QUALITEST_ICP__;
  return raw && typeof raw.number === "string" ? raw.number.trim() : "";
}

/** 读取公安联网备案 */
export function readMpsBeian(): MpsBeian {
  const raw = win()?.__QUALITEST_MPS__;
  const number = raw && typeof raw.number === "string" ? raw.number.trim() : "";
  const url =
    raw && typeof raw.url === "string" && raw.url.trim()
      ? raw.url.trim()
      : "https://beian.mps.gov.cn/";
  return { number, url };
}
