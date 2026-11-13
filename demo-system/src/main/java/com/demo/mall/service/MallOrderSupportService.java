package com.demo.mall.service;

import com.demo.common.exception.ServiceException;
import com.demo.common.utils.DateUtils;
import com.demo.coupon.domain.AccountCoupon;
import com.demo.coupon.mapper.AccountCouponMapper;
import com.demo.coupon.mapper.CouponMapper;
import com.demo.mall.domain.MallOrder;
import com.demo.mall.domain.MallOrderItem;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.domain.MallProductSku;
import com.demo.mall.mapper.MallOrderItemMapper;
import com.demo.mall.mapper.MallProductMapper;
import com.demo.mall.mapper.MallProductSkuMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * 订单库存与优惠券辅助操作
 */
@Service
public class MallOrderSupportService {

    @Autowired
    private MallOrderItemMapper mallOrderItemMapper;

    @Autowired
    private MallProductSkuMapper mallProductSkuMapper;

    @Autowired
    private MallProductMapper mallProductMapper;

    @Autowired
    private AccountCouponMapper accountCouponMapper;

    @Autowired
    private CouponMapper couponMapper;

    /**
     * 按下单明细扣减 SKU/SPU 库存（不计销量；销量在支付成功后累加）
     */
    public void deductStockForOrderItems(List<MallOrderItem> items) {
        forEachValidLine(items, (skuId, productId, qty) -> {
            changeSkuStock(skuId, -qty, true);
            changeProductStock(productId, -qty);
        });
    }

    /**
     * 支付成功后按订单明细累加 SKU/SPU 销量
     */
    public void increaseSalesForOrder(Long orderId) {
        forEachValidLine(listOrderItems(orderId), (skuId, productId, qty) -> {
            changeSkuSales(skuId, qty);
            changeProductSales(productId, qty);
        });
    }

    /**
     * 按订单明细回滚 SKU/SPU 库存（待付款取消/关单；不回滚销量，因未支付未计销量）
     */
    public void rollbackStockForOrder(Long orderId) {
        forEachValidLine(listOrderItems(orderId), (skuId, productId, qty) -> {
            changeSkuStock(skuId, qty, false);
            changeProductStock(productId, qty);
        });
    }

    /**
     * 退货退款完成：回滚库存并扣减销量
     *
     * @param skuId     SKU 主键，可空
     * @param productId 商品主键，可空
     * @param qty       回滚数量，须大于 0
     */
    public void restoreStockAndSales(Long skuId, Long productId, int qty) {
        if (qty <= 0) {
            return;
        }
        changeSkuStock(skuId, qty, false);
        changeProductStock(productId, qty);
        changeSkuSales(skuId, -qty);
        changeProductSales(productId, -qty);
    }

    /**
     * 待付款阶段占用账号优惠券
     */
    public void holdCoupon(Long accountCouponId, Long orderId, Long accountId) {
        AccountCoupon accountCoupon = accountCouponMapper.selectAccountCouponById(accountCouponId);
        if (accountCoupon == null || (accountCoupon.getDelFlag() != null && accountCoupon.getDelFlag() == 1)) {
            throw new ServiceException("优惠券不存在");
        }
        if (!accountId.equals(accountCoupon.getAccountId())) {
            throw new ServiceException("无权使用该优惠券");
        }
        AccountCoupon update = new AccountCoupon();
        update.setAccountCouponId(accountCouponId);
        update.setOrderId(orderId);
        update.setUpdateTime(DateUtils.getNowDate());
        accountCouponMapper.updateAccountCoupon(update);
    }

    /**
     * 释放订单占用的账号优惠券
     */
    public void releaseOccupiedCoupon(MallOrder order) {
        if (order.getAccountCouponId() == null || order.getAccountCouponId() <= 0) {
            return;
        }
        AccountCoupon accountCoupon = accountCouponMapper.selectAccountCouponById(order.getAccountCouponId());
        if (accountCoupon == null) {
            return;
        }
        AccountCoupon update = new AccountCoupon();
        update.setAccountCouponId(accountCoupon.getAccountCouponId());
        update.setOrderId(0L);
        update.setUseStatus(0);
        update.setUseTime(null);
        update.setUpdateTime(DateUtils.getNowDate());
        accountCouponMapper.updateAccountCoupon(update);
    }

