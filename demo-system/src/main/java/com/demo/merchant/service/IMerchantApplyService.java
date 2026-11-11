package com.demo.merchant.service;

import java.util.List;
import com.demo.merchant.domain.MerchantApply;
import com.demo.merchant.params.MerchantApplyParams;
import com.demo.merchant.apiParams.MerchantApplyApiParams;
import com.demo.merchant.apiParams.MerchantApplySubmitApiParams;
import com.demo.merchant.result.MerchantApplyResult;
import com.demo.merchant.apiResult.MerchantApplyApiResult;

/**
 * 商家申请Service接口
 * 
 * @author demo
 * @date 2026-11-11
 */
public interface IMerchantApplyService {
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
     * 批量删除商家申请
     * 
     * @param applyIdList 需要删除的商家申请主键集合
     * @return 结果
     */
    int deleteMerchantApplyByIdList(List<Long> applyIdList);

    /**
     * 删除商家申请信息
     * 
     * @param applyId 商家申请主键
     * @return 结果
     */
    public int deleteMerchantApplyById(Long applyId);

    /**
     * 修改商家申请为逻辑删除
     *
     * @param applyId 商家申请ID
     * @return 结果
     */
    int logicDeleteMerchantApplyById(Long applyId);

    /**
     * 批量修改商家申请为逻辑删除
     *
     * @param applyIdList 商家申请ID集合
     * @return 结果
     */
    int logicDeleteMerchantApplyByIdList(List<Long> applyIdList);

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
     * 客户端提交入驻申请
     *
     * @param accountId 账号ID
     * @param params 申请资料
     * @return 申请结果
     */
    MerchantApplyApiResult submitSettleApply(Long accountId, MerchantApplySubmitApiParams params);

    /**
     * 客户端提交资料变更申请
     *
     * @param accountId 账号ID
     * @param params 申请资料
     * @return 申请结果
     */
    MerchantApplyApiResult submitProfileApply(Long accountId, MerchantApplySubmitApiParams params);

    /**
     * 查询账号最新入驻申请
     *
     * @param accountId 账号ID
     * @return 申请，可能为空
     */
    MerchantApplyApiResult latestSettleApply(Long accountId);

    /**
     * 查询账号最新资料变更申请（含待审/驳回）
     *
     * @param accountId 账号ID
     * @return 申请，可能为空
     */
    MerchantApplyApiResult latestProfileApply(Long accountId);

    /**
     * 撤销待审申请
     *
     * @param accountId 账号ID
     * @param applyId 申请ID
     */
    void withdrawApply(Long accountId, Long applyId);

    /**
     * 管理端通过申请
     *
     * @param applyId 申请ID
     */
    void approveApply(Long applyId);

    /**
     * 管理端驳回申请
     *
     * @param applyId 申请ID
     * @param rejectReason 驳回原因
     */
    void rejectApply(Long applyId, String rejectReason);
}
