package com.demo.mall.apiParams;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * 客户端待付款订单改收货信息 / 留言
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MallOrderUpdateReceiverApiParams implements Serializable {

    /**
     * 收货地址ID；传入则覆盖订单收货快照
     */
    private Long addressId;

    /**
     * 买家留言；最长 60
     */
    private String buyerRemark;
}
