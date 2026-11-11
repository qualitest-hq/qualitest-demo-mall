import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type {
  MerchantProductListQuery,
  MerchantProductSavePayload,
  MallProduct,
} from "@/types/product";

/** 本店商品分页列表 */
export function listMyProducts(query: MerchantProductListQuery = {}) {
  return request<PageResult<MallProduct>>({
    url: "/api/merchant/mallProduct/my/list",
    method: "GET",
    data: query,
  });
}

/** 本店在售商品数 */
export function getMyOnsaleCount() {
  return request<{ count: number }>({
    url: "/api/merchant/mallProduct/my/onsaleCount",
    method: "GET",
  });
}

/** 本店商品详情（含 SKU） */
export function getMyProductDetail(productId: string) {
  return request<MallProduct>({
    url: `/api/merchant/mallProduct/my/${encodeURIComponent(productId)}`,
    method: "GET",
  });
}

/** 新建本店商品 */
export function createMyProduct(data: MerchantProductSavePayload) {
  return request<MallProduct>({
    url: "/api/merchant/mallProduct/my",
    method: "POST",
    data,
  });
}

/** 更新本店商品 */
export function updateMyProduct(data: MerchantProductSavePayload) {
  return request<MallProduct>({
    url: "/api/merchant/mallProduct/my",
    method: "PUT",
    data,
  });
}

/** 本店商品上下架 */
export function changeMyProductShelfStatus(productId: string, shelfStatus: number) {
  return request<void>({
    url: "/api/merchant/mallProduct/my/changeShelfStatus",
    method: "PUT",
    data: { productId, shelfStatus },
  });
}
