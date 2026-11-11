package com.demo.merchant.result;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;
import java.util.Date;
import java.math.BigDecimal;
import com.demo.common.annotation.Excel;

import java.io.Serializable;

/**
 * 商家经营类目 Result 对象
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
@Alias("MerchantCategoryResult")
public class MerchantCategoryResult implements Serializable {

    /**
     * 经营类目ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long categoryId;

    /**
     * 类目名称
     */
    @Excel(name = "类目名称")
    private String categoryName;

    /**
     * 排序
     */
    @Excel(name = "排序")
    private Integer sortNum;

    /**
     * 状态（0正常 1停用）
     */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private Integer status;

    /**
     * 备注
     */
    @Excel(name = "备注")
    private String remark;


}
