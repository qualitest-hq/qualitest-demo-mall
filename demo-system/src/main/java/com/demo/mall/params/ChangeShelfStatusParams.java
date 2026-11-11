package com.demo.mall.params;

import lombok.Getter;
import lombok.Setter;

/**
 * 商品上下架参数
 */
@Getter
@Setter
public class ChangeShelfStatusParams {

    /** 商品ID */
    private Long productId;

    /** 上架状态：0下架 1上架 */
    private Integer shelfStatus;
}
