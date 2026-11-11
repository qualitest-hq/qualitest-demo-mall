/**
 * 商城商品分类。
 */
export interface MallCategory {
  /** 分类主键 */
  categoryId: string;
  /** 分类名称 */
  categoryName: string;
  /** 展示排序，数值越小越靠前（具体排序以后端为准） */
  orderNum?: number;
  /** 状态：0 正常，1 停用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/**
 * 商品规格（SKU）。
 * 规格名是单个展示字符串，不是多维属性对象。
 */
export interface MallProductSku {
  /** 规格主键 */
  skuId: string;
  /** 所属商品主键 */
  productId: string;
  /** 规格名称，用于选项文案 */
  skuName: string;
  /** 市场价（划线价） */
  marketPrice?: number | string;
  /** 销售价 */
  salePrice?: number | string;
  /** 该规格库存 */
  stock?: number;
  /** 该规格销量 */
  salesCount?: number;
  /** 状态：0 正常，1 停用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** 商品（SPU） */
export interface MallProduct {
  /** 商品ID */
  productId: string;
  /** 商家ID */
  merchantId?: string;
  /** 店铺名称 */
  merchantName?: string;
  /** 所属分类主键 */
  categoryId?: string;
  /** 商品名称 */
  productName: string;
  /** 计量单位，如件、盒 */
  unitName?: string;
  /** 市场价（划线价） */
  marketPrice?: number | string;
  /** 销售价 */
  salePrice?: number | string;
  /** 固定运费金额；为 0 表示无运费 */
  freightAmount?: number | string;
  /** 商品总库存 */
  stockTotal?: number;
  /** 累计销量 */
  salesCount?: number;
  /** 上架状态：0 下架，1 上架 */
  shelfStatus?: number;
  /** 排序字段 */
  sortNum?: number;
  /** 备注或简介文本 */
  remark?: string;
  /** 规格列表；仅详情有值 */
  skus?: MallProductSku[];
}

/**
 * 商品列表查询条件。
 */
export interface MallProductListQuery {
  /** 按分类主键精确筛选；不传则查全部分类 */
  categoryId?: string;
  /** 按商品名称模糊匹配；请求字段名为 productName */
  productName?: string;
  /** 页码，从 1 开始 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 本店商品列表查询 */
export interface MerchantProductListQuery {
  /** 上架状态：0下架 1上架 */
  shelfStatus?: number;
  /** 分类ID */
  categoryId?: string;
  /** 商品名称 */
  productName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 保存本店商品时的 SKU */
export interface MerchantProductSkuSavePayload {
  /** SKU ID，有则更新 */
  skuId?: string;
  /** SKU 名称 */
  skuName: string;
  /** 市场价 */
  marketPrice?: number | string;
  /** 销售价 */
  salePrice: number | string;
  /** 库存 */
  stock: number;
  /** 状态：0正常 1停用 */
  status?: number;
}

/** 保存本店商品入参 */
export interface MerchantProductSavePayload {
  /** 商品ID，编辑时必传 */
  productId?: string;
  /** 分类ID */
  categoryId: string;
  /** 商品名称 */
  productName: string;
  /** 计量单位 */
  unitName?: string;
  /** 市场价 */
  marketPrice?: number | string;
  /** 销售价 */
  salePrice?: number | string;
  /** 固定运费 */
  freightAmount?: number | string;
  /** 上架状态：0下架 1上架 */
  shelfStatus?: number;
  /** 排序 */
  sortNum?: number;
  /** 备注 */
  remark?: string;
  /** SKU 列表 */
  skus: MerchantProductSkuSavePayload[];
}
