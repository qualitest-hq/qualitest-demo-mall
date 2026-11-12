package com.demo.mall.apiParams;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

/**
 * 商家保存本店商品入参
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
@Alias("MallProductMerchantSaveApiParams")
public class MallProductMerchantSaveApiParams implements Serializable {

    /** 商品ID，编辑时必传 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long productId;

    /** 分类ID */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long categoryId;

    /** 商品名称 */
    private String productName;

    /** 计量单位 */
    private String unitName;

    /** 市场价 */
    private BigDecimal marketPrice;

    /** 销售价 */
    private BigDecimal salePrice;

    /** 固定运费 */
    private BigDecimal freightAmount;

    /** 主图路径 */
    private String mainImage;

    /** 图集路径列表 */
    private List<String> galleryImages;

    /** 商品简介 */
    private String intro;

    /** 上架状态：0下架 1上架 */
    private Integer shelfStatus;

    /** 排序 */
    private Integer sortNum;

    /** 备注 */
    private String remark;

    /** SKU 列表 */
    private List<MallProductMerchantSkuSaveApiParams> skus;
}
