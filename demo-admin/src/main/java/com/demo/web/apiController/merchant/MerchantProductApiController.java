package com.demo.web.apiController.merchant;

import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.common.core.page.TableData;
import com.demo.mall.apiParams.ChangeShelfStatusApiParams;
import com.demo.mall.apiParams.MallProductApiParams;
import com.demo.mall.apiParams.MallProductMerchantSaveApiParams;
import com.demo.mall.apiResult.MallProductApiResult;
import com.demo.mall.service.IMallProductService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商家本店商品接口
 *
 * @api.group 客户端.商家.商品
 *
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/api/merchant/mallProduct")
@AllArgsConstructor
public class MerchantProductApiController extends ApiController {

    private final IMallProductService mallProductService;

    /** 本店商品分页列表 */
    @GetMapping("/my/list")
    public R<TableData<MallProductApiResult>> myList(MallProductApiParams params) {
        startPage();
        List<MallProductApiResult> list = mallProductService.selectMerchantProductList(getAccountId(), params);
        return getTableData(list);
    }

    /** 本店在售商品数量 */
    @GetMapping("/my/onsaleCount")
    public R<Map<String, Integer>> onsaleCount() {
        Map<String, Integer> data = new HashMap<>(2);
        data.put("count", mallProductService.countMerchantOnsaleProduct(getAccountId()));
        return ok(data);
    }

    /** 本店商品详情 */
    @GetMapping("/my/{productId}")
    public R<MallProductApiResult> myDetail(@PathVariable("productId") Long productId) {
        return ok(mallProductService.selectMerchantProductDetail(getAccountId(), productId));
    }

    /** 新建本店商品 */
    @PostMapping("/my")
    public R<MallProductApiResult> create(@RequestBody MallProductMerchantSaveApiParams params) {
        return ok(mallProductService.createMerchantProduct(getAccountId(), params));
    }

    /** 更新本店商品 */
    @PutMapping("/my")
    public R<MallProductApiResult> update(@RequestBody MallProductMerchantSaveApiParams params) {
        return ok(mallProductService.updateMerchantProduct(getAccountId(), params));
    }

    /** 本店商品上下架 */
    @PutMapping("/my/changeShelfStatus")
    public R<Void> changeShelfStatus(@RequestBody ChangeShelfStatusApiParams params) {
        mallProductService.changeMerchantProductShelfStatus(
                getAccountId(), params.getProductId(), params.getShelfStatus());
        return ok();
    }
}
