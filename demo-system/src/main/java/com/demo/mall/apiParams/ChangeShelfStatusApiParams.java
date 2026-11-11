package com.demo.mall.apiParams;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

/**
 * 商品上下架入参
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
@Alias("ChangeShelfStatusApiParams")
public class ChangeShelfStatusApiParams implements Serializable {

    /** 商品ID */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long productId;

    /** 上架状态：0下架 1上架 */
    private Integer shelfStatus;
}
