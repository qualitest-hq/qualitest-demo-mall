package com.demo.merchant.apiResult;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 商家申请 ApiResult 对象（客户端）
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
@Alias("MerchantApplyApiResult")
public class MerchantApplyApiResult implements Serializable {

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
     * 商家ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long merchantId;

    /**
     * 申请类型（1入驻 2资料变更）
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long applyType;

    /**
     * 店铺名称
     */
    private String merchantName;

    /**
     * 经营类目ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
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
     * 资质文件
     */
    private String licenseFiles;

    /**
     * 营业状态（0打烊 1营业）
     */
    private Integer openStatus;

    /**
     * 申请状态（0待审 1已通过 2已驳回 3已撤销）
     */
    private Integer status;

    /**
     * 驳回原因
     */
    private String rejectReason;

    /**
     * 审核时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date auditTime;

    /**
     * 备注
     */
    private String remark;


}
