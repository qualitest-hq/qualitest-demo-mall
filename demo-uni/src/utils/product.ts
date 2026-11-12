import type { MallProduct, MallProductSku } from "@/types/product";
import { resolveResourceUrl } from "@/utils/resource";

/**
 * 取商品名称第一个可见字符。
 * 无主图时用该字符做色块占位文案。
 */
export function productInitial(name?: string | null): string {
  const text = (name || "").trim();
  return text ? text.slice(0, 1) : "品";
}

/**
 * 主图优先、其后图集，去重后的入库路径列表；无图返回空数组。
 */
export function productImagePaths(
  product?: Pick<MallProduct, "mainImage" | "galleryImages"> | null,
): string[] {
  if (!product) {
    return [];
  }
  const paths: string[] = [];
  const main = (product.mainImage || "").trim();
  if (main) {
    paths.push(main);
  }
  for (const g of product.galleryImages || []) {
    const t = (g || "").trim();
    if (t && !paths.includes(t)) {
      paths.push(t);
    }
  }
  return paths;
}

/**
 * 解析商品封面展示地址：优先主图，其次图集首张；无图返回空串。
 */
export function productCoverUrl(product?: Pick<MallProduct, "mainImage" | "galleryImages"> | null): string {
  const first = productImagePaths(product)[0];
  return first ? resolveResourceUrl(first) : "";
}

/**
 * 详情轮播用：主图+图集去重后解析为可展示 URL。
 */
export function productGalleryUrls(
  product?: Pick<MallProduct, "mainImage" | "galleryImages"> | null,
): string[] {
  return productImagePaths(product)
    .map((path) => resolveResourceUrl(path))
    .filter(Boolean);
}

/**
 * 把金额格式化成两位小数字符串。
 * 空值或无法解析时返回空串，便于划线价在无值时隐藏。
 */
export function formatMoney(value?: number | string | null): string {
  if (value == null || value === "") {
    return "";
  }
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toFixed(2);
}

/**
 * 过滤掉总库存不大于 0 的商品，只保留可售行。
 */
export function filterInStockProducts(rows: MallProduct[] | undefined | null): MallProduct[] {
  return (rows || []).filter((p) => Number(p.stockTotal ?? 0) > 0);
}

/**
 * 判断单个规格是否可选：状态正常且库存大于 0。
 */
export function isSkuUsable(sku: MallProductSku): boolean {
  return Number(sku.status ?? 0) === 0 && Number(sku.stock ?? 0) > 0;
}

/**
 * 从规格列表中筛出可选规格。
 */
export function usableSkus(skus: MallProductSku[] | undefined | null): MallProductSku[] {
  return (skus || []).filter(isSkuUsable);
}

/**
 * 选出默认规格：优先第一个可选规格；若全部不可选则退回列表第一项；列表为空则返回 null。
 */
export function pickDefaultSku(skus: MallProductSku[] | undefined | null): MallProductSku | null {
  const list = skus || [];
  if (!list.length) {
    return null;
  }
  return usableSkus(list)[0] || list[0] || null;
}
