package com.demo.merchant.apiParams;

import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家 ApiParams 对象（客户端）
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
@Alias("MerchantApiParams")
public class MerchantApiParams implements Serializable {

    /**
     * 账号ID
     */
    private Long accountId;

    /**
     * 店铺名称
     */
    private String merchantName;

    /**
     * 经营类目ID
     */
    private Long categoryId;

    /**
     * 联系人
     */
    private String contactName;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 营业状态（0打烊 1营业）
     */
    private Integer openStatus;

    /**
     * 商家状态（0正常 1停用）
     */
    private Integer status;

}
