package com.demo.coupon.support;

import com.demo.common.utils.StringUtils;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * 优惠券适用范围匹配工具
 */
public final class CouponScopeSupport {

    private CouponScopeSupport() {
    }

    /**
     * 判断订单商品是否可用该券。
     * scopeType：0 全场；1 指定分类（任一分类命中即可）；2 指定商品（任一商品命中即可）。
     *
     * @param scopeType    适用范围类型
     * @param scopeIds     逗号分隔的目标 ID
     * @param productIds   订单商品 ID 集合
     * @param categoryIds  订单商品分类 ID 集合
     * @return 是否匹配
     */
    public static boolean matches(Integer scopeType, String scopeIds,
                                  Collection<Long> productIds, Collection<Long> categoryIds) {
        int type = scopeType == null ? 0 : scopeType;
        if (type == 0) {
            return true;
        }
        Set<Long> ids = parseIds(scopeIds);
        if (ids.isEmpty()) {
            return false;
        }
        if (type == 1) {
            return categoryIds != null && categoryIds.stream().anyMatch(ids::contains);
        }
        if (type == 2) {
            return productIds != null && productIds.stream().anyMatch(ids::contains);
        }
        return true;
    }

    /**
     * 将逗号分隔的 ID 字符串解析为 Long 集合，非法片段跳过
     */
    public static Set<Long> parseIds(String scopeIds) {
        if (StringUtils.isEmpty(scopeIds)) {
            return Collections.emptySet();
        }
        Set<Long> ids = new HashSet<>();
        for (String part : scopeIds.split(",")) {
            String trimmed = part == null ? "" : part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            try {
                ids.add(Long.parseLong(trimmed));
            } catch (NumberFormatException ignored) {
                // 跳过非法片段
            }
        }
        return ids;
    }
}
