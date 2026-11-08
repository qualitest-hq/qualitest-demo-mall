-- ============================================================================
-- 【失败场景 F13】购物车内商品已下架再结算
-- 先有车内行，再下架 SPU；preview/create 传该 cartId 应整单失败
-- 前置: reset_test_data.bat
-- 预期: GET my 该行 available=false；POST preview cartIds=[5013] → 失败「商品已下架」
-- ============================================================================

SET NAMES utf8mb4;

INSERT INTO `mall_cart` (`cart_id`, `account_id`, `product_id`, `sku_id`, `quantity`, `selected`, `del_flag`, `create_time`, `update_time`) VALUES
(5013, 30001, 2002, 2111, 1, 1, 0, '2026-06-21 11:00:00', '2026-06-21 11:00:00');

UPDATE `mall_product` SET `shelf_status` = 0, `update_time` = '2026-06-21 11:00:00', `remark` = 'F13车内下架' WHERE `product_id` = 2002;
