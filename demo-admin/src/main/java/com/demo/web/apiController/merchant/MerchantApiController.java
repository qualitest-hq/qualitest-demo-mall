package com.demo.web.apiController.merchant;

import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.common.exception.ServiceException;
import com.demo.merchant.apiResult.MerchantApiResult;
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.params.MerchantParams;
import com.demo.merchant.service.IMerchantService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商家客户端 API（只读生效店铺；开店/改资料走申请）
 *
 * @api.group 客户端.商家.店铺
 *
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/api/merchant/merchant")
@AllArgsConstructor
public class MerchantApiController extends ApiController {

    private final IMerchantService merchantService;

    /**
     * 当前账号的生效店铺
     *
     * @api.group 客户端.商家.店铺
     */
    @GetMapping("/my")
    public R<MerchantApiResult> my() {
        Long accountId = getAccountId();
        Merchant merchant = merchantService.selectMerchantOne(MerchantParams.builder().accountId(accountId).build());
        if (merchant == null) {
            return ok(null);
        }
        return ok(merchantService.selectMerchantApiResult(merchant.getMerchantId()));
    }

    /**
     * 店铺详情（公开可读生效店）
     *
     * @api.group 客户端.商家.店铺
     */
    @GetMapping("/{merchantId}")
    public R<MerchantApiResult> getInfo(@PathVariable("merchantId") Long merchantId) {
        MerchantApiResult result = merchantService.selectMerchantApiResult(merchantId);
        if (result == null) {
            throw new ServiceException("商家不存在");
        }
        return ok(result);
    }
}
