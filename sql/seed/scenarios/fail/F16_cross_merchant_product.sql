-- ============================================================================
-- 【失败场景 F16】越权改他店商品
-- 辅测账号 30003 开店 5002，商品 2099 归属该店
-- 前置: reset_test_data.bat
-- 预期: 主测账号对本店接口操作 productId=2099 被拒绝
-- ============================================================================

SET NAMES utf8mb4;

INSERT INTO `merchant` (`merchant_id`, `account_id`, `merchant_name`, `category_id`, `logo`, `contact_name`, `contact_phone`, `license_files`, `open_status`, `status`, `del_flag`, `create_time`, `update_time`, `remark`) VALUES
(5002, 30003, '越权测试店', 1102, '', '李四', '13800000003', NULL, 1, 0, 0, '2026-06-21 11:25:00', '2026-06-21 11:25:00', 'F16');

INSERT INTO `mall_product` (`product_id`, `merchant_id`, `category_id`, `product_name`, `unit_name`, `market_price`, `sale_price`, `freight_amount`, `stock_total`, `sales_count`, `shelf_status`, `sort_num`, `del_flag`, `create_time`, `update_time`, `remark`) VALUES
(2099, 5002, 1001, '他店商品', '件', 19.00, 9.90, 0.00, 10, 0, 1, 99, 0, '2026-06-21 11:25:00', '2026-06-21 11:25:00', 'F16');

INSERT INTO `mall_product_sku` (`sku_id`, `product_id`, `sku_name`, `market_price`, `sale_price`, `stock`, `sales_count`, `status`, `del_flag`, `create_time`, `update_time`, `remark`) VALUES
(2199, 2099, '默认款', 19.00, 9.90, 10, 0, 0, 0, '2026-06-21 11:25:00', '2026-06-21 11:25:00', 'F16');
