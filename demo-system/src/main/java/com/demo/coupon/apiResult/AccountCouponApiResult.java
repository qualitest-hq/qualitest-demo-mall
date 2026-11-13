package com.demo.coupon.apiResult;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 我的优惠券出参
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("AccountCouponApiResult")
public class AccountCouponApiResult implements Serializable {

    /** 用户券 ID */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long accountCouponId;

    /** 券模板 ID */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long couponId;

    /** 账号 ID */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long accountId;

    /** 券名称 */
    private String couponName;

    /** 满减门槛 */
    private BigDecimal thresholdAmount;

    /** 满减金额 */
    private BigDecimal discountAmount;

    /** 适用范围：0 全场，1 指定分类，2 指定商品 */
    private Integer scopeType;

    /** 适用范围目标 ID，逗号分隔 */
    private String scopeIds;

    /** 有效开始时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date validStartTime;

    /** 有效结束时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date validEndTime;

    /** 使用状态：0 未使用，1 已使用 */
    private Integer useStatus;

    /** 是否已过期（按有效结束时间计算） */
    private Boolean expired;

    /** 展示状态：0 未使用，1 已使用，2 已过期 */
    private Integer couponStatus;

    /**
     * 领取时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date receiveTime;

    /**
     * 使用时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date useTime;

    /**
     * 使用订单ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long orderId;


}
