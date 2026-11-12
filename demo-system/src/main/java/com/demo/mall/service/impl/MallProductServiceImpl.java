package com.demo.mall.service.impl;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.demo.common.exception.ServiceException;
import com.demo.common.utils.DateUtils;
import com.demo.mall.apiParams.MallProductApiParams;
import com.demo.mall.apiParams.MallProductMerchantSaveApiParams;
import com.demo.mall.apiParams.MallProductMerchantSkuSaveApiParams;
import com.demo.mall.apiParams.MallProductSkuApiParams;
import com.demo.mall.apiResult.MallProductApiResult;
import com.demo.mall.apiResult.MallProductSkuApiResult;
import com.demo.mall.domain.MallProduct;
import com.demo.mall.domain.MallProductSku;
import com.demo.mall.mapper.MallProductMapper;
import com.demo.mall.params.MallProductParams;
import com.demo.mall.result.MallProductResult;
import com.demo.mall.service.IMallProductService;
import com.demo.mall.service.IMallProductSkuService;
import com.demo.merchant.domain.Merchant;
import com.demo.merchant.service.IMerchantService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 商城商品SPUService业务层处理
 *
 * @author demo
 * @date 2026-06-20
 */
@Service
public class MallProductServiceImpl implements IMallProductService {

    @Autowired
    private MallProductMapper mallProductMapper;

    @Autowired
    private IMallProductSkuService mallProductSkuService;

    @Autowired
    private IMerchantService merchantService;

    /**
     * 查询商城商品SPU列表
     *
     * @param mallProduct 商城商品SPU
     * @return 商城商品SPU
     */
    @Override
    public List<MallProduct> selectMallProductList(MallProduct mallProduct) {
        return mallProductMapper.selectMallProductList(mallProduct);
    }

    /**
     * 查询商城商品SPU
     *
     * @param productId 商城商品SPU主键
     * @return 商城商品SPU
     */
    @Override
    public MallProduct selectMallProductById(Long productId) {
        return mallProductMapper.selectMallProductById(productId);
    }

    /**
     * 查询商城商品SPUResult列表
     *
     * @param params 商城商品SPUParams
     * @return 商城商品SPUResult集合
     */
    @Override
    public List<MallProductResult> selectMallProductResultList(MallProductParams params) {
        return mallProductMapper.selectMallProductResultList(params);
    }

    /**
     * 获取商城商品SPU详细信息
     *
     * @param productId 商城商品SPU主键
     * @return 商城商品SPUResult
     */
    @Override
    public MallProductResult selectMallProductResult(Long productId) {
        return mallProductMapper.selectMallProductResult(productId);
    }

    /**
     * 查询已上架且所属店铺有效的商品列表
     *
     * @param params 查询条件
     * @return 商品集合
     */
    @Override
    public List<MallProductApiResult> selectMallProductApiResultList(MallProductApiParams params) {
        List<MallProductApiResult> list = mallProductMapper.selectMallProductApiResultList(params);
        fillGalleryImages(list);
        return list;
    }

    /**
     * 查询已上架且所属店铺/分类有效的商品详情，并填充可售 SKU
     *
     * @param productId 商品ID
     * @return 商品详情
     */
    @Override
    public MallProductApiResult selectMallProductApiResult(Long productId) {
        MallProductApiResult product = mallProductMapper.selectMallProductApiResult(productId);
        if (product == null || product.getShelfStatus() == null || product.getShelfStatus() != 1) {
            throw new ServiceException("商品不存在或已下架");
        }
        fillGalleryImages(product);
        MallProductSkuApiParams params = new MallProductSkuApiParams();
        params.setProductId(productId);
        params.setStatus(0);
        List<MallProductSkuApiResult> skus = mallProductSkuService.selectMallProductSkuApiResultList(params);
        product.setSkus(skus);
        return product;
    }

