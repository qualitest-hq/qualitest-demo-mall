package com.demo.mall.service.impl;

import cn.hutool.core.util.IdUtil;
import com.demo.common.constant.HttpStatus;
import com.demo.common.exception.ServiceException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import com.demo.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.demo.mall.mapper.MallCartMapper;
import com.demo.mall.domain.MallCart;
import com.demo.mall.domain.MallProductSku;
import com.demo.mall.params.MallCartParams;
import com.demo.mall.apiParams.MallCartAddApiParams;
import com.demo.mall.apiParams.MallCartApiParams;
import com.demo.mall.apiParams.MallCartQuantityApiParams;
import com.demo.mall.apiParams.MallCartSelectedApiParams;
import com.demo.mall.result.MallCartResult;
import com.demo.mall.apiResult.MallCartApiResult;
import com.demo.mall.service.IMallCartService;
import com.demo.mall.service.MallSkuSaleSupport;
import org.springframework.transaction.annotation.Transactional;

/**
 * 商城购物车Service业务层处理
 * 
 * @author demo
 * @date 2026-06-20
 */
@Service
public class MallCartServiceImpl implements IMallCartService {

    @Autowired
    private MallCartMapper mallCartMapper;

    @Autowired
    private MallSkuSaleSupport mallSkuSaleSupport;

    /**
     * 查询商城购物车列表
     *
     * @param mallCart 商城购物车
     * @return 商城购物车
     */
    @Override
    public List<MallCart> selectMallCartList(MallCart mallCart) {
        return mallCartMapper.selectMallCartList(mallCart);
    }

    /**
     * 查询商城购物车
     *
     * @param cartId 商城购物车主键
     * @return 商城购物车
     */
    @Override
    public MallCart selectMallCartById(Long cartId) {
        return mallCartMapper.selectMallCartById(cartId);
    }

    /**
     * 查询商城购物车Result列表
     *
     * @param params 商城购物车Params
     * @return 商城购物车Result集合
     */
    @Override
    public List<MallCartResult> selectMallCartResultList(MallCartParams params) {
        return mallCartMapper.selectMallCartResultList(params);
    }

    /**
     * 获取商城购物车详细信息
     *
     * @param cartId 商城购物车主键
     * @return 商城购物车Result
     */
    @Override
    public MallCartResult selectMallCartResult(Long cartId) {
        return mallCartMapper.selectMallCartResult(cartId);
    }

    /**
     * 查询客户端购物车列表，并为每行填充是否可结算
     */
    @Override
    public List<MallCartApiResult> selectMallCartApiResultList(MallCartApiParams params) {
        List<MallCartApiResult> list = mallCartMapper.selectMallCartApiResultList(params);
        if (list != null) {
            for (MallCartApiResult row : list) {
                fillAvailability(row);
            }
        }
        return list;
    }

    /**
     * 获取商城购物车ApiResult详细信息（客户端）
     */
    @Override
    public MallCartApiResult selectMallCartApiResult(Long cartId) {
        return mallCartMapper.selectMallCartApiResult(cartId);
    }

    /**
     * 新增购物车行；未传勾选时默认勾选
     *
     * @param mallCart 购物车实体
     * @return 影响行数
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertMallCart(MallCart mallCart) {
        if (Objects.isNull(mallCart.getCartId())) {
            mallCart.setCartId(IdUtil.getSnowflakeNextId());
        }
        if (mallCart.getSelected() == null) {
            mallCart.setSelected(1);
        }
        mallCart.setCreateTime(DateUtils.getNowDate());
        return mallCartMapper.insertMallCart(mallCart);
    }

    /**
     * 修改商城购物车
     *
     * @param mallCart 商城购物车
     * @return 结果
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateMallCart(MallCart mallCart) {
        mallCart.setUpdateTime(DateUtils.getNowDate());
        return mallCartMapper.updateMallCart(mallCart);
    }

    /**
     * 批量删除商城购物车
     * 
     * @param cartIdList 需要删除的商城购物车主键集合
     * @return 结果
     */
    @Override
    public int deleteMallCartByIdList(List<Long> cartIdList) {
        return mallCartMapper.deleteMallCartByIdList(cartIdList);
    }

    /**
     * 删除商城购物车信息
     * 
     * @param cartId 商城购物车主键
     * @return 结果
     */
    @Override
    public int deleteMallCartById(Long cartId) {
        return mallCartMapper.deleteMallCartById(cartId);
    }

    /**
     * 查询商城购物车数量
     *
     * @param params 商城购物车Params
     * @return 数量
     */
    @Override
    public int selectMallCartCount(MallCartParams params) {
        return mallCartMapper.selectMallCartCount(params);
    }

    /**
     * 按条件查询单条商城购物车
     *
     * @param params 商城购物车Params
     * @return 商城购物车
     */
    @Override
    public MallCart selectMallCartOne(MallCartParams params) {
        return mallCartMapper.selectMallCartOne(params);
    }

