package com.demo.merchant.apiParams;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * 客户端提交商家申请（入驻 / 资料变更）
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
public class MerchantApplySubmitApiParams implements Serializable {

    /**
     * 店铺名称
     */
    private String merchantName;

    /**
     * 经营类目ID
     */
    private Long categoryId;

    /**
     * 商家图标
     */
    private String logo;

    /**
     * 联系人
     */
    private String contactName;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 资质文件 JSON
     */
    private String licenseFiles;

    /**
     * 营业状态（0打烊 1营业）
     */
    private Integer openStatus;
}
