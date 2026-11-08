import type { MallProduct, MallProductSku } from "@/types/product";

/**
 * 取商品名称第一个可见字符。
 * 接口暂无主图时，用该字符做色块占位文案。
 */
export function productInitial(name?: string | null): string {
  const text = (name || "").trim();
  return text ? text.slice(0, 1) : "品";
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
