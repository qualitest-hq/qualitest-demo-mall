package com.demo.merchant.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.params.MerchantParams;
import com.demo.merchant.apiParams.MerchantApiParams;
import com.demo.merchant.result.MerchantResult;
import com.demo.merchant.apiResult.MerchantApiResult;

/**
 * 商家Mapper接口
 * 
 * @author demo
 * @date 2026-11-11
 */
@Mapper
public interface MerchantMapper {
    /**
     * 查询商家列表
     *
     * @param merchant 商家
     * @return 商家集合
     */
    List<Merchant> selectMerchantList(Merchant merchant);

    /**
     * 查询商家
     *
     * @param merchantId 商家主键
     * @return 商家
     */
    Merchant selectMerchantById(Long merchantId);

    /**
     * 查询商家Result列表
     *
     * @param params 商家Params
     * @return 商家Result集合
     */
    List<MerchantResult> selectMerchantResultList(MerchantParams params);

    /**
     * 获取商家详细信息
     *
     * @param merchantId 商家主键
     * @return 商家Result
     */
    MerchantResult selectMerchantResult(Long merchantId);

    /**
     * 查询商家ApiResult列表（客户端）
     *
     * @param params 商家ApiParams
     * @return 商家ApiResult集合
     */
    List<MerchantApiResult> selectMerchantApiResultList(MerchantApiParams params);

    /**
     * 获取商家ApiResult详细信息（客户端）
     *
     * @param merchantId 商家主键
     * @return 商家ApiResult
     */
    MerchantApiResult selectMerchantApiResult(Long merchantId);

    /**
     * 查询商家数量
     *
     * @param params 商家Params
     * @return 数量
     */
    int selectMerchantCount(MerchantParams params);

    /**
     * 按条件查询单条商家
     *
     * @param params 商家Params
     * @return 商家
     */
    Merchant selectMerchantOne(MerchantParams params);

    /**
     * 新增商家
     * 
     * @param merchant 商家
     * @return 结果
     */
    int insertMerchant(Merchant merchant);

    /**
     * 修改商家
     * 
     * @param merchant 商家
     * @return 结果
     */
    int updateMerchant(Merchant merchant);

    /**
     * 删除商家
     * 
     * @param merchantId 商家主键
     * @return 结果
     */
    int deleteMerchantById(Long merchantId);

    /**
     * 批量删除商家
     * 
     * @param merchantIdList 需要删除的数据主键集合
     * @return 结果
     */
    int deleteMerchantByIdList(@Param("list") List<Long> merchantIdList);

    /**
     * 逻辑删除商家
     * 
     * @param merchantId 商家主键
     * @return 结果
     */
    int logicDeleteMerchantById(Long merchantId);

    /**
     * 批量逻辑删除商家
     * 
     * @param merchantIdList 商家主键集合
     * @return 结果
     */
    int logicDeleteMerchantByIdList(@Param("list") List<Long> merchantIdList);
}
