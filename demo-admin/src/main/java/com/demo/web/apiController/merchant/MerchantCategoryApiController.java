package com.demo.web.apiController.merchant;

import com.demo.common.annotation.Anonymous;
import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.merchant.apiParams.MerchantCategoryApiParams;
import com.demo.merchant.apiResult.MerchantCategoryApiResult;
import com.demo.merchant.service.IMerchantCategoryService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 商家经营类目客户端 API
 *
 * @api.group 客户端.商家.经营类目
 *
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/api/merchant/merchantCategory")
@AllArgsConstructor
public class MerchantCategoryApiController extends ApiController {

    private final IMerchantCategoryService merchantCategoryService;

    /**
     * 启用经营类目列表
     *
     * @api.group 客户端.商家.经营类目
     */
    @Anonymous
    @GetMapping("/enabled")
    public R<List<MerchantCategoryApiResult>> enabled() {
        MerchantCategoryApiParams params = new MerchantCategoryApiParams();
        params.setStatus(0);
        return ok(merchantCategoryService.selectMerchantCategoryApiResultList(params));
    }
}
