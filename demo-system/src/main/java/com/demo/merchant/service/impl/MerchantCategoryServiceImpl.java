package com.demo.merchant.service.impl;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.demo.common.utils.SecurityUtils;
import java.util.List;
import java.util.Objects;
import com.demo.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.demo.merchant.mapper.MerchantCategoryMapper;
import com.demo.merchant.domain.MerchantCategory;
import com.demo.merchant.params.MerchantCategoryParams;
import com.demo.merchant.apiParams.MerchantCategoryApiParams;
import com.demo.merchant.result.MerchantCategoryResult;
import com.demo.merchant.apiResult.MerchantCategoryApiResult;
import com.demo.merchant.service.IMerchantCategoryService;
import org.springframework.transaction.annotation.Transactional;

/**
 * 商家经营类目Service业务层处理
 * 
 * @author demo
 * @date 2026-11-11
 */
@Service
public class MerchantCategoryServiceImpl implements IMerchantCategoryService {
    @Autowired
    private MerchantCategoryMapper merchantCategoryMapper;

    /**
     * 查询商家经营类目列表
     *
     * @param merchantCategory 商家经营类目
     * @return 商家经营类目
     */
    @Override
    public List<MerchantCategory> selectMerchantCategoryList(MerchantCategory merchantCategory) {
        return merchantCategoryMapper.selectMerchantCategoryList(merchantCategory);
    }

    /**
     * 查询商家经营类目
     *
     * @param categoryId 商家经营类目主键
     * @return 商家经营类目
     */
    @Override
    public MerchantCategory selectMerchantCategoryById(Long categoryId) {
        return merchantCategoryMapper.selectMerchantCategoryById(categoryId);
    }

    /**
     * 查询商家经营类目Result列表
     *
     * @param params 商家经营类目Params
     * @return 商家经营类目Result集合
     */
    @Override
    public List<MerchantCategoryResult> selectMerchantCategoryResultList(MerchantCategoryParams params) {
        return merchantCategoryMapper.selectMerchantCategoryResultList(params);
    }

    /**
     * 获取商家经营类目详细信息
     *
     * @param categoryId 商家经营类目主键
     * @return 商家经营类目Result
     */
    @Override
    public MerchantCategoryResult selectMerchantCategoryResult(Long categoryId) {
        return merchantCategoryMapper.selectMerchantCategoryResult(categoryId);
    }

    /**
     * 查询商家经营类目ApiResult列表（客户端）
     */
    @Override
    public List<MerchantCategoryApiResult> selectMerchantCategoryApiResultList(MerchantCategoryApiParams params) {
        return merchantCategoryMapper.selectMerchantCategoryApiResultList(params);
    }

    /**
     * 获取商家经营类目ApiResult详细信息（客户端）
     */
    @Override
    public MerchantCategoryApiResult selectMerchantCategoryApiResult(Long categoryId) {
        return merchantCategoryMapper.selectMerchantCategoryApiResult(categoryId);
    }

    /**
     * 新增商家经营类目
     *
     * @param merchantCategory 商家经营类目
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertMerchantCategory(MerchantCategory merchantCategory) {
        if (Objects.isNull(merchantCategory.getCategoryId())) {
            merchantCategory.setCategoryId(IdUtil.getSnowflakeNextId());
        }
        merchantCategory.setCreateTime(DateUtils.getNowDate());
        return merchantCategoryMapper.insertMerchantCategory(merchantCategory);
    }

    /**
     * 修改商家经营类目
     *
     * @param merchantCategory 商家经营类目
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateMerchantCategory(MerchantCategory merchantCategory) {
        merchantCategory.setUpdateTime(DateUtils.getNowDate());
        return merchantCategoryMapper.updateMerchantCategory(merchantCategory);
    }

    /**
     * 批量删除商家经营类目
     * 
     * @param categoryIdList 需要删除的商家经营类目主键集合
     * @return 结果
     */
    @Override
    public int deleteMerchantCategoryByIdList(List<Long> categoryIdList) {
        return merchantCategoryMapper.deleteMerchantCategoryByIdList(categoryIdList);
    }

    /**
     * 删除商家经营类目信息
     * 
     * @param categoryId 商家经营类目主键
     * @return 结果
     */
    @Override
    public int deleteMerchantCategoryById(Long categoryId) {
        return merchantCategoryMapper.deleteMerchantCategoryById(categoryId);
    }

    /**
     * 逻辑删除商家经营类目信息
     * 
     * @param categoryId 商家经营类目主键
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantCategoryById(Long categoryId) {
        return merchantCategoryMapper.logicDeleteMerchantCategoryById(categoryId);
    }

    /**
     * 批量逻辑删除商家经营类目信息
     * 
     * @param categoryIdList 商家经营类目主键集合
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantCategoryByIdList(List<Long> categoryIdList) {
        return merchantCategoryMapper.logicDeleteMerchantCategoryByIdList(categoryIdList);
    }

    /**
     * 查询商家经营类目数量
     *
     * @param params 商家经营类目Params
     * @return 数量
     */
    @Override
    public int selectMerchantCategoryCount(MerchantCategoryParams params) {
        return merchantCategoryMapper.selectMerchantCategoryCount(params);
    }

    /**
     * 按条件查询单条商家经营类目
     *
     * @param params 商家经营类目Params
     * @return 商家经营类目
     */
    @Override
    public MerchantCategory selectMerchantCategoryOne(MerchantCategoryParams params) {
        return merchantCategoryMapper.selectMerchantCategoryOne(params);
    }
}
