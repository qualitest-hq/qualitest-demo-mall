package com.demo.mall.service;

import com.demo.common.exception.ServiceException;
import com.demo.mall.domain.MallCategory;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.domain.MallProductSku;
import com.demo.mall.mapper.MallCategoryMapper;
import com.demo.mall.mapper.MallProductMapper;
import com.demo.mall.mapper.MallProductSkuMapper;
import com.demo.merchant.service.IMerchantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * SKU 可购校验：数量上限、SKU 状态、库存、商品上架、分类启用、所属店铺未停用。
 * 加购与下单共用。
 */
@Service
public class MallSkuSaleSupport {

    /** 单行购买数量上限 */
    public static final int MAX_LINE_QUANTITY = 99;

    @Autowired
    private MallProductSkuMapper mallProductSkuMapper;

    @Autowired
    private MallProductMapper mallProductMapper;

    @Autowired
    private MallCategoryMapper mallCategoryMapper;

    @Autowired
    private IMerchantService merchantService;

    /**
     * 校验 SKU 可购买；通过后返回 SKU 与所属商品，失败抛业务异常
     *
     * @param skuId    SKU 主键
     * @param quantity 购买数量，须大于 0
     * @return 可购 SKU 与商品
     */
    public Saleable requireSaleable(Long skuId, int quantity) {
        if (quantity > MAX_LINE_QUANTITY) {
            throw new ServiceException("单行数量不能超过" + MAX_LINE_QUANTITY);
        }
        MallProductSku sku = mallProductSkuMapper.selectMallProductSkuById(skuId);
        if (sku == null || (sku.getDelFlag() != null && sku.getDelFlag() == 1)) {
            throw new ServiceException("SKU不存在");
        }
        if (sku.getStatus() != null && sku.getStatus() != 0) {
            throw new ServiceException("SKU已停用");
        }
        if (sku.getStock() == null || sku.getStock() < quantity) {
            throw new ServiceException("库存不足");
        }
        MallProduct product = mallProductMapper.selectMallProductById(sku.getProductId());
        if (product == null || (product.getDelFlag() != null && product.getDelFlag() == 1)) {
            throw new ServiceException("商品不存在");
        }
        if (product.getShelfStatus() == null || product.getShelfStatus() != 1) {
            throw new ServiceException("商品已下架");
        }
        if (product.getMerchantId() == null) {
            throw new ServiceException("商品未归属店铺");
        }
        requireEnabledCategory(product.getCategoryId());
        merchantService.requireActiveMerchant(product.getMerchantId());
        return new Saleable(sku, product);
    }

    /**
     * 分类须存在且启用（status=0）
     */
    private void requireEnabledCategory(Long categoryId) {
        if (categoryId == null) {
            throw new ServiceException("商品分类无效");
        }
        MallCategory category = mallCategoryMapper.selectMallCategoryById(categoryId);
        if (category == null || (category.getDelFlag() != null && category.getDelFlag() == 1)) {
            throw new ServiceException("商品分类不存在");
        }
        if (category.getStatus() == null || category.getStatus() != 0) {
            throw new ServiceException("商品分类已停用");
        }
    }

    /** 可购买的 SKU 及其所属商品 */
    public static final class Saleable {
        private final MallProductSku sku;
        private final MallProduct product;

        public Saleable(MallProductSku sku, MallProduct product) {
            this.sku = sku;
            this.product = product;
        }

        /** SKU */
        public MallProductSku getSku() {
            return sku;
        }

        /** 所属商品 */
        public MallProduct getProduct() {
            return product;
        }
    }
}
