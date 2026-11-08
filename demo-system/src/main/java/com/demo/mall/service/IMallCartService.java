package com.demo.mall.service;

import java.util.List;
import com.demo.mall.domain.MallCart;
import com.demo.mall.params.MallCartParams;
import com.demo.mall.apiParams.MallCartAddApiParams;
import com.demo.mall.apiParams.MallCartApiParams;
import com.demo.mall.apiParams.MallCartQuantityApiParams;
import com.demo.mall.apiParams.MallCartSelectedApiParams;
import com.demo.mall.result.MallCartResult;
import com.demo.mall.apiResult.MallCartApiResult;

/**
 * 商城购物车Service接口
 * 
 * @author demo
 * @date 2026-06-20
 */
public interface IMallCartService {
    /**
     * 查询商城购物车列表
     *
     * @param mallCart 商城购物车
     * @return 商城购物车集合
     */
    List<MallCart> selectMallCartList(MallCart mallCart);

    /**
     * 查询商城购物车
     *
     * @param cartId 商城购物车主键
     * @return 商城购物车
     */
    MallCart selectMallCartById(Long cartId);

    /**
     * 查询商城购物车Result列表
     *
     * @param params 商城购物车Params
     * @return 商城购物车Result集合
     */
    List<MallCartResult> selectMallCartResultList(MallCartParams params);

    /**
     * 获取商城购物车详细信息
     *
     * @param cartId 商城购物车主键
     * @return 商城购物车Result
     */
    MallCartResult selectMallCartResult(Long cartId);

    /**
     * 查询客户端购物车列表，并填充是否可结算
     */
    List<MallCartApiResult> selectMallCartApiResultList(MallCartApiParams params);

    /**
     * 获取商城购物车ApiResult详细信息（客户端）
     *
     * @param cartId 商城购物车主键
     * @return 商城购物车ApiResult
     */
    MallCartApiResult selectMallCartApiResult(Long cartId);

    /**
     * 新增商城购物车
     * 
     * @param mallCart 商城购物车
     * @return 结果
     */
    int insertMallCart(MallCart mallCart);

    /**
     * 修改商城购物车
     * 
     * @param mallCart 商城购物车
     * @return 结果
     */
    int updateMallCart(MallCart mallCart);

    /**
     * 批量删除商城购物车
     * 
     * @param cartIdList 需要删除的商城购物车主键集合
     * @return 结果
     */
    int deleteMallCartByIdList(List<Long> cartIdList);

    /**
     * 删除商城购物车信息
     * 
     * @param cartId 商城购物车主键
     * @return 结果
     */
    public int deleteMallCartById(Long cartId);

    /**
     * 修改商城购物车为逻辑删除
     *
     * @param cartId 商城购物车ID
     * @return 结果
     */
    int logicDeleteMallCartById(Long cartId);

    /**
     * 批量修改商城购物车为逻辑删除
     *
     * @param cartIdList 商城购物车ID集合
     * @return 结果
     */
    int logicDeleteMallCartByIdList(List<Long> cartIdList);

    /**
     * 查询商城购物车数量
     *
     * @param params 商城购物车Params
     * @return 数量
     */
    int selectMallCartCount(MallCartParams params);

    /**
     * 按条件查询单条商城购物车
     *
     * @param params 商城购物车Params
     * @return 商城购物车
     */
    MallCart selectMallCartOne(MallCartParams params);

    /**
     * 加入购物车：校验可售；同账号同 SKU 累加数量并默认勾选
     */
    void addMallCartItem(Long accountId, MallCartAddApiParams params);

    /**
     * 修改购物车数量：数量为 0 时逻辑删除该行，否则校验可售后更新
     */
    void updateMallCartQuantity(Long accountId, MallCartQuantityApiParams params);

    /**
     * 批量更新购物车行勾选状态
     */
    void updateMallCartSelected(Long accountId, MallCartSelectedApiParams params);

    /**
     * 批量逻辑删除购物车行（逐行校验归属）
     */
    void deleteMallCartItems(Long accountId, List<Long> cartIds);

    /**
     * 逻辑删除当前账号全部购物车行
     */
    void clearMallCartByAccountId(Long accountId);
}
