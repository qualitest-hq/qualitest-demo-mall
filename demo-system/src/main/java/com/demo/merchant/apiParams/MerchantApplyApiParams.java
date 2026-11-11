package com.demo.merchant.apiParams;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家申请 ApiParams 对象（客户端）
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
@Alias("MerchantApplyApiParams")
public class MerchantApplyApiParams implements Serializable {

    /**
     * 账号ID
     */
    private Long accountId;

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
