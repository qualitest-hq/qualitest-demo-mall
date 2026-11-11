package com.demo.web.apiController.merchant;

import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.merchant.apiParams.MerchantApplySubmitApiParams;
import com.demo.merchant.apiResult.MerchantApplyApiResult;
import com.demo.merchant.service.IMerchantApplyService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商家申请客户端 API
 *
 * @api.group 客户端.商家.申请
 *
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/api/merchant/merchantApply")
@AllArgsConstructor
public class MerchantApplyApiController extends ApiController {

    private final IMerchantApplyService merchantApplyService;

    /**
     * 提交入驻申请
     *
     * @api.group 客户端.商家.申请
     */
    @PostMapping("/my/settle")
    public R<MerchantApplyApiResult> submitSettle(@RequestBody MerchantApplySubmitApiParams params) {
        return ok(merchantApplyService.submitSettleApply(getAccountId(), params));
    }

    /**
     * 最新入驻申请进度
     *
     * @api.group 客户端.商家.申请
     */
    @GetMapping("/my/settle/latest")
    public R<MerchantApplyApiResult> latestSettle() {
        return ok(merchantApplyService.latestSettleApply(getAccountId()));
    }

    /**
     * 提交资料变更申请
     *
     * @api.group 客户端.商家.申请
     */
    @PostMapping("/my/profile")
    public R<MerchantApplyApiResult> submitProfile(@RequestBody MerchantApplySubmitApiParams params) {
        return ok(merchantApplyService.submitProfileApply(getAccountId(), params));
    }

    /**
     * 最新资料变更申请
     *
     * @api.group 客户端.商家.申请
     */
    @GetMapping("/my/profile/latest")
    public R<MerchantApplyApiResult> latestProfile() {
        return ok(merchantApplyService.latestProfileApply(getAccountId()));
    }

    /**
     * 撤销待审申请
     *
     * @api.group 客户端.商家.申请
     */
    @PutMapping("/my/{applyId}/withdraw")
    public R<Void> withdraw(@PathVariable("applyId") Long applyId) {
        merchantApplyService.withdrawApply(getAccountId(), applyId);
        return ok();
    }
}
