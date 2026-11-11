-- ============================================================================
-- 【成功场景 S10】商家本店商品可管理
-- 基线已有演示店 5001 与商品 2001-2003；额外准备一件下架商品供上架演示
-- 前置: reset_test_data.bat
-- 预期: 主测账号本店列表可见 2004（下架）；上架后买家端可见
-- ============================================================================

SET NAMES utf8mb4;

INSERT INTO `mall_product` (`product_id`, `merchant_id`, `category_id`, `product_name`, `unit_name`, `market_price`, `sale_price`, `freight_amount`, `stock_total`, `sales_count`, `shelf_status`, `sort_num`, `del_flag`, `create_time`, `update_time`, `remark`) VALUES
(2004, 5001, 1002, '演示下架杯', '件', 39.00, 29.00, 6.00, 50, 0, 0, 4, 0, '2026-06-21 11:00:00', '2026-06-21 11:00:00', 'S10');

INSERT INTO `mall_product_sku` (`sku_id`, `product_id`, `sku_name`, `market_price`, `sale_price`, `stock`, `sales_count`, `status`, `del_flag`, `create_time`, `update_time`, `remark`) VALUES
(2141, 2004, '默认款', 39.00, 29.00, 50, 0, 0, 0, '2026-06-21 11:00:00', '2026-06-21 11:00:00', 'S10');
