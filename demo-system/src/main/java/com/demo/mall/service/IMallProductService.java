package com.demo.mall.service;

import java.util.List;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.params.MallProductParams;
import com.demo.mall.apiParams.MallProductApiParams;
import com.demo.mall.apiParams.MallProductMerchantSaveApiParams;
import com.demo.mall.result.MallProductResult;
import com.demo.mall.apiResult.MallProductApiResult;

/**
 * 商城商品SPUService接口
 * 
 * @author demo
 * @date 2026-06-20
 */
public interface IMallProductService {
    /**
     * 查询商城商品SPU列表
     *
     * @param mallProduct 商城商品SPU
     * @return 商城商品SPU集合
     */
    List<MallProduct> selectMallProductList(MallProduct mallProduct);

    /**
     * 查询商城商品SPU
     *
     * @param productId 商城商品SPU主键
     * @return 商城商品SPU
     */
    MallProduct selectMallProductById(Long productId);

    /**
     * 查询商城商品SPUResult列表
     *
     * @param params 商城商品SPUParams
     * @return 商城商品SPUResult集合
     */
    List<MallProductResult> selectMallProductResultList(MallProductParams params);

    /**
     * 获取商城商品SPU详细信息
     *
     * @param productId 商城商品SPU主键
     * @return 商城商品SPUResult
     */
    MallProductResult selectMallProductResult(Long productId);

    /**
     * 查询已上架且所属店铺有效的商品列表
     *
     * @param params 查询条件
     * @return 商品集合
     */
    List<MallProductApiResult> selectMallProductApiResultList(MallProductApiParams params);

    /**
     * 查询已上架且所属店铺有效的商品详情，并填充 SKU
     *
     * @param productId 商品ID
     * @return 商品详情
     */
    MallProductApiResult selectMallProductApiResult(Long productId);

    /**
     * 新增商品；须指定商家且店铺未停用
     *
     * @param mallProduct 商品
     * @return 影响行数
     */
    int insertMallProduct(MallProduct mallProduct);

    /**
     * 修改商品；若传入商家ID则校验店铺未停用
     *
     * @param mallProduct 商品
     * @return 影响行数
     */
    int updateMallProduct(MallProduct mallProduct);

    /**
     * 批量删除商城商品SPU
     * 
     * @param productIdList 需要删除的商城商品SPU主键集合
     * @return 结果
     */
    int deleteMallProductByIdList(List<Long> productIdList);

    /**
     * 删除商城商品SPU信息
     * 
     * @param productId 商城商品SPU主键
     * @return 结果
     */
    public int deleteMallProductById(Long productId);

    /**
     * 修改商城商品SPU为逻辑删除
     *
     * @param productId 商城商品SPUID
     * @return 结果
     */
    int logicDeleteMallProductById(Long productId);

    /**
     * 批量修改商城商品SPU为逻辑删除
     *
     * @param productIdList 商城商品SPUID集合
     * @return 结果
     */
    int logicDeleteMallProductByIdList(List<Long> productIdList);

    /**
     * 查询商城商品SPU数量
     *
     * @param params 商城商品SPUParams
     * @return 数量
     */
    int selectMallProductCount(MallProductParams params);

    /**
     * 按条件查询单条商城商品SPU
     *
     * @param params 商城商品SPUParams
     * @return 商城商品SPU
     */
    MallProduct selectMallProductOne(MallProductParams params);

    /**
     * 切换商品上架/下架；上架时要求所属店铺未停用
     *
     * @param productId   商品ID
     * @param shelfStatus 上架状态（0下架 1上架）
     */
    void changeMallProductShelfStatus(Long productId, Integer shelfStatus);

    /**
     * 查询当前账号本店商品列表（含下架）
     *
     * @param accountId 账号ID
     * @param params    查询条件，商家ID由服务端写入
     * @return 本店商品集合
     */
    List<MallProductApiResult> selectMerchantProductList(Long accountId, MallProductApiParams params);

    /**
     * 查询当前账号本店商品详情，并填充 SKU
     *
     * @param accountId 账号ID
     * @param productId 商品ID
     * @return 本店商品详情
     */
    MallProductApiResult selectMerchantProductDetail(Long accountId, Long productId);

    /**
     * 新建本店商品，同时写入 SPU 与 SKU
     *
     * @param accountId 账号ID
     * @param params    保存入参
     * @return 新建后的商品详情
     */
    MallProductApiResult createMerchantProduct(Long accountId, MallProductMerchantSaveApiParams params);

    /**
     * 更新本店商品，同时覆盖保存 SKU
     *
     * @param accountId 账号ID
     * @param params    保存入参
     * @return 更新后的商品详情
     */
    MallProductApiResult updateMerchantProduct(Long accountId, MallProductMerchantSaveApiParams params);

    /**
     * 对本店商品执行上下架
     *
     * @param accountId   账号ID
     * @param productId   商品ID
     * @param shelfStatus 上架状态（0下架 1上架）
     */
    void changeMerchantProductShelfStatus(Long accountId, Long productId, Integer shelfStatus);

    /**
     * 统计当前账号本店在售商品数量
     *
     * @param accountId 账号ID
     * @return 在售数量
     */
    int countMerchantOnsaleProduct(Long accountId);
}
