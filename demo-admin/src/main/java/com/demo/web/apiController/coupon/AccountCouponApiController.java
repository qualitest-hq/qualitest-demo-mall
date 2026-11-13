package com.demo.web.apiController.coupon;

import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.common.core.page.TableData;
import com.demo.coupon.apiParams.AccountCouponApiParams;
import com.demo.coupon.apiResult.AccountCouponApiResult;
import com.demo.coupon.service.IAccountCouponService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

/**
 * 账号优惠券客户端 API
 *
 * @api.group 客户端.优惠券.用户优惠券
 *
 * @author demo
 * @date 2026-06-20
 */
@RestController
@RequestMapping("/api/coupon/accountCoupon")
@AllArgsConstructor
public class AccountCouponApiController extends ApiController {

    private final IAccountCouponService accountCouponService;

    /**
     * 分页查询我的优惠券，可按使用状态或是否过期筛选
     */
    @GetMapping("/my")
    public R<TableData<AccountCouponApiResult>> myList(AccountCouponApiParams params) {
        Long accountId = getAccountId();
        if (params == null) {
            params = new AccountCouponApiParams();
        }
        params.setAccountId(accountId);
        startPage();
        List<AccountCouponApiResult> list = accountCouponService.selectAccountCouponApiResultList(params);
        return getTableData(list);
    }

    /**
     * 查询当前订单可用券；可按商品、分类进一步过滤适用范围
     */
    @GetMapping("/my/available")
    public R<List<AccountCouponApiResult>> myAvailable(
            @RequestParam("orderAmount") BigDecimal orderAmount,
            @RequestParam(value = "productIds", required = false) List<Long> productIds,
            @RequestParam(value = "categoryIds", required = false) List<Long> categoryIds) {
        Long accountId = getAccountId();
        AccountCouponApiParams params = new AccountCouponApiParams();
        params.setAccountId(accountId);
        params.setOrderAmount(orderAmount != null ? orderAmount : BigDecimal.ZERO);
        params.setProductIds(productIds);
        params.setCategoryIds(categoryIds);
        return ok(accountCouponService.selectAccountCouponApiResultList(params));
    }
}
