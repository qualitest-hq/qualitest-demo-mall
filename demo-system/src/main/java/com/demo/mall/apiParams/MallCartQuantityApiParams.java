package com.demo.mall.apiParams;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/** 修改购物车数量入参 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MallCartQuantityApiParams implements Serializable {

    /** 购物车主键 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long cartId;

    /** 数量，传0删除该行 */
    private Integer quantity;
}
