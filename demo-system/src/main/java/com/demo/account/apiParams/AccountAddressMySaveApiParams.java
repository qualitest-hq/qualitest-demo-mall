package com.demo.account.apiParams;

import com.demo.common.validation.Mobile;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;

/**
 * 客户端收货地址保存 ApiParams
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("AccountAddressMySaveApiParams")
public class AccountAddressMySaveApiParams implements Serializable {

    /**
     * 地址 ID（修改时必填）
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long addressId;

    /**
     * 收货人姓名
     */
    private String receiverName;

    /** 收货人手机号 */
    @NotBlank(message = "收货人手机不能为空")
    @Mobile
    private String receiverPhone;

    /**
     * 省
     */
    private String province;

    /**
     * 市
     */
    private String city;

    /**
     * 区/县
     */
    private String district;

    /**
     * 详细地址
     */
    private String detailAddress;

    /**
     * 邮政编码
     */
    private String postalCode;

    /**
     * 是否默认（0否 1是）
     */
    private Integer isDefault;
}
