package com.demo.mall.apiParams;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

/**
 * 商家保存本店商品时的 SKU 入参
 *
 * @author demo
 * @since 2026-11-11
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("MallProductMerchantSkuSaveApiParams")
public class MallProductMerchantSkuSaveApiParams implements Serializable {

    /** SKU ID，有则更新、无则新增 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long skuId;

    /** SKU 名称 */
    private String skuName;

    /** 市场价 */
    private BigDecimal marketPrice;

    /** 销售价 */
    private BigDecimal salePrice;

    /** 库存 */
    private Integer stock;

    /** 状态：0正常 1停用 */
    private Integer status;
}
