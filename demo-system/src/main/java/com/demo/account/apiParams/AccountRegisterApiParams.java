package com.demo.account.apiParams;

import com.demo.common.validation.Mobile;
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
 * 客户端账号注册 ApiParams
 *
 * @author demo
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("AccountRegisterApiParams")
public class AccountRegisterApiParams implements Serializable {

    /** 注册手机号 */
    @NotBlank(message = "手机号不能为空")
    @Mobile
    private String mobile;

    /** 密码 */
    @NotBlank(message = "密码不能为空")
    private String password;

    /** 昵称（可选） */
    private String nickName;
}
