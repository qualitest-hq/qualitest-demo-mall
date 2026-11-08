package com.demo.web.apiController.mall;

import com.demo.mall.apiParams.MallCartAddApiParams;
import com.demo.mall.apiParams.MallCartApiParams;
import com.demo.mall.apiParams.MallCartIdsApiParams;
import com.demo.mall.apiParams.MallCartQuantityApiParams;
import com.demo.mall.apiParams.MallCartSelectedApiParams;
import com.demo.mall.apiResult.MallCartApiResult;
import com.demo.mall.service.IMallCartService;
import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 商城购物车客户端 API
 *
 * @author demo
 * @api.group 客户端.商城.购物车
 * @date 2026-06-20
 */
@RestController
@RequestMapping("/api/mall/mallCart")
@AllArgsConstructor
public class MallCartApiController extends ApiController {

    private final IMallCartService mallCartService;

    /**
     * 查询当前账号购物车
     */
    @GetMapping("/my")
    public R<List<MallCartApiResult>> myList() {
        Long accountId = getAccountId();
        MallCartApiParams params = new MallCartApiParams();
        params.setAccountId(accountId);
        return ok(mallCartService.selectMallCartApiResultList(params));
    }

    /**
     * 加入购物车
     */
    @PostMapping("/my")
    public R<Void> myAdd(@RequestBody MallCartAddApiParams params) {
        Long accountId = getAccountId();
        mallCartService.addMallCartItem(accountId, params);
        return ok();
    }

    /**
     * 修改购物车数量，数量为0时删除该行
     */
    @PutMapping("/my/quantity")
    public R<Void> myUpdateQuantity(@RequestBody MallCartQuantityApiParams params) {
        Long accountId = getAccountId();
        mallCartService.updateMallCartQuantity(accountId, params);
        return ok();
    }

    /**
     * 批量勾选或取消勾选
     */
    @PutMapping("/my/selected")
    public R<Void> myUpdateSelected(@RequestBody MallCartSelectedApiParams params) {
        Long accountId = getAccountId();
        mallCartService.updateMallCartSelected(accountId, params);
        return ok();
    }

    /**
     * 清空当前账号购物车
     */
    @DeleteMapping("/my/clear")
    public R<Void> myClear() {
        Long accountId = getAccountId();
        mallCartService.clearMallCartByAccountId(accountId);
        return ok();
    }

    /** 批量删除购物车行 */
    @DeleteMapping("/my/batch")
    public R<Void> myRemoveBatch(@RequestBody MallCartIdsApiParams params) {
        Long accountId = getAccountId();
        mallCartService.deleteMallCartItems(accountId, params == null ? null : params.getCartIds());
        return ok();
    }
}
