package com.demo.merchant.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.demo.merchant.domain.MerchantApply;
import com.demo.merchant.params.MerchantApplyParams;
import com.demo.merchant.apiParams.MerchantApplyApiParams;
import com.demo.merchant.result.MerchantApplyResult;
import com.demo.merchant.apiResult.MerchantApplyApiResult;

/**
 * 商家申请Mapper接口
 * 
 * @author demo
 * @date 2026-11-11
 */
@Mapper
public interface MerchantApplyMapper {
    /**
     * 查询商家申请列表
     *
     * @param merchantApply 商家申请
     * @return 商家申请集合
     */
    List<MerchantApply> selectMerchantApplyList(MerchantApply merchantApply);

    /**
     * 查询商家申请
     *
     * @param applyId 商家申请主键
     * @return 商家申请
     */
    MerchantApply selectMerchantApplyById(Long applyId);

    /**
     * 查询商家申请Result列表
     *
     * @param params 商家申请Params
     * @return 商家申请Result集合
     */
    List<MerchantApplyResult> selectMerchantApplyResultList(MerchantApplyParams params);

    /**
     * 获取商家申请详细信息
     *
     * @param applyId 商家申请主键
     * @return 商家申请Result
     */
    MerchantApplyResult selectMerchantApplyResult(Long applyId);

    /**
     * 查询商家申请ApiResult列表（客户端）
     *
     * @param params 商家申请ApiParams
     * @return 商家申请ApiResult集合
     */
    List<MerchantApplyApiResult> selectMerchantApplyApiResultList(MerchantApplyApiParams params);

    /**
     * 获取商家申请ApiResult详细信息（客户端）
     *
     * @param applyId 商家申请主键
     * @return 商家申请ApiResult
     */
    MerchantApplyApiResult selectMerchantApplyApiResult(Long applyId);

    /**
     * 查询商家申请数量
     *
     * @param params 商家申请Params
     * @return 数量
     */
    int selectMerchantApplyCount(MerchantApplyParams params);

    /**
     * 按条件查询单条商家申请
     *
     * @param params 商家申请Params
     * @return 商家申请
     */
    MerchantApply selectMerchantApplyOne(MerchantApplyParams params);

    /**
     * 新增商家申请
     * 
     * @param merchantApply 商家申请
     * @return 结果
     */
    int insertMerchantApply(MerchantApply merchantApply);

    /**
     * 修改商家申请
     * 
     * @param merchantApply 商家申请
     * @return 结果
     */
    int updateMerchantApply(MerchantApply merchantApply);

    /**
     * 删除商家申请
     * 
     * @param applyId 商家申请主键
     * @return 结果
     */
    int deleteMerchantApplyById(Long applyId);

    /**
     * 批量删除商家申请
     * 
     * @param applyIdList 需要删除的数据主键集合
     * @return 结果
     */
    int deleteMerchantApplyByIdList(@Param("list") List<Long> applyIdList);

    /**
     * 逻辑删除商家申请
     * 
     * @param applyId 商家申请主键
     * @return 结果
     */
    int logicDeleteMerchantApplyById(Long applyId);

    /**
     * 批量逻辑删除商家申请
     * 
     * @param applyIdList 商家申请主键集合
     * @return 结果
     */
    int logicDeleteMerchantApplyByIdList(@Param("list") List<Long> applyIdList);
}
