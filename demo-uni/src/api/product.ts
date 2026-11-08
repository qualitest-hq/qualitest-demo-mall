import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type { MallCategory, MallProduct, MallProductListQuery } from "@/types/product";

/**
 * 拉取启用状态的商品分类（不分页）。
 * 用于首页分类宫格与分类页侧栏。
 */
export function listEnabledCategories() {
  return request<MallCategory[]>({
    url: "/api/mall/mallCategory/enabled",
    method: "GET",
  });
}

/**
 * 拉取上架商品分页列表。
 * 可按分类主键筛选，可按商品名称模糊搜索；返回行数据一般不含规格列表。
 */
export function listProducts(query: MallProductListQuery = {}) {
  return request<PageResult<MallProduct>>({
    url: "/api/mall/mallProduct/list",
    method: "GET",
    data: query,
  });
}

/**
 * 按商品主键拉取详情。
 * 成功时附带该商品的规格列表，供选规格弹层使用。
 */
export function getProductDetail(productId: string) {
  return request<MallProduct>({
    url: `/api/mall/mallProduct/${productId}/detail`,
    method: "GET",
  });
}