    /**
     * 支付成功后核销账号优惠券并更新模板已使用数量
     */
    public void consumeCouponOnPay(MallOrder order) {
        if (order.getAccountCouponId() == null || order.getAccountCouponId() <= 0) {
            return;
        }
        AccountCoupon accountCoupon = accountCouponMapper.selectAccountCouponById(order.getAccountCouponId());
        if (accountCoupon == null) {
            return;
        }
        Date now = DateUtils.getNowDate();
        AccountCoupon update = new AccountCoupon();
        update.setAccountCouponId(accountCoupon.getAccountCouponId());
        update.setUseStatus(1);
        update.setUseTime(now);
        update.setUpdateTime(now);
        accountCouponMapper.updateAccountCoupon(update);
        if (order.getCouponId() != null && order.getCouponId() > 0) {
            couponMapper.incrementUsedCount(order.getCouponId());
        }
    }

    private List<MallOrderItem> listOrderItems(Long orderId) {
        MallOrderItem query = new MallOrderItem();
        query.setOrderId(orderId);
        return mallOrderItemMapper.selectMallOrderItemList(query);
    }

    private void forEachValidLine(List<MallOrderItem> items, LineConsumer consumer) {
        if (items == null || items.isEmpty()) {
            return;
        }
        for (MallOrderItem item : items) {
            if (item.getSkuId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }
            consumer.accept(item.getSkuId(), item.getProductId(), item.getQuantity());
        }
    }

    /**
     * 调整 SKU 库存；delta 为负表示扣减。checkEnough 为真时：SKU 必须存在且库存充足。
     */
    private void changeSkuStock(Long skuId, int delta, boolean checkEnough) {
        if (skuId == null || delta == 0) {
            return;
        }
        MallProductSku sku = mallProductSkuMapper.selectMallProductSkuById(skuId);
        if (sku == null) {
            if (checkEnough) {
                throw new ServiceException("SKU不存在");
            }
            return;
        }
        int stock = sku.getStock() != null ? sku.getStock() : 0;
        if (checkEnough && delta < 0 && stock < -delta) {
            throw new ServiceException("库存不足");
        }
        MallProductSku skuUpdate = new MallProductSku();
        skuUpdate.setSkuId(skuId);
        skuUpdate.setStock(Math.max(0, stock + delta));
        mallProductSkuMapper.updateMallProductSku(skuUpdate);
    }

    private void changeProductStock(Long productId, int delta) {
        if (productId == null || delta == 0) {
            return;
        }
        MallProduct product = mallProductMapper.selectMallProductById(productId);
        if (product == null) {
            return;
        }
        int stockTotal = product.getStockTotal() != null ? product.getStockTotal() : 0;
        MallProduct productUpdate = new MallProduct();
        productUpdate.setProductId(productId);
        productUpdate.setStockTotal(Math.max(0, stockTotal + delta));
        mallProductMapper.updateMallProduct(productUpdate);
    }

    private void changeSkuSales(Long skuId, int delta) {
        if (skuId == null || delta == 0) {
            return;
        }
        MallProductSku sku = mallProductSkuMapper.selectMallProductSkuById(skuId);
        if (sku == null) {
            return;
        }
        int sales = sku.getSalesCount() != null ? sku.getSalesCount() : 0;
        MallProductSku skuUpdate = new MallProductSku();
        skuUpdate.setSkuId(skuId);
        skuUpdate.setSalesCount(Math.max(0, sales + delta));
        mallProductSkuMapper.updateMallProductSku(skuUpdate);
    }

    private void changeProductSales(Long productId, int delta) {
        if (productId == null || delta == 0) {
            return;
        }
        MallProduct product = mallProductMapper.selectMallProductById(productId);
        if (product == null) {
            return;
        }
        int sales = product.getSalesCount() != null ? product.getSalesCount() : 0;
        MallProduct productUpdate = new MallProduct();
        productUpdate.setProductId(productId);
        productUpdate.setSalesCount(Math.max(0, sales + delta));
        mallProductMapper.updateMallProduct(productUpdate);
    }

    @FunctionalInterface
    private interface LineConsumer {
        void accept(Long skuId, Long productId, int qty);
    }
}
