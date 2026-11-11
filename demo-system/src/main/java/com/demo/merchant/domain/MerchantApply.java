package com.demo.merchant.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
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
 * 商家申请对象 merchant_apply
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
@Alias("MerchantApply")
public class MerchantApply extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

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
     * 删除标志（0未删除 1已删除）
     */
    private Integer delFlag;

}
