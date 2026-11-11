package com.demo.merchant.service.impl;

import cn.hutool.core.util.IdUtil;
import com.demo.common.exception.ServiceException;
import com.demo.common.utils.DateUtils;
import com.demo.common.utils.StringUtils;
import com.demo.merchant.apiParams.MerchantApplyApiParams;
import com.demo.merchant.apiParams.MerchantApplySubmitApiParams;
import com.demo.merchant.apiResult.MerchantApplyApiResult;
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.domain.MerchantApply;
import com.demo.merchant.domain.MerchantCategory;
import com.demo.merchant.mapper.MerchantApplyMapper;
import com.demo.merchant.params.MerchantApplyParams;
import com.demo.merchant.params.MerchantParams;
import com.demo.merchant.result.MerchantApplyResult;
import com.demo.merchant.service.IMerchantApplyService;
import com.demo.merchant.service.IMerchantCategoryService;
import com.demo.merchant.service.IMerchantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * 商家申请Service业务层处理
 * 
 * @author demo
 * @date 2026-11-11
 */
@Service
public class MerchantApplyServiceImpl implements IMerchantApplyService {

    /** 入驻申请 */
    public static final long APPLY_TYPE_SETTLE = 1L;
    /** 资料变更 */
    public static final long APPLY_TYPE_PROFILE = 2L;
    /** 待审 */
    public static final int APPLY_STATUS_PENDING = 0;
    /** 已通过 */
    public static final int APPLY_STATUS_APPROVED = 1;
    /** 已驳回 */
    public static final int APPLY_STATUS_REJECTED = 2;
    /** 已撤销 */
    public static final int APPLY_STATUS_WITHDRAWN = 3;

    @Autowired
    private MerchantApplyMapper merchantApplyMapper;

    @Autowired
    private IMerchantService merchantService;

    @Autowired
    private IMerchantCategoryService merchantCategoryService;

    /**
     * 查询商家申请列表
     *
     * @param merchantApply 商家申请
     * @return 商家申请
     */
    @Override
    public List<MerchantApply> selectMerchantApplyList(MerchantApply merchantApply) {
        return merchantApplyMapper.selectMerchantApplyList(merchantApply);
    }

    /**
     * 查询商家申请
     *
     * @param applyId 商家申请主键
     * @return 商家申请
     */
    @Override
    public MerchantApply selectMerchantApplyById(Long applyId) {
        return merchantApplyMapper.selectMerchantApplyById(applyId);
    }

    /**
     * 查询商家申请Result列表
     *
     * @param params 商家申请Params
     * @return 商家申请Result集合
     */
    @Override
    public List<MerchantApplyResult> selectMerchantApplyResultList(MerchantApplyParams params) {
        return merchantApplyMapper.selectMerchantApplyResultList(params);
    }

    /**
     * 获取商家申请详细信息
     *
     * @param applyId 商家申请主键
     * @return 商家申请Result
     */
    @Override
    public MerchantApplyResult selectMerchantApplyResult(Long applyId) {
        return merchantApplyMapper.selectMerchantApplyResult(applyId);
    }

    /**
     * 查询商家申请ApiResult列表（客户端）
     */
    @Override
    public List<MerchantApplyApiResult> selectMerchantApplyApiResultList(MerchantApplyApiParams params) {
        return merchantApplyMapper.selectMerchantApplyApiResultList(params);
    }

    /**
     * 获取商家申请ApiResult详细信息（客户端）
     */
    @Override
    public MerchantApplyApiResult selectMerchantApplyApiResult(Long applyId) {
        return merchantApplyMapper.selectMerchantApplyApiResult(applyId);
    }

