package com.demo.mall.apiParams;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.List;

/** 购物车主键列表入参 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MallCartIdsApiParams implements Serializable {

    /** 购物车主键列表 */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private List<Long> cartIds;
}
