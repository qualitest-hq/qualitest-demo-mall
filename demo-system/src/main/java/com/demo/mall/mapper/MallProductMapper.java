package com.demo.mall.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.params.MallProductParams;
import com.demo.mall.apiParams.MallProductApiParams;
import com.demo.mall.result.MallProductResult;
import com.demo.mall.apiResult.MallProductApiResult;

/**
 * 商城商品SPUMapper接口
 * 
 * @author demo
 * @date 2026-06-20
 */
@Mapper
public interface MallProductMapper {
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
     * 查询已上架且所属店铺有效的商品详情
     *
     * @param productId 商品ID
     * @return 商品详情
     */
    MallProductApiResult selectMallProductApiResult(Long productId);

    /**
     * 按商家ID查询本店商品列表（含下架）
     *
     * @param params 查询条件，须带商家ID
     * @return 本店商品集合
     */
    List<MallProductApiResult> selectMallProductMerchantApiResultList(MallProductApiParams params);

    /**
     * 按商品ID与商家ID查询本店商品详情
     *
     * @param productId  商品ID
     * @param merchantId 商家ID
     * @return 本店商品详情，不存在或不属于该店时返回 null
     */
    MallProductApiResult selectMallProductMerchantApiResult(@Param("productId") Long productId,
                                                           @Param("merchantId") Long merchantId);

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
     * 新增商城商品SPU
     * 
     * @param mallProduct 商城商品SPU
     * @return 结果
     */
    int insertMallProduct(MallProduct mallProduct);

    /**
     * 修改商城商品SPU
     * 
     * @param mallProduct 商城商品SPU
     * @return 结果
     */
    int updateMallProduct(MallProduct mallProduct);

    /**
     * 删除商城商品SPU
     * 
     * @param productId 商城商品SPU主键
     * @return 结果
     */
    int deleteMallProductById(Long productId);

    /**
     * 批量删除商城商品SPU
     * 
     * @param productIdList 需要删除的数据主键集合
     * @return 结果
     */
    int deleteMallProductByIdList(@Param("list") List<Long> productIdList);

    /**
     * 逻辑删除商城商品SPU
     * 
     * @param productId 商城商品SPU主键
     * @return 结果
     */
    int logicDeleteMallProductById(Long productId);

    /**
     * 批量逻辑删除商城商品SPU
     * 
     * @param productIdList 商城商品SPU主键集合
     * @return 结果
     */
    int logicDeleteMallProductByIdList(@Param("list") List<Long> productIdList);
}
