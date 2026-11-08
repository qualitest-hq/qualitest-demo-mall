import { request } from "@/utils/request";
import type {
  MallCartAddParams,
  MallCartItem,
  MallCartQuantityParams,
  MallCartSelectedParams,
} from "@/types/cart";

/** 查询我的购物车 */
export function listMyCart() {
  return request<MallCartItem[]>({
    url: "/api/mall/mallCart/my",
    method: "GET",
  });
}

/** 加入购物车 */
export function addCartItem(params: MallCartAddParams) {
  return request<void>({
    url: "/api/mall/mallCart/my",
    method: "POST",
    data: params,
  });
}

/** 修改数量，传 0 删除该行 */
export function updateCartQuantity(params: MallCartQuantityParams) {
  return request<void>({
    url: "/api/mall/mallCart/my/quantity",
    method: "PUT",
    data: params,
  });
}

/** 批量勾选或取消勾选 */
export function updateCartSelected(params: MallCartSelectedParams) {
  return request<void>({
    url: "/api/mall/mallCart/my/selected",
    method: "PUT",
    data: params,
  });
}

/** 批量删除购物车行 */
export function removeCartItems(cartIds: string[]) {
  return request<void>({
    url: "/api/mall/mallCart/my/batch",
    method: "DELETE",
    data: { cartIds },
  });
}

/** 清空购物车 */
export function clearMyCart() {
  return request<void>({
    url: "/api/mall/mallCart/my/clear",
    method: "DELETE",
  });
}
