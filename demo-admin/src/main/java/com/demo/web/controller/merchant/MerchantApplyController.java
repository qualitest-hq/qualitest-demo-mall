package com.demo.web.controller.merchant;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.demo.common.annotation.Log;
import com.demo.common.core.controller.BaseController;
import com.demo.common.core.domain.R;
import com.demo.common.enums.BusinessType;
import com.demo.merchant.domain.MerchantApply;
import com.demo.merchant.params.MerchantApplyParams;
import com.demo.merchant.params.MerchantApplyRejectParams;
import com.demo.merchant.result.MerchantApplyResult;
import com.demo.merchant.service.IMerchantApplyService;
import com.demo.common.core.text.Convert;
import com.demo.common.utils.poi.ExcelUtil;
import com.demo.common.core.page.TableDataInfo;

/**
 * 商家申请Controller
 * 
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/web/merchant/merchantApply")
@AllArgsConstructor
public class MerchantApplyController extends BaseController {

    private final IMerchantApplyService merchantApplyService;

    /**
     * 查询商家申请列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:list')")
    @GetMapping("/list")
    public TableDataInfo list(MerchantApplyParams params) {
        startPage();
        List<MerchantApplyResult> list = merchantApplyService.selectMerchantApplyResultList(params);
        return getDataTable(list);
    }

    /**
     * 导出商家申请列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:export')")
    @Log(title = "商家申请", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, MerchantApplyParams params) {
        List<MerchantApplyResult> list = merchantApplyService.selectMerchantApplyResultList(params);
        ExcelUtil<MerchantApplyResult> util = new ExcelUtil<>(MerchantApplyResult.class);
        util.exportExcel(response, list, "商家申请数据");
    }

    /**
     * 获取商家申请详细信息
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:query')")
    @GetMapping(value = "/{applyId}")
    public R<MerchantApplyResult> getInfo(@PathVariable("applyId") Long applyId) {
        return ok(merchantApplyService.selectMerchantApplyResult(applyId));
    }

    /**
     * 新增商家申请
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:add')")
    @Log(title = "商家申请", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Void> add(@RequestBody MerchantApply merchantApply) {
        return toR(merchantApplyService.insertMerchantApply(merchantApply));
    }

    /**
     * 修改商家申请
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:edit')")
    @Log(title = "商家申请", businessType = BusinessType.UPDATE)
    @PutMapping
    public R<Void> edit(@RequestBody MerchantApply merchantApply) {
        return toR(merchantApplyService.updateMerchantApply(merchantApply));
    }

    /**
     * 删除商家申请
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:remove')")
    @Log(title = "商家申请", businessType = BusinessType.DELETE)
    @DeleteMapping("/{applyIds}")
    public R<Void> remove(@PathVariable Long[] applyIds) {
        List<Long> idList = Convert.toLongList(applyIds);
        return toR(merchantApplyService.logicDeleteMerchantApplyByIdList(idList));
    }

    /**
     * 通过申请（入驻建店 / 资料写回）
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:edit')")
    @Log(title = "商家申请审核通过", businessType = BusinessType.UPDATE)
    @PutMapping("/{applyId}/approve")
    public R<Void> approve(@PathVariable("applyId") Long applyId) {
        merchantApplyService.approveApply(applyId);
        return ok();
    }

    /**
     * 驳回申请
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantApply:edit')")
    @Log(title = "商家申请审核驳回", businessType = BusinessType.UPDATE)
    @PutMapping("/reject")
    public R<Void> reject(@RequestBody MerchantApplyRejectParams params) {
        if (params == null || params.getApplyId() == null) {
            return fail("申请ID不能为空");
        }
        merchantApplyService.rejectApply(params.getApplyId(), params.getRejectReason());
        return ok();
    }
}
