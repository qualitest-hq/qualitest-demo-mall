package com.demo.merchant.apiParams;

import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家经营类目 ApiParams 对象（客户端）
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
@Alias("MerchantCategoryApiParams")
public class MerchantCategoryApiParams implements Serializable {

    /**
     * 类目名称
     */
    private String categoryName;

    /**
     * 状态（0正常 1停用）
     */
    private Integer status;

}
