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
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.params.MerchantParams;
import com.demo.merchant.result.MerchantResult;
import com.demo.merchant.service.IMerchantService;
import com.demo.common.core.text.Convert;
import com.demo.common.utils.poi.ExcelUtil;
import com.demo.common.core.page.TableDataInfo;

/**
 * 商家Controller
 * 
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/web/merchant/merchant")
@AllArgsConstructor
public class MerchantController extends BaseController {

    private final IMerchantService merchantService;

    /**
     * 查询商家列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:list')")
    @GetMapping("/list")
    public TableDataInfo list(MerchantParams params) {
        startPage();
        List<MerchantResult> list = merchantService.selectMerchantResultList(params);
        return getDataTable(list);
    }

    /**
     * 导出商家列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:export')")
    @Log(title = "商家", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, MerchantParams params) {
        List<MerchantResult> list = merchantService.selectMerchantResultList(params);
        ExcelUtil<MerchantResult> util = new ExcelUtil<>(MerchantResult.class);
        util.exportExcel(response, list, "商家数据");
    }

    /**
     * 获取商家详细信息
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:query')")
    @GetMapping(value = "/{merchantId}")
    public R<MerchantResult> getInfo(@PathVariable("merchantId") Long merchantId) {
        return ok(merchantService.selectMerchantResult(merchantId));
    }

    /**
     * 新增商家
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:add')")
    @Log(title = "商家", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Void> add(@RequestBody Merchant merchant) {
        return toR(merchantService.insertMerchant(merchant));
    }

    /**
     * 修改商家
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:edit')")
    @Log(title = "商家", businessType = BusinessType.UPDATE)
    @PutMapping
    public R<Void> edit(@RequestBody Merchant merchant) {
        return toR(merchantService.updateMerchant(merchant));
    }

    /**
     * 删除商家
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchant:remove')")
    @Log(title = "商家", businessType = BusinessType.DELETE)
    @DeleteMapping("/{merchantIds}")
    public R<Void> remove(@PathVariable Long[] merchantIds) {
        List<Long> idList = Convert.toLongList(merchantIds);
        return toR(merchantService.logicDeleteMerchantByIdList(idList));
    }
}