    /**
     * 新增商品；须指定商家且店铺未停用
     *
     * @param mallProduct 商品
     * @return 影响行数
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertMallProduct(MallProduct mallProduct) {
        if (mallProduct.getMerchantId() == null) {
            throw new ServiceException("商家ID不能为空");
        }
        merchantService.requireActiveMerchant(mallProduct.getMerchantId());
        if (Objects.isNull(mallProduct.getProductId())) {
            mallProduct.setProductId(IdUtil.getSnowflakeNextId());
        }
        if (mallProduct.getDelFlag() == null) {
            mallProduct.setDelFlag(0);
        }
        if (mallProduct.getShelfStatus() == null) {
            mallProduct.setShelfStatus(0);
        }
        if (mallProduct.getSalesCount() == null) {
            mallProduct.setSalesCount(0);
        }
        if (mallProduct.getStockTotal() == null) {
            mallProduct.setStockTotal(0);
        }
        mallProduct.setCreateTime(DateUtils.getNowDate());
        return mallProductMapper.insertMallProduct(mallProduct);
    }

    /**
     * 修改商品；若传入商家ID则校验店铺未停用
     *
     * @param mallProduct 商品
     * @return 影响行数
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateMallProduct(MallProduct mallProduct) {
        if (mallProduct.getProductId() == null) {
            throw new ServiceException("商品ID不能为空");
        }
        MallProduct existing = mallProductMapper.selectMallProductById(mallProduct.getProductId());
        if (existing == null || Objects.equals(existing.getDelFlag(), 1)) {
            throw new ServiceException("商品不存在");
        }
        if (mallProduct.getMerchantId() != null) {
            merchantService.requireActiveMerchant(mallProduct.getMerchantId());
        }
        mallProduct.setUpdateTime(DateUtils.getNowDate());
        return mallProductMapper.updateMallProduct(mallProduct);
    }

    /**
     * 批量删除商城商品SPU
     *
     * @param productIdList 需要删除的商城商品SPU主键集合
     * @return 结果
     */
    @Override
    public int deleteMallProductByIdList(List<Long> productIdList) {
        return mallProductMapper.deleteMallProductByIdList(productIdList);
    }

    /**
     * 删除商城商品SPU信息
     *
     * @param productId 商城商品SPU主键
     * @return 结果
     */
    @Override
    public int deleteMallProductById(Long productId) {
        return mallProductMapper.deleteMallProductById(productId);
    }

    /**
     * 逻辑删除商城商品SPU信息
     *
     * @param productId 商城商品SPU主键
     * @return 结果
     */
    @Override
    public int logicDeleteMallProductById(Long productId) {
        return mallProductMapper.logicDeleteMallProductById(productId);
    }

    /**
     * 批量逻辑删除商城商品SPU信息
     *
     * @param productIdList 商城商品SPU主键集合
     * @return 结果
     */
    @Override
    public int logicDeleteMallProductByIdList(List<Long> productIdList) {
        return mallProductMapper.logicDeleteMallProductByIdList(productIdList);
    }

    /**
     * 查询商城商品SPU数量
     *
     * @param params 商城商品SPUParams
     * @return 数量
     */
    @Override
    public int selectMallProductCount(MallProductParams params) {
        return mallProductMapper.selectMallProductCount(params);
    }

    /**
     * 按条件查询单条商城商品SPU
     *
     * @param params 商城商品SPUParams
     * @return 商城商品SPU
     */
    @Override
    public MallProduct selectMallProductOne(MallProductParams params) {
        return mallProductMapper.selectMallProductOne(params);
    }

    /**
     * 切换商品上架/下架；上架时要求所属店铺未停用
     *
     * @param productId   商品ID
     * @param shelfStatus 上架状态（0下架 1上架）
     */
    @Override
    public void changeMallProductShelfStatus(Long productId, Integer shelfStatus) {
        if (productId == null) {
            throw new ServiceException("商品ID不能为空");
        }
        if (shelfStatus == null || (shelfStatus != 0 && shelfStatus != 1)) {
            throw new ServiceException("上架状态无效");
        }
        MallProduct product = mallProductMapper.selectMallProductById(productId);
        if (product == null || (product.getDelFlag() != null && product.getDelFlag() == 1)) {
            throw new ServiceException("商品不存在");
        }
        if (shelfStatus == 1) {
            merchantService.requireActiveMerchant(product.getMerchantId());
        }
        MallProduct update = new MallProduct();
        update.setProductId(productId);
        update.setShelfStatus(shelfStatus);
        update.setUpdateTime(DateUtils.getNowDate());
        mallProductMapper.updateMallProduct(update);
    }