    /**
     * 新增商家申请
     *
     * @param merchantApply 商家申请
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertMerchantApply(MerchantApply merchantApply) {
        if (Objects.isNull(merchantApply.getApplyId())) {
            merchantApply.setApplyId(IdUtil.getSnowflakeNextId());
        }
        merchantApply.setCreateTime(DateUtils.getNowDate());
        return merchantApplyMapper.insertMerchantApply(merchantApply);
    }

    /**
     * 修改商家申请
     *
     * @param merchantApply 商家申请
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateMerchantApply(MerchantApply merchantApply) {
        merchantApply.setUpdateTime(DateUtils.getNowDate());
        return merchantApplyMapper.updateMerchantApply(merchantApply);
    }

    /**
     * 批量删除商家申请
     * 
     * @param applyIdList 需要删除的商家申请主键集合
     * @return 结果
     */
    @Override
    public int deleteMerchantApplyByIdList(List<Long> applyIdList) {
        return merchantApplyMapper.deleteMerchantApplyByIdList(applyIdList);
    }

    /**
     * 删除商家申请信息
     * 
     * @param applyId 商家申请主键
     * @return 结果
     */
    @Override
    public int deleteMerchantApplyById(Long applyId) {
        return merchantApplyMapper.deleteMerchantApplyById(applyId);
    }

    /**
     * 逻辑删除商家申请信息
     * 
     * @param applyId 商家申请主键
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantApplyById(Long applyId) {
        return merchantApplyMapper.logicDeleteMerchantApplyById(applyId);
    }

    /**
     * 批量逻辑删除商家申请信息
     * 
     * @param applyIdList 商家申请主键集合
     * @return 结果
     */
    @Override
    public int logicDeleteMerchantApplyByIdList(List<Long> applyIdList) {
        return merchantApplyMapper.logicDeleteMerchantApplyByIdList(applyIdList);
    }

    /**
     * 查询商家申请数量
     *
     * @param params 商家申请Params
     * @return 数量
     */
    @Override
    public int selectMerchantApplyCount(MerchantApplyParams params) {
        return merchantApplyMapper.selectMerchantApplyCount(params);
    }

