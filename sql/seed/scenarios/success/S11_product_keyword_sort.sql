-- ============================================================================
-- 【成功场景 S11】商品 keyword / 排序 / 详情图文约定
-- 前置: reset_test_data.bat
-- 预期:
--   GET /api/mall/mallProduct/list?keyword=防摔 → 命中「iPhone 壳」(intro 含防摔)
--   GET .../list?sortBy=salesDesc → 按销量降序（本场景将 2002 销量置为最高）
--   GET .../2001/detail → intro 非空；mainImage 空串；galleryImages=[]
-- ============================================================================

SET NAMES utf8mb4;

UPDATE `mall_product`
SET `intro` = '透明防摔手机壳，轻薄贴合',
    `main_image` = '',
    `gallery_images` = '[]',
    `sales_count` = 3,
    `update_time` = '2026-06-21 11:30:00'
WHERE `product_id` = 2001;

UPDATE `mall_product`
SET `intro` = '纯棉短袖，透气舒适',
    `main_image` = '',
    `gallery_images` = '[]',
    `sales_count` = 10,
    `update_time` = '2026-06-21 11:30:00'
WHERE `product_id` = 2002;

UPDATE `mall_product`
SET `intro` = '精选坚果礼盒，节日送礼',
    `main_image` = '',
    `gallery_images` = '[]',
    `sales_count` = 1,
    `update_time` = '2026-06-21 11:30:00'
WHERE `product_id` = 2003;

UPDATE `mall_product_sku` SET `sales_count` = 3, `update_time` = '2026-06-21 11:30:00' WHERE `sku_id` IN (2101, 2102);
UPDATE `mall_product_sku` SET `sales_count` = 5, `update_time` = '2026-06-21 11:30:00' WHERE `sku_id` IN (2111, 2112);
UPDATE `mall_product_sku` SET `sales_count` = 1, `update_time` = '2026-06-21 11:30:00' WHERE `sku_id` IN (2121, 2122);