    /**
     * 加入购物车：校验 SKU 可购（含店铺未停用）；已有同 SKU 则累加并勾选，否则新建一行
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void addMallCartItem(Long accountId, MallCartAddApiParams params) {
        if (params == null || params.getSkuId() == null) {
            throw new ServiceException("SKU ID不能为空");
        }
        int quantity = params.getQuantity() == null ? 1 : params.getQuantity();
        if (quantity <= 0) {
            throw new ServiceException("数量须大于0");
        }
        MallProductSku sku = mallSkuSaleSupport.requireSaleable(params.getSkuId(), quantity).getSku();
        MallCartParams query = new MallCartParams();
        query.setAccountId(accountId);
        query.setSkuId(params.getSkuId());
        MallCart existing = mallCartMapper.selectMallCartOne(query);
        if (existing != null) {
            int newQty = existing.getQuantity() + quantity;
            mallSkuSaleSupport.requireSaleable(params.getSkuId(), newQty);
            MallCart update = new MallCart();
            update.setCartId(existing.getCartId());
            update.setQuantity(newQty);
            update.setSelected(1);
            update.setUpdateTime(DateUtils.getNowDate());
            mallCartMapper.updateMallCart(update);
            return;
        }
        MallCart cart = new MallCart();
        cart.setCartId(IdUtil.getSnowflakeNextId());
        cart.setAccountId(accountId);
        cart.setProductId(sku.getProductId());
        cart.setSkuId(sku.getSkuId());
        cart.setQuantity(quantity);
        cart.setSelected(1);
        cart.setCreateTime(DateUtils.getNowDate());
        mallCartMapper.insertMallCart(cart);
    }

    /**
     * 修改购物车数量：为 0 则物理删除，否则校验可购后更新数量
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void updateMallCartQuantity(Long accountId, MallCartQuantityApiParams params) {
        if (params == null || params.getCartId() == null) {
            throw new ServiceException("购物车ID不能为空");
        }
        if (params.getQuantity() == null) {
            throw new ServiceException("数量不能为空");
        }
        MallCart cart = requireOwnedCart(accountId, params.getCartId());
        if (params.getQuantity() == 0) {
            mallCartMapper.deleteMallCartById(cart.getCartId());
            return;
        }
        if (params.getQuantity() < 0) {
            throw new ServiceException("数量须大于等于0");
        }
        mallSkuSaleSupport.requireSaleable(cart.getSkuId(), params.getQuantity());
        MallCart update = new MallCart();
        update.setCartId(cart.getCartId());
        update.setQuantity(params.getQuantity());
        update.setUpdateTime(DateUtils.getNowDate());
        mallCartMapper.updateMallCart(update);
    }

    /**
     * 批量更新勾选状态；逐行校验归属后写入 selected
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void updateMallCartSelected(Long accountId, MallCartSelectedApiParams params) {
        if (params == null || params.getCartIds() == null || params.getCartIds().isEmpty()) {
            throw new ServiceException("购物车ID不能为空");
        }
        if (params.getSelected() == null || (params.getSelected() != 0 && params.getSelected() != 1)) {
            throw new ServiceException("勾选状态须为0或1");
        }
        for (Long cartId : params.getCartIds()) {
            if (cartId == null) {
                throw new ServiceException("购物车ID不能为空");
            }
            MallCart cart = requireOwnedCart(accountId, cartId);
            MallCart update = new MallCart();
            update.setCartId(cart.getCartId());
            update.setSelected(params.getSelected());
            update.setUpdateTime(DateUtils.getNowDate());
            mallCartMapper.updateMallCart(update);
        }
    }

    /**
     * 批量物理删除购物车行；逐行校验归属后一次删除
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void deleteMallCartItems(Long accountId, List<Long> cartIds) {
        if (cartIds == null || cartIds.isEmpty()) {
            throw new ServiceException("购物车ID不能为空");
        }
        List<Long> ownedIds = new ArrayList<>();
        for (Long cartId : cartIds) {
            if (cartId == null) {
                throw new ServiceException("购物车ID不能为空");
            }
            requireOwnedCart(accountId, cartId);
            ownedIds.add(cartId);
        }
        mallCartMapper.deleteMallCartByIdList(ownedIds);
    }

    /**
     * 物理清空当前账号全部购物车行
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void clearMallCartByAccountId(Long accountId) {
        mallCartMapper.deleteByAccountId(accountId);
    }

    /**
     * 按上架、SKU 状态、库存填写 available 与 unavailableReason
     */
    private void fillAvailability(MallCartApiResult row) {
        if (row.getShelfStatus() == null || row.getShelfStatus() != 1) {
            row.setAvailable(false);
            row.setUnavailableReason("商品已下架");
            return;
        }
        if (row.getSkuStatus() != null && row.getSkuStatus() != 0) {
            row.setAvailable(false);
            row.setUnavailableReason("SKU已停用");
            return;
        }
        int stock = row.getStock() == null ? 0 : row.getStock();
        int qty = row.getQuantity() == null ? 0 : row.getQuantity();
        if (stock <= 0) {
            row.setAvailable(false);
            row.setUnavailableReason("库存不足");
            return;
        }
        if (stock < qty) {
            row.setAvailable(false);
            row.setUnavailableReason("库存不足");
            return;
        }
        row.setAvailable(true);
        row.setUnavailableReason(null);
    }

    /**
     * 校验购物车项存在且归属当前账号
     */
    private MallCart requireOwnedCart(Long accountId, Long cartId) {
        MallCart cart = mallCartMapper.selectMallCartById(cartId);
        if (cart == null || (cart.getDelFlag() != null && cart.getDelFlag() == 1)) {
            throw new ServiceException("购物车项不存在");
        }
        if (!accountId.equals(cart.getAccountId())) {
            throw new ServiceException("无权操作该购物车项", HttpStatus.FORBIDDEN);
        }
        return cart;
    }

}
