package com.demo.merchant.service.impl;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.demo.common.utils.SecurityUtils;
import java.util.List;
import java.util.Objects;
import com.demo.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.demo.merchant.mapper.MerchantMapper;
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.params.MerchantParams;
import com.demo.merchant.apiParams.MerchantApiParams;
import com.demo.merchant.result.MerchantResult;
import com.demo.merchant.apiResult.MerchantApiResult;
import com.demo.merchant.service.IMerchantService;
import org.springframework.transaction.annotation.Transactional;

/**
 * 商家Service业务层处理
 * 
 * @author demo
 * @date 2026-11-11
 */
@Service
public class MerchantServiceImpl implements IMerchantService {
    @Autowired
    private MerchantMapper merchantMapper;

    /**
     * 查询商家列表
     *
     * @param merchant 商家
     * @return 商家
     */
    @Override
    public List<Merchant> selectMerchantList(Merchant merchant) {
        return merchantMapper.selectMerchantList(merchant);
    }

    /**
     * 查询商家
     *
     * @param merchantId 商家主键
     * @return 商家
     */
    @Override
    public Merchant selectMerchantById(Long merchantId) {
        return merchantMapper.selectMerchantById(merchantId);
    }

    /**
     * 查询商家Result列表
     *
     * @param params 商家Params
     * @return 商家Result集合
     */
    @Override
    public List<MerchantResult> selectMerchantResultList(MerchantParams params) {
        return merchantMapper.selectMerchantResultList(params);
    }

    /**
     * 获取商家详细信息
     *
     * @param merchantId 商家主键
     * @return 商家Result
     */
    @Override
    public MerchantResult selectMerchantResult(Long merchantId) {
        return merchantMapper.selectMerchantResult(merchantId);
    }

    /**
     * 查询商家ApiResult列表（客户端）
     */
    @Override
    public List<MerchantApiResult> selectMerchantApiResultList(MerchantApiParams params) {
        return merchantMapper.selectMerchantApiResultList(params);
    }

    /**
     * 获取商家ApiResult详细信息（客户端）
     */
    @Override
    public MerchantApiResult selectMerchantApiResult(Long merchantId) {
        return merchantMapper.selectMerchantApiResult(merchantId);
    }

    /**
     * 新增商家
     *
     * @param merchant 商家
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertMerchant(Merchant merchant) {
        if (Objects.isNull(merchant.getMerchantId())) {
            merchant.setMerchantId(IdUtil.getSnowflakeNextId());
        }
        merchant.setCreateTime(DateUtils.getNowDate());
        return merchantMapper.insertMerchant(merchant);
    }

    /**
     * 修改商家
     *
     * @param merchant 商家
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateMerchant(Merchant merchant) {
        merchant.setUpdateTime(DateUtils.getNowDate());
        return merchantMapper.updateMerchant(merchant);
    }

    /**
     * 批量删除商家
     * 
     * @param merchantIdList 需要删除的商家主键集合
     * @return 结果
     */
    @Override
    public int deleteMerchantByIdList(List<Long> merchantIdList) {
        return merchantMapper.deleteMerchantByIdList(merchantIdList);
    }

    /**
     * 删除商家信息
     * 
     * @param merchantId 商家主键
     * @return 结果
     */
    @Override
    public int deleteMerchantById(Long merchantId) {
        return merchantMapper.deleteMerchantById(merchantId);
    }

    /**
     * 逻辑删除商家信息
     * 
     * @param merchantId 商家主键
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantById(Long merchantId) {
        return merchantMapper.logicDeleteMerchantById(merchantId);
    }

    /**
     * 批量逻辑删除商家信息
     * 
     * @param merchantIdList 商家主键集合
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantByIdList(List<Long> merchantIdList) {
        return merchantMapper.logicDeleteMerchantByIdList(merchantIdList);
    }

    /**
     * 查询商家数量
     *
     * @param params 商家Params
     * @return 数量
     */
    @Override
    public int selectMerchantCount(MerchantParams params) {
        return merchantMapper.selectMerchantCount(params);
    }

    /**
     * 按条件查询单条商家
     *
     * @param params 商家Params
     * @return 商家
     */
    @Override
    public Merchant selectMerchantOne(MerchantParams params) {
        return merchantMapper.selectMerchantOne(params);
    }
}
