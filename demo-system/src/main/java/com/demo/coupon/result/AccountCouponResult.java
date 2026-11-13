package com.demo.coupon.result;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.ibatis.type.Alias;
import java.util.Date;
import java.math.BigDecimal;
import com.demo.common.annotation.Excel;

import java.io.Serializable;

/**
 * 账号优惠券 Result 对象
 *
 * @author demo
 * @since 2026-06-20
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("AccountCouponResult")
public class AccountCouponResult implements Serializable {

    /**
     * 账号优惠券ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long accountCouponId;

    /**
     * 优惠券ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long couponId;

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
     * 券名称
     */
    @Excel(name = "券名称")
    private String couponName;

    /**
     * 满减门槛
     */
    @Excel(name = "满减门槛")
    private BigDecimal thresholdAmount;

    /**
     * 满减金额
     */
    @Excel(name = "满减金额")
    private BigDecimal discountAmount;

    /**
     * 适用范围：0 全场，1 指定分类，2 指定商品
     */
    @Excel(name = "适用范围", readConverterExp = "0=全场,1=指定分类,2=指定商品")
    private Integer scopeType;

    /**
     * 适用范围目标 ID，逗号分隔
     */
    @Excel(name = "适用范围ID")
    private String scopeIds;

    /**
     * 有效开始
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "有效开始", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date validStartTime;

    /**
     * 有效结束
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "有效结束", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date validEndTime;

    /**
     * 使用状态：0 未使用，1 已使用
     */
    @Excel(name = "使用状态", readConverterExp = "0=未使用,1=已使用")
    private Integer useStatus;

    /**
     * 展示状态：0 未使用，1 已使用，2 已过期（按有效结束时间即时计算）
     */
    @Excel(name = "展示状态", readConverterExp = "0=未使用,1=已使用,2=已过期")
    private Integer couponStatus;

    /**
     * 领取时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "领取时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date receiveTime;

    /**
     * 使用时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "使用时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date useTime;

    /**
     * 使用订单ID
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long orderId;

    /**
     * 使用订单编号
     */
    @Excel(name = "使用订单编号")
    private String orderNo;


}
