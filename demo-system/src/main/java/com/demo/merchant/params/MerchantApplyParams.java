package com.demo.merchant.params;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.demo.common.core.domain.BaseEntity;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家申请 Params 对象
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
@Alias("MerchantApplyParams")
public class MerchantApplyParams extends BaseEntity implements Serializable {

    /**
     * 账号ID
     */
    private Long accountId;

    /**
     * 账号昵称（模糊）
     */
    private String accountNickName;

    /**
     * 账号手机号（模糊）
     */
    private String accountMobile;

    /**
     * 商家ID
     */
    private Long merchantId;

    /**
     * 申请类型（1入驻 2资料变更）
     */
    private Long applyType;

    /**
     * 店铺名称
     */
    private String merchantName;

    /**
     * 经营类目ID
     */
    private Long categoryId;

    /**
     * 经营类目名称（模糊）
     */
    private String categoryName;

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
     * 申请状态（0待审 1已通过 2已驳回 3已撤销）
     */
    private Integer status;

}
