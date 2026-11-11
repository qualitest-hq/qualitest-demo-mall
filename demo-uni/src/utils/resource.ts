/**
 * 把库内路径转成页面可展示的地址。
 * - 空串、blob：原样返回
 * - 以 http(s) 开头的外链（含对象存储 CDN）：原样返回
 * - 已带 API 根地址的：不再重复拼接
 * - 其它相对路径：拼上 VITE_API_BASE_URL
 */
export function resolveResourceUrl(path?: string | null): string {
  if (!path) {
    return "";
  }
  const trimmed = String(path).trim();
  if (!trimmed || trimmed.startsWith("blob:") || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (base && trimmed.startsWith(base)) {
    return trimmed;
  }
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

/**
 * 把展示地址收成适合入库的值。
 * - blob：丢弃
 * - 外链若等于本 API 根：剥掉前缀存相对路径；其它外链完整保留
 * - 相对路径：原样返回
 */
export function toStoredPath(url?: string | null): string {
  if (!url) {
    return "";
  }
  const trimmed = String(url).trim();
  if (!trimmed || trimmed.startsWith("blob:")) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    if (base && trimmed.startsWith(base)) {
      return trimmed.slice(base.length);
    }
    return trimmed;
  }
  return trimmed;
}