    /**
     * 按条件查询单条商家申请
     *
     * @param params 商家申请Params
     * @return 商家申请
     */
    @Override
    public MerchantApply selectMerchantApplyOne(MerchantApplyParams params) {
        return merchantApplyMapper.selectMerchantApplyOne(params);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public MerchantApplyApiResult submitSettleApply(Long accountId, MerchantApplySubmitApiParams params) {
        if (accountId == null) {
            throw new ServiceException("请先登录");
        }
        Merchant existing = findMerchantByAccount(accountId);
        if (existing != null) {
            throw new ServiceException("已开通店铺，无需重复入驻");
        }
        MerchantApply pending = findLatestApply(accountId, APPLY_TYPE_SETTLE, APPLY_STATUS_PENDING);
        if (pending != null) {
            throw new ServiceException("已有待审入驻申请，请等待审核或先撤销");
        }
        validateSubmitParams(params, true);
        MerchantApply apply = buildApplyFromSubmit(accountId, null, APPLY_TYPE_SETTLE, params);
        insertMerchantApply(apply);
        return selectMerchantApplyApiResult(apply.getApplyId());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public MerchantApplyApiResult submitProfileApply(Long accountId, MerchantApplySubmitApiParams params) {
        if (accountId == null) {
            throw new ServiceException("请先登录");
        }
        Merchant merchant = findMerchantByAccount(accountId);
        if (merchant == null) {
            throw new ServiceException("尚未开通店铺，请先入驻");
        }
        if (Objects.equals(merchant.getStatus(), 1)) {
            throw new ServiceException("店铺已停用，无法提交资料变更");
        }
        MerchantApply pending = findLatestApply(accountId, APPLY_TYPE_PROFILE, APPLY_STATUS_PENDING);
        if (pending != null) {
            throw new ServiceException("已有待审资料变更，请等待审核或先撤销");
        }
        validateSubmitParams(params, false);
        MerchantApply apply = buildApplyFromSubmit(accountId, merchant.getMerchantId(), APPLY_TYPE_PROFILE, params);
        if (StringUtils.isEmpty(apply.getLicenseFiles())) {
            apply.setLicenseFiles(merchant.getLicenseFiles());
        }
        if (apply.getOpenStatus() == null) {
            apply.setOpenStatus(merchant.getOpenStatus());
        }
        insertMerchantApply(apply);
        return selectMerchantApplyApiResult(apply.getApplyId());
    }

    @Override
    public MerchantApplyApiResult latestSettleApply(Long accountId) {
        MerchantApply apply = findLatestApply(accountId, APPLY_TYPE_SETTLE, null);
        return apply == null ? null : selectMerchantApplyApiResult(apply.getApplyId());
    }

    @Override
    public MerchantApplyApiResult latestProfileApply(Long accountId) {
        MerchantApply apply = findLatestApply(accountId, APPLY_TYPE_PROFILE, null);
        return apply == null ? null : selectMerchantApplyApiResult(apply.getApplyId());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void withdrawApply(Long accountId, Long applyId) {
        MerchantApply apply = requireOwnedPendingApply(accountId, applyId);
        MerchantApply update = new MerchantApply();
        update.setApplyId(apply.getApplyId());
        update.setStatus(APPLY_STATUS_WITHDRAWN);
        update.setUpdateTime(DateUtils.getNowDate());
        updateMerchantApply(update);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void approveApply(Long applyId) {
        MerchantApply apply = requirePendingApply(applyId);
        Date now = DateUtils.getNowDate();
        if (Objects.equals(apply.getApplyType(), APPLY_TYPE_SETTLE)) {
            Merchant exists = findMerchantByAccount(apply.getAccountId());
            if (exists != null) {
                throw new ServiceException("该账号已有店铺，无法重复入驻通过");
            }
            Merchant merchant = Merchant.builder()
                    .accountId(apply.getAccountId())
                    .merchantName(apply.getMerchantName())
                    .categoryId(apply.getCategoryId())
                    .logo(apply.getLogo())
                    .contactName(apply.getContactName())
                    .contactPhone(apply.getContactPhone())
                    .licenseFiles(apply.getLicenseFiles())
                    .openStatus(apply.getOpenStatus() == null ? 1 : apply.getOpenStatus())
                    .status(0)
                    .delFlag(0)
                    .build();
            merchantService.insertMerchant(merchant);
            MerchantApply update = new MerchantApply();
            update.setApplyId(apply.getApplyId());
            update.setMerchantId(merchant.getMerchantId());
            update.setStatus(APPLY_STATUS_APPROVED);
            update.setRejectReason("");
            update.setAuditTime(now);
            update.setUpdateTime(now);
            updateMerchantApply(update);
            return;
        }
        if (Objects.equals(apply.getApplyType(), APPLY_TYPE_PROFILE)) {
            if (apply.getMerchantId() == null) {
                throw new ServiceException("资料变更申请缺少商家ID");
            }
            Merchant merchant = merchantService.selectMerchantById(apply.getMerchantId());
            if (merchant == null || Objects.equals(merchant.getDelFlag(), 1)) {
                throw new ServiceException("商家不存在");
            }
            if (!Objects.equals(merchant.getAccountId(), apply.getAccountId())) {
                throw new ServiceException("申请与商家账号不匹配");
            }
            Merchant updateMerchant = new Merchant();
            updateMerchant.setMerchantId(merchant.getMerchantId());
            updateMerchant.setMerchantName(apply.getMerchantName());
            updateMerchant.setCategoryId(apply.getCategoryId());
            updateMerchant.setLogo(apply.getLogo());
            updateMerchant.setContactName(apply.getContactName());
            updateMerchant.setContactPhone(apply.getContactPhone());
            updateMerchant.setLicenseFiles(apply.getLicenseFiles());
            updateMerchant.setOpenStatus(apply.getOpenStatus());
            merchantService.updateMerchant(updateMerchant);

            MerchantApply update = new MerchantApply();
            update.setApplyId(apply.getApplyId());
            update.setStatus(APPLY_STATUS_APPROVED);
            update.setRejectReason("");
            update.setAuditTime(now);
            update.setUpdateTime(now);
            updateMerchantApply(update);
            return;
        }
        throw new ServiceException("未知申请类型");
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void rejectApply(Long applyId, String rejectReason) {
        MerchantApply apply = requirePendingApply(applyId);
        if (StringUtils.isEmpty(rejectReason)) {
            throw new ServiceException("请填写驳回原因");
        }
        Date now = DateUtils.getNowDate();
        MerchantApply update = new MerchantApply();
        update.setApplyId(apply.getApplyId());
        update.setStatus(APPLY_STATUS_REJECTED);
        update.setRejectReason(rejectReason.trim());
        update.setAuditTime(now);
        update.setUpdateTime(now);
        updateMerchantApply(update);
    }

    private void validateSubmitParams(MerchantApplySubmitApiParams params, boolean settle) {
        if (params == null) {
            throw new ServiceException("申请参数不能为空");
        }
        if (StringUtils.isEmpty(params.getMerchantName())) {
            throw new ServiceException("请填写店铺名称");
        }
        if (params.getCategoryId() == null) {
            throw new ServiceException("请选择经营类目");
        }
        MerchantCategory category = merchantCategoryService.selectMerchantCategoryById(params.getCategoryId());
        if (category == null || Objects.equals(category.getDelFlag(), 1) || !Objects.equals(category.getStatus(), 0)) {
            throw new ServiceException("经营类目不可用");
        }
        if (StringUtils.isEmpty(params.getContactName())) {
            throw new ServiceException("请填写联系人");
        }
        if (StringUtils.isEmpty(params.getContactPhone())) {
            throw new ServiceException("请填写联系电话");
        }
        if (settle && StringUtils.isEmpty(params.getLicenseFiles())) {
            throw new ServiceException("请上传资质材料");
        }
    }

    private MerchantApply buildApplyFromSubmit(Long accountId, Long merchantId, long applyType,
                                              MerchantApplySubmitApiParams params) {
        return MerchantApply.builder()
                .accountId(accountId)
                .merchantId(merchantId)
                .applyType(applyType)
                .merchantName(params.getMerchantName().trim())
                .categoryId(params.getCategoryId())
                .logo(StringUtils.nvl(params.getLogo(), ""))
                .contactName(params.getContactName().trim())
                .contactPhone(params.getContactPhone().trim())
                .licenseFiles(params.getLicenseFiles())
                .openStatus(params.getOpenStatus() == null ? 1 : params.getOpenStatus())
                .status(APPLY_STATUS_PENDING)
                .rejectReason("")
                .delFlag(0)
                .build();
    }

    private Merchant findMerchantByAccount(Long accountId) {
        MerchantParams params = MerchantParams.builder().accountId(accountId).build();
        return merchantService.selectMerchantOne(params);
    }

    private MerchantApply findLatestApply(Long accountId, Long applyType, Integer status) {
        MerchantApplyParams params = MerchantApplyParams.builder()
                .accountId(accountId)
                .applyType(applyType)
                .status(status)
                .build();
        return selectMerchantApplyOne(params);
    }

    private MerchantApply requirePendingApply(Long applyId) {
        if (applyId == null) {
            throw new ServiceException("申请ID不能为空");
        }
        MerchantApply apply = selectMerchantApplyById(applyId);
        if (apply == null || Objects.equals(apply.getDelFlag(), 1)) {
            throw new ServiceException("申请不存在");
        }
        if (!Objects.equals(apply.getStatus(), APPLY_STATUS_PENDING)) {
            throw new ServiceException("仅待审申请可操作");
        }
        return apply;
    }

    private MerchantApply requireOwnedPendingApply(Long accountId, Long applyId) {
        MerchantApply apply = requirePendingApply(applyId);
        if (!Objects.equals(apply.getAccountId(), accountId)) {
            throw new ServiceException("无权操作该申请");
        }
        return apply;
    }
}
