package com.demo.mall.apiResult;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;
import java.math.BigDecimal;

/** 购物车列表行（客户端） */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("MallCartApiResult")
public class MallCartApiResult implements Serializable {

    /** 购物车主键 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long cartId;

    /** 账号主键 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long accountId;

    /** 商品主键 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long productId;

    /** SKU 主键 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long skuId;

    /** 数量 */
    private Integer quantity;

    /** 勾选状态：0否 1是 */
    private Integer selected;

    /** 商品名称 */
    private String productName;

    /** SKU 名称 */
    private String skuName;

    /** 销售单价 */
    private BigDecimal salePrice;

    /** 行小计 */
    private BigDecimal subtotal;

    /** 当前库存 */
    private Integer stock;

    /** 是否可结算 */
    private Boolean available;

    /** 不可结算原因 */
    private String unavailableReason;

    /** 上架状态，仅服务端填可用标记用 */
    @JsonIgnore
    private Integer shelfStatus;

    /** SKU 状态，仅服务端填可用标记用 */
    @JsonIgnore
    private Integer skuStatus;

}
