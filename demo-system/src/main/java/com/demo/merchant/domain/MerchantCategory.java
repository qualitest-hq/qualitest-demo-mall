package com.demo.merchant.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;
import com.demo.common.core.domain.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serial;

/**
 * 商家经营类目对象 merchant_category
 * 
 * @author demo
 * @date 2026-11-11
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("MerchantCategory")
public class MerchantCategory extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 经营类目ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long categoryId;

    /**
     * 类目名称
     */
    private String categoryName;

    /**
     * 排序
     */
    private Integer sortNum;

    /**
     * 状态（0正常 1停用）
     */
    private Integer status;

    /**
     * 删除标志（0未删除 1已删除）
     */
    private Integer delFlag;

}
