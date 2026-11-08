package com.demo.mall.service;

import com.demo.common.exception.ServiceException;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.domain.MallProductSku;
import com.demo.mall.mapper.MallProductMapper;
import com.demo.mall.mapper.MallProductSkuMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 校验 SKU 是否可购买：数量上限、停用、库存、商品上架。
 * 加购与下单共用本类，避免两处规则分叉。
 */
@Service
public class MallSkuSaleSupport {

    /** 单行购买数量上限 */
    public static final int MAX_LINE_QUANTITY = 99;

    @Autowired
    private MallProductSkuMapper mallProductSkuMapper;

    @Autowired
    private MallProductMapper mallProductMapper;

    /**
     * 校验通过后返回 SKU 与所属商品；失败抛业务异常。
     *
     * @param skuId    SKU 主键
     * @param quantity 购买数量，调用方须保证大于 0
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
        return new Saleable(sku, product);
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
