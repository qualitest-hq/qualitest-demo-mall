package com.demo.merchant.params;

import com.demo.common.core.domain.BaseEntity;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家经营类目 Params 对象
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
@Alias("MerchantCategoryParams")
public class MerchantCategoryParams extends BaseEntity implements Serializable {

    /**
     * 类目名称
     */
    private String categoryName;

    /**
     * 状态（0正常 1停用）
     */
    private Integer status;

}
