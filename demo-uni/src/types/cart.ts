/** 购物车列表行 */
export interface MallCartItem {
  /** 购物车主键 */
  cartId: string;
  /** 账号主键 */
  accountId?: string;
  /** 商品主键 */
  productId?: string;
  /** SKU 主键 */
  skuId?: string;
  /** 数量 */
  quantity: number;
  /** 勾选：0 否 1 是 */
  selected?: number;
  /** 商品名称 */
  productName?: string;
  /** SKU 规格名 */
  skuName?: string;
  /** 销售单价 */
  salePrice?: number | string;
  /** 行小计（单价×数量） */
  subtotal?: number | string;
  /** 当前库存 */
  stock?: number;
  /** 是否可结算；false 时进失效区 */
  available?: boolean;
  /** 不可结算原因文案 */
  unavailableReason?: string | null;
}

/** 加入购物车参数 */
export interface MallCartAddParams {
  /** SKU 主键 */
  skuId: string;
  /** 加购数量 */
  quantity: number;
}

/** 改量参数；数量传 0 表示删除 */
export interface MallCartQuantityParams {
  cartId: string;
  quantity: number;
}

/** 批量勾选参数 */
export interface MallCartSelectedParams {
  cartIds: string[];
  /** 0 取消勾选，1 勾选 */
  selected: 0 | 1;
}
