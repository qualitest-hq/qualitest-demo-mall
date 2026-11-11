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
import com.demo.merchant.domain.MerchantCategory;
import com.demo.merchant.params.MerchantCategoryParams;
import com.demo.merchant.result.MerchantCategoryResult;
import com.demo.merchant.service.IMerchantCategoryService;
import com.demo.common.core.text.Convert;
import com.demo.common.utils.poi.ExcelUtil;
import com.demo.common.core.page.TableDataInfo;

/**
 * 商家经营类目Controller
 * 
 * @author demo
 * @date 2026-11-11
 */
@RestController
@RequestMapping("/web/merchant/merchantCategory")
@AllArgsConstructor
public class MerchantCategoryController extends BaseController {

    private final IMerchantCategoryService merchantCategoryService;

    /**
     * 查询商家经营类目列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:list')")
    @GetMapping("/list")
    public TableDataInfo list(MerchantCategoryParams params) {
        startPage();
        List<MerchantCategoryResult> list = merchantCategoryService.selectMerchantCategoryResultList(params);
        return getDataTable(list);
    }

    /**
     * 导出商家经营类目列表
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:export')")
    @Log(title = "商家经营类目", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, MerchantCategoryParams params) {
        List<MerchantCategoryResult> list = merchantCategoryService.selectMerchantCategoryResultList(params);
        ExcelUtil<MerchantCategoryResult> util = new ExcelUtil<>(MerchantCategoryResult.class);
        util.exportExcel(response, list, "商家经营类目数据");
    }

    /**
     * 获取商家经营类目详细信息
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:query')")
    @GetMapping(value = "/{categoryId}")
    public R<MerchantCategoryResult> getInfo(@PathVariable("categoryId") Long categoryId) {
        return ok(merchantCategoryService.selectMerchantCategoryResult(categoryId));
    }

    /**
     * 新增商家经营类目
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:add')")
    @Log(title = "商家经营类目", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Void> add(@RequestBody MerchantCategory merchantCategory) {
        return toR(merchantCategoryService.insertMerchantCategory(merchantCategory));
    }

    /**
     * 修改商家经营类目
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:edit')")
    @Log(title = "商家经营类目", businessType = BusinessType.UPDATE)
    @PutMapping
    public R<Void> edit(@RequestBody MerchantCategory merchantCategory) {
        return toR(merchantCategoryService.updateMerchantCategory(merchantCategory));
    }

    /**
     * 删除商家经营类目
     */
    @PreAuthorize("@ss.hasPermi('merchant:merchantCategory:remove')")
    @Log(title = "商家经营类目", businessType = BusinessType.DELETE)
    @DeleteMapping("/{categoryIds}")
    public R<Void> remove(@PathVariable Long[] categoryIds) {
        List<Long> idList = Convert.toLongList(categoryIds);
        return toR(merchantCategoryService.logicDeleteMerchantCategoryByIdList(idList));
    }
}
