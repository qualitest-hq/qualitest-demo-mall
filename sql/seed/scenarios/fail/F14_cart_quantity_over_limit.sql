-- ============================================================================
-- 【失败场景 F14】购物车单行数量超上限
-- 基线 SKU 2101 库存充足；改量到 100（上限 99）应失败
-- 前置: reset_test_data.bat
-- 预期: PUT /api/mall/mallCart/my/quantity cartId=5014 quantity=100 → 失败「单行数量不能超过99」
-- ============================================================================

SET NAMES utf8mb4;

INSERT INTO `mall_cart` (`cart_id`, `account_id`, `product_id`, `sku_id`, `quantity`, `selected`, `create_time`, `update_time`) VALUES
(5014, 30001, 2001, 2101, 2, 1, '2026-06-21 11:00:00', '2026-06-21 11:00:00');
