package com.demo.merchant.result;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;
import java.util.Date;
import java.math.BigDecimal;
import com.demo.common.annotation.Excel;

import java.io.Serializable;

/**
 * 商家申请 Result 对象
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
@Alias("MerchantApplyResult")
public class MerchantApplyResult implements Serializable {

    /**
     * 申请ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long applyId;

    /**
     * 账号ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long accountId;

    /**
     * 账号昵称
     */
    @Excel(name = "账号昵称")
    private String accountNickName;

    /**
     * 账号手机号
     */
    @Excel(name = "账号手机号")
    private String accountMobile;

    /**
     * 商家ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long merchantId;

    /**
     * 关联商家名称（资料变更时）
     */
    @Excel(name = "关联商家")
    private String linkedMerchantName;

    /**
     * 申请类型（1入驻 2资料变更）
     */
    @Excel(name = "申请类型", readConverterExp = "1=入驻,2=资料变更")
    private Long applyType;

    /**
     * 店铺名称
     */
    @Excel(name = "店铺名称")
    private String merchantName;

    /**
     * 经营类目ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long categoryId;

    /**
     * 经营类目名称
     */
    @Excel(name = "经营类目")
    private String categoryName;

    /**
     * 商家图标
     */
    @Excel(name = "商家图标")
    private String logo;

    /**
     * 联系人
     */
    @Excel(name = "联系人")
    private String contactName;

    /**
     * 联系电话
     */
    @Excel(name = "联系电话")
    private String contactPhone;

    /**
     * 资质文件
     */
    @Excel(name = "资质文件")
    private String licenseFiles;

    /**
     * 营业状态（0打烊 1营业）
     */
    @Excel(name = "营业状态", readConverterExp = "0=打烊,1=营业")
    private Integer openStatus;

    /**
     * 申请状态（0待审 1已通过 2已驳回 3已撤销）
     */
    @Excel(name = "申请状态", readConverterExp = "0=待审,1=已通过,2=已驳回,3=已撤销")
    private Integer status;

    /**
     * 驳回原因
     */
    @Excel(name = "驳回原因")
    private String rejectReason;

    /**
     * 审核时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "审核时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date auditTime;

    /**
     * 备注
     */
    @Excel(name = "备注")
    private String remark;


}
