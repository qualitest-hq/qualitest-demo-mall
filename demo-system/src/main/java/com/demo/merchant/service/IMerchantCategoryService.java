package com.demo.merchant.service;

import java.util.List;
import com.demo.merchant.domain.MerchantCategory;
import com.demo.merchant.params.MerchantCategoryParams;
import com.demo.merchant.apiParams.MerchantCategoryApiParams;
import com.demo.merchant.result.MerchantCategoryResult;
import com.demo.merchant.apiResult.MerchantCategoryApiResult;

/**
 * 商家经营类目Service接口
 * 
 * @author demo
 * @date 2026-11-11
 */
public interface IMerchantCategoryService {
    /**
     * 查询商家经营类目列表
     *
     * @param merchantCategory 商家经营类目
     * @return 商家经营类目集合
     */
    List<MerchantCategory> selectMerchantCategoryList(MerchantCategory merchantCategory);

    /**
     * 查询商家经营类目
     *
     * @param categoryId 商家经营类目主键
     * @return 商家经营类目
     */
    MerchantCategory selectMerchantCategoryById(Long categoryId);

    /**
     * 查询商家经营类目Result列表
     *
     * @param params 商家经营类目Params
     * @return 商家经营类目Result集合
     */
    List<MerchantCategoryResult> selectMerchantCategoryResultList(MerchantCategoryParams params);

    /**
     * 获取商家经营类目详细信息
     *
     * @param categoryId 商家经营类目主键
     * @return 商家经营类目Result
     */
    MerchantCategoryResult selectMerchantCategoryResult(Long categoryId);

    /**
     * 查询商家经营类目ApiResult列表（客户端）
     *
     * @param params 商家经营类目ApiParams
     * @return 商家经营类目ApiResult集合
     */
    List<MerchantCategoryApiResult> selectMerchantCategoryApiResultList(MerchantCategoryApiParams params);

    /**
     * 获取商家经营类目ApiResult详细信息（客户端）
     *
     * @param categoryId 商家经营类目主键
     * @return 商家经营类目ApiResult
     */
    MerchantCategoryApiResult selectMerchantCategoryApiResult(Long categoryId);

    /**
     * 新增商家经营类目
     * 
     * @param merchantCategory 商家经营类目
     * @return 结果
     */
    int insertMerchantCategory(MerchantCategory merchantCategory);

    /**
     * 修改商家经营类目
     * 
     * @param merchantCategory 商家经营类目
     * @return 结果
     */
    int updateMerchantCategory(MerchantCategory merchantCategory);

    /**
     * 批量删除商家经营类目
     * 
     * @param categoryIdList 需要删除的商家经营类目主键集合
     * @return 结果
     */
    int deleteMerchantCategoryByIdList(List<Long> categoryIdList);

    /**
     * 删除商家经营类目信息
     * 
     * @param categoryId 商家经营类目主键
     * @return 结果
     */
    public int deleteMerchantCategoryById(Long categoryId);

    /**
     * 修改商家经营类目为逻辑删除
     *
     * @param categoryId 商家经营类目ID
     * @return 结果
     */
    int logicDeleteMerchantCategoryById(Long categoryId);

    /**
     * 批量修改商家经营类目为逻辑删除
     *
     * @param categoryIdList 商家经营类目ID集合
     * @return 结果
     */
    int logicDeleteMerchantCategoryByIdList(List<Long> categoryIdList);

    /**
     * 查询商家经营类目数量
     *
     * @param params 商家经营类目Params
     * @return 数量
     */
    int selectMerchantCategoryCount(MerchantCategoryParams params);

    /**
     * 按条件查询单条商家经营类目
     *
     * @param params 商家经营类目Params
     * @return 商家经营类目
     */
    MerchantCategory selectMerchantCategoryOne(MerchantCategoryParams params);
}
