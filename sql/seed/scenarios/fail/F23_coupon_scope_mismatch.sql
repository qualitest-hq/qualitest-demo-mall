-- ============================================================================
-- 优惠券适用范围不匹配：用户持有仅限分类 1001 的券，购物车商品为分类 1002，下单应失败
-- ============================================================================

SET NAMES utf8mb4;

UPDATE `coupon` SET `receive_count` = 1, `update_time` = '2026-06-21 12:00:00' WHERE `coupon_id` = 3003;

INSERT INTO `account_coupon` (`account_coupon_id`, `coupon_id`, `account_id`, `coupon_name`, `threshold_amount`, `discount_amount`, `scope_type`, `scope_ids`, `valid_start_time`, `valid_end_time`, `use_status`, `receive_time`, `use_time`, `order_id`, `del_flag`, `create_time`, `update_time`) VALUES
(6010, 3003, 30001, '数码专享满50减5', 50.00, 5.00, 1, '1001', '2026-01-01 00:00:00', '2027-12-31 23:59:59', 0, '2026-06-21 12:00:00', NULL, 0, 0, '2026-06-21 12:00:00', '2026-06-21 12:00:00');

INSERT INTO `mall_cart` (`cart_id`, `account_id`, `product_id`, `sku_id`, `quantity`, `selected`, `create_time`, `update_time`) VALUES
(5030, 30001, 2002, 2111, 1, 1, '2026-06-21 12:00:00', '2026-06-21 12:00:00');