    /**
     * 查询当前账号本店商品列表（含下架）；商家ID由服务端写入
     *
     * @param accountId 账号ID
     * @param params    查询条件
     * @return 本店商品集合
     */
    @Override
    public List<MallProductApiResult> selectMerchantProductList(Long accountId, MallProductApiParams params) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        MallProductApiParams query = params == null ? new MallProductApiParams() : params;
        query.setMerchantId(merchant.getMerchantId());
        List<MallProductApiResult> list = mallProductMapper.selectMallProductMerchantApiResultList(query);
        fillGalleryImages(list);
        return list;
    }

    /**
     * 查询当前账号本店商品详情，并填充 SKU
     *
     * @param accountId 账号ID
     * @param productId 商品ID
     * @return 本店商品详情
     */
    @Override
    public MallProductApiResult selectMerchantProductDetail(Long accountId, Long productId) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        MallProductApiResult product = mallProductMapper.selectMallProductMerchantApiResult(productId, merchant.getMerchantId());
        if (product == null) {
            throw new ServiceException("商品不存在或无权操作");
        }
        fillGalleryImages(product);
        MallProductSkuApiParams skuParams = new MallProductSkuApiParams();
        skuParams.setProductId(productId);
        product.setSkus(mallProductSkuService.selectMallProductSkuApiResultList(skuParams));
        return product;
    }

    /**
     * 新建本店商品，同时写入 SPU 与 SKU
     *
     * @param accountId 账号ID
     * @param params    保存入参
     * @return 新建后的商品详情
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public MallProductApiResult createMerchantProduct(Long accountId, MallProductMerchantSaveApiParams params) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        validateSaveParams(params, false);
        int stockTotal = sumSkuStock(params.getSkus());
        BigDecimal salePrice = resolveSalePrice(params);
        BigDecimal marketPrice = resolveMarketPrice(params);

        MallProduct product = MallProduct.builder()
                .merchantId(merchant.getMerchantId())
                .categoryId(params.getCategoryId())
                .productName(params.getProductName().trim())
                .unitName(StrUtil.blankToDefault(params.getUnitName(), "件"))
                .marketPrice(marketPrice)
                .salePrice(salePrice)
                .freightAmount(params.getFreightAmount() == null ? BigDecimal.ZERO : params.getFreightAmount())
                .mainImage(StrUtil.blankToDefault(params.getMainImage(), ""))
                .galleryImages(toGalleryJson(params.getGalleryImages()))
                .intro(StrUtil.blankToDefault(params.getIntro(), ""))
                .stockTotal(stockTotal)
                .salesCount(0)
                .shelfStatus(params.getShelfStatus() == null ? 0 : params.getShelfStatus())
                .sortNum(params.getSortNum() == null ? 0 : params.getSortNum())
                .delFlag(0)
                .build();
        product.setRemark(params.getRemark());
        insertMallProduct(product);
        replaceMerchantSkus(product.getProductId(), params.getSkus(), false);
        return selectMerchantProductDetail(accountId, product.getProductId());
    }

    /**
     * 更新本店商品，同时覆盖保存 SKU
     *
     * @param accountId 账号ID
     * @param params    保存入参
     * @return 更新后的商品详情
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public MallProductApiResult updateMerchantProduct(Long accountId, MallProductMerchantSaveApiParams params) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        validateSaveParams(params, true);
        MallProduct existing = requireProductOwnedByMerchant(params.getProductId(), merchant.getMerchantId());

        int stockTotal = sumSkuStock(params.getSkus());
        BigDecimal salePrice = resolveSalePrice(params);
        BigDecimal marketPrice = resolveMarketPrice(params);
        Integer shelfStatus = params.getShelfStatus() == null ? existing.getShelfStatus() : params.getShelfStatus();

        MallProduct update = MallProduct.builder()
                .productId(existing.getProductId())
                .merchantId(merchant.getMerchantId())
                .categoryId(params.getCategoryId())
                .productName(params.getProductName().trim())
                .unitName(StrUtil.blankToDefault(params.getUnitName(), "件"))
                .marketPrice(marketPrice)
                .salePrice(salePrice)
                .freightAmount(params.getFreightAmount() == null ? BigDecimal.ZERO : params.getFreightAmount())
                .mainImage(params.getMainImage() == null ? existing.getMainImage() : StrUtil.blankToDefault(params.getMainImage(), ""))
                .galleryImages(params.getGalleryImages() == null ? existing.getGalleryImages() : toGalleryJson(params.getGalleryImages()))
                .intro(params.getIntro() == null ? existing.getIntro() : StrUtil.nullToDefault(params.getIntro(), ""))
                .stockTotal(stockTotal)
                .shelfStatus(shelfStatus)
                .sortNum(params.getSortNum() == null ? existing.getSortNum() : params.getSortNum())
                .build();
        update.setRemark(params.getRemark());
        updateMallProduct(update);
        replaceMerchantSkus(existing.getProductId(), params.getSkus(), true);
        return selectMerchantProductDetail(accountId, existing.getProductId());
    }

    /**
     * 对本店商品执行上下架
     *
     * @param accountId   账号ID
     * @param productId   商品ID
     * @param shelfStatus 上架状态（0下架 1上架）
     */
    @Override
    public void changeMerchantProductShelfStatus(Long accountId, Long productId, Integer shelfStatus) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        requireProductOwnedByMerchant(productId, merchant.getMerchantId());
        changeMallProductShelfStatus(productId, shelfStatus);
    }

    /**
     * 统计当前账号本店在售商品数量
     *
     * @param accountId 账号ID
     * @return 在售数量
     */
    @Override
    public int countMerchantOnsaleProduct(Long accountId) {
        Merchant merchant = merchantService.requireOwnedActiveMerchant(accountId);
        return mallProductMapper.selectMallProductCount(MallProductParams.builder()
                .merchantId(merchant.getMerchantId())
                .shelfStatus(1)
                .build());
    }

    /**
     * 校验商家保存入参
     *
     * @param params           保存入参
     * @param requireProductId 是否要求商品ID（编辑时为 true）
     */
    private void validateSaveParams(MallProductMerchantSaveApiParams params, boolean requireProductId) {
        if (params == null) {
            throw new ServiceException("参数不能为空");
        }
        if (requireProductId && params.getProductId() == null) {
            throw new ServiceException("商品ID不能为空");
        }
        if (params.getCategoryId() == null) {
            throw new ServiceException("分类不能为空");
        }
        if (StrUtil.isBlank(params.getProductName())) {
            throw new ServiceException("商品名称不能为空");
        }
        if (params.getSkus() == null || params.getSkus().isEmpty()) {
            throw new ServiceException("至少需要一个SKU");
        }
        for (MallProductMerchantSkuSaveApiParams sku : params.getSkus()) {
            if (sku == null || StrUtil.isBlank(sku.getSkuName())) {
                throw new ServiceException("SKU名称不能为空");
            }
            if (sku.getSalePrice() == null || sku.getSalePrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new ServiceException("SKU销售价无效");
            }
            if (sku.getStock() == null || sku.getStock() < 0) {
                throw new ServiceException("SKU库存无效");
            }
        }
        if (params.getShelfStatus() != null && params.getShelfStatus() != 0 && params.getShelfStatus() != 1) {
            throw new ServiceException("上架状态无效");
        }
    }

    /**
     * 汇总 SKU 库存作为 SPU 总库存
     *
     * @param skus SKU 入参列表
     * @return 总库存
     */
    private int sumSkuStock(List<MallProductMerchantSkuSaveApiParams> skus) {
        int total = 0;
        for (MallProductMerchantSkuSaveApiParams sku : skus) {
            total += sku.getStock() == null ? 0 : sku.getStock();
        }
        return total;
    }

    /**
     * 解析 SPU 销售价：入参优先，否则取 SKU 最低售价
     *
     * @param params 保存入参
     * @return 销售价
     */
    private BigDecimal resolveSalePrice(MallProductMerchantSaveApiParams params) {
        if (params.getSalePrice() != null) {
            return params.getSalePrice();
        }
        BigDecimal min = null;
        for (MallProductMerchantSkuSaveApiParams sku : params.getSkus()) {
            if (min == null || sku.getSalePrice().compareTo(min) < 0) {
                min = sku.getSalePrice();
            }
        }
        return min == null ? BigDecimal.ZERO : min;
    }

    /**
     * 解析 SPU 市场价：入参优先，否则取 SKU 最高市场价（缺省用售价）
     *
     * @param params 保存入参
     * @return 市场价
     */
    private BigDecimal resolveMarketPrice(MallProductMerchantSaveApiParams params) {
        if (params.getMarketPrice() != null) {
            return params.getMarketPrice();
        }
        BigDecimal max = BigDecimal.ZERO;
        for (MallProductMerchantSkuSaveApiParams sku : params.getSkus()) {
            BigDecimal mp = defaultMarketPrice(sku.getMarketPrice(), sku.getSalePrice());
            if (mp.compareTo(max) > 0) {
                max = mp;
            }
        }
        return max;
    }

    /**
     * SKU 市场价缺省用售价
     *
     * @param marketPrice 市场价
     * @param salePrice   销售价
     * @return 有效市场价
     */
    private BigDecimal defaultMarketPrice(BigDecimal marketPrice, BigDecimal salePrice) {
        return marketPrice == null ? salePrice : marketPrice;
    }

    /**
     * 覆盖保存本店 SKU：有 skuId 则更新，无则新增；编辑时未提交的旧 SKU 逻辑删除
     *
     * @param productId 商品ID
     * @param skus      SKU 入参列表
     * @param editing   是否编辑场景
     */
    private void replaceMerchantSkus(Long productId, List<MallProductMerchantSkuSaveApiParams> skus, boolean editing) {
        Set<Long> keepIds = new HashSet<>();
        List<MallProductSku> existing = editing
                ? mallProductSkuService.selectMallProductSkuList(MallProductSku.builder().productId(productId).build())
                : new ArrayList<>();
        for (MallProductMerchantSkuSaveApiParams skuParams : skus) {
            MallProductSku sku = MallProductSku.builder()
                    .skuId(skuParams.getSkuId())
                    .productId(productId)
                    .skuName(skuParams.getSkuName().trim())
                    .marketPrice(defaultMarketPrice(skuParams.getMarketPrice(), skuParams.getSalePrice()))
                    .salePrice(skuParams.getSalePrice())
                    .stock(skuParams.getStock())
                    .salesCount(0)
                    .status(skuParams.getStatus() == null ? 0 : skuParams.getStatus())
                    .delFlag(0)
                    .build();
            if (sku.getSkuId() == null) {
                mallProductSkuService.insertMallProductSku(sku);
            } else {
                MallProductSku owned = mallProductSkuService.selectMallProductSkuById(sku.getSkuId());
                if (owned == null || !Objects.equals(owned.getProductId(), productId)
                        || Objects.equals(owned.getDelFlag(), 1)) {
                    throw new ServiceException("SKU不存在或不属于本商品");
                }
                sku.setSalesCount(owned.getSalesCount());
                mallProductSkuService.updateMallProductSku(sku);
            }
            keepIds.add(sku.getSkuId());
        }
        if (editing) {
            for (MallProductSku old : existing) {
                if (old.getDelFlag() != null && old.getDelFlag() == 1) {
                    continue;
                }
                if (!keepIds.contains(old.getSkuId())) {
                    mallProductSkuService.logicDeleteMallProductSkuById(old.getSkuId());
                }
            }
        }
    }

    /**
     * 校验商品归属本店
     *
     * @param productId  商品ID
     * @param merchantId 本店商家ID
     * @return 商品
     */
    private MallProduct requireProductOwnedByMerchant(Long productId, Long merchantId) {
        MallProduct product = mallProductMapper.selectMallProductById(productId);
        if (product == null || Objects.equals(product.getDelFlag(), 1)) {
            throw new ServiceException("商品不存在");
        }
        if (!Objects.equals(product.getMerchantId(), merchantId)) {
            throw new ServiceException("无权操作他店商品");
        }
        return product;
    }

    /**
     * 图集列表转 JSON 字符串入库；空列表存 []
     */
    private String toGalleryJson(List<String> galleryImages) {
        if (galleryImages == null || galleryImages.isEmpty()) {
            return "[]";
        }
        List<String> cleaned = new ArrayList<>();
        for (String path : galleryImages) {
            if (StrUtil.isNotBlank(path)) {
                cleaned.add(path.trim());
            }
        }
        return JSONUtil.toJsonStr(cleaned);
    }

    /**
     * 将 Mapper 映射的 galleryImagesJson 解析为 galleryImages 列表
     */
    private void fillGalleryImages(List<MallProductApiResult> list) {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (MallProductApiResult item : list) {
            fillGalleryImages(item);
        }
    }

    /**
     * 单条商品图集反序列化；无图时为空列表，主图空串归一
     */
    private void fillGalleryImages(MallProductApiResult product) {
        if (product == null) {
            return;
        }
        if (product.getMainImage() == null) {
            product.setMainImage("");
        }
        if (product.getIntro() == null) {
            product.setIntro("");
        }
        String json = product.getGalleryImagesJson();
        if (StrUtil.isBlank(json)) {
            product.setGalleryImages(Collections.emptyList());
            return;
        }
        try {
            List<String> images = JSONUtil.toList(json, String.class);
            product.setGalleryImages(images == null ? Collections.emptyList() : images);
        } catch (Exception ex) {
            product.setGalleryImages(Collections.emptyList());
        }
    }
}
