package com.demo.coupon.apiParams;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 我的优惠券查询入参
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("AccountCouponApiParams")
public class AccountCouponApiParams implements Serializable {

    /** 优惠券模板 ID */
    private Long couponId;

    /** 当前登录账号 ID */
    @JsonIgnore
    private Long accountId;

    /** 券名称 */
    private String couponName;

    /** 使用状态：0 未使用，1 已使用；未使用不含已过期 */
    private Integer useStatus;

    /** 为 true 时查已过期且未使用的券 */
    private Boolean expired;

    /** 订单商品金额，传入后只返回当前可用的券 */
    private BigDecimal orderAmount;

    /** 订单商品 ID，用于按券适用范围过滤 */
    private List<Long> productIds;

    /** 订单分类 ID，用于按券适用范围过滤 */
    private List<Long> categoryIds;

}
