package com.demo.common.validation;

import cn.hutool.core.util.PhoneUtil;
import com.demo.common.utils.StringUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 手机号格式校验器：空串视为通过，非空则按大陆号段校验
 */
public class MobileValidator implements ConstraintValidator<Mobile, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (StringUtils.isBlank(value)) {
            return true;
        }
        return PhoneUtil.isMobile(value.trim());
    }
}
