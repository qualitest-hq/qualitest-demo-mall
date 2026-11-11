package com.demo.merchant.result;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;
import java.util.Date;
import java.math.BigDecimal;
import com.demo.common.annotation.Excel;

import java.io.Serializable;

/**
 * 商家 Result 对象
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
@Alias("MerchantResult")
public class MerchantResult implements Serializable {

    /**
     * 商家ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long merchantId;

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
     * 商家状态（0正常 1停用）
     */
    @Excel(name = "商家状态", readConverterExp = "0=正常,1=停用")
    private Integer status;

    /**
     * 备注
     */
    @Excel(name = "备注")
    private String remark;


}
