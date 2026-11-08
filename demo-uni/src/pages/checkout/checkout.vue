<template>
  <view class="page">
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!preview?.items?.length" class="state">
      <text>暂无待结算商品</text>
      <text class="link" @click="goCart">去购物车</text>
    </view>
    <template v-else>
      <view class="panel addr-card" @click="pickAddressHint">
        <view class="addr-body">
          <template v-if="address">
            <view class="addr-name">
              <text v-if="Number(address.isDefault) === 1" class="tag">默认</text>
              {{ address.receiverName }} {{ address.receiverPhone }}
            </view>
            <text class="addr-detail">{{ addressText }}</text>
          </template>
          <text v-else class="addr-empty">请选择收货地址</text>
        </view>
        <text class="more">›</text>
      </view>

      <view class="panel">
        <view v-for="(it, idx) in preview?.items || []" :key="idx" class="goods-line">
          <ProductThumb :name="it.productName" size="sm" />
          <view class="g-body">
            <text class="g-name">{{ it.productName }}</text>
            <text class="g-sku">{{ it.skuName }} ×{{ it.quantity }}</text>
            <AppPrice :value="it.totalAmount" />
          </view>
        </view>
      </view>

      <view class="panel cells">
        <view class="cell-row">
          <text class="lab">商品金额</text>
          <AppPrice :value="preview?.totalAmount" />
        </view>
        <view class="cell-row">
          <text class="lab">运费</text>
          <text class="val">{{ freightText }}</text>
        </view>
        <view class="cell-row" @click="toastComingSoon('优惠券')">
          <text class="lab">优惠</text>
          <text class="val muted">暂无优惠券 ›</text>
        </view>
        <view class="cell-row remark-row">
          <text class="lab">留言</text>
          <input
            v-model="remark"
            class="remark"
            placeholder="选填，给商家留言"
            maxlength="60"
          />
        </view>
      </view>

      <view class="agree">提交订单即同意《用户协议》交易条款</view>
      <view class="bar-space" />
      <view class="sticky-bar">
        <view class="sum">
          <text>合计</text>
          <AppPrice :value="preview?.payAmount" size="lg" />
        </view>
        <wd-button
          type="primary"
          size="medium"
          :loading="submitting"
          :disabled="!canSubmit"
          custom-style="border-radius:999px;padding:0 36rpx;"
          @click="onSubmit"
        >
          提交订单
        </wd-button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
/**
 * 确认订单页。
 * 支持购物车勾选结算（cartIds）与详情立即购买（buySkuId/buyQty）；
 * 展示收货地址、商品明细、金额拆分与留言，提交后创建订单并进入收银台。
 */
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import { listMyAddresses } from "@/api/account";
import { createOrder, previewOrder } from "@/api/order";
import { openPay, ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import type { AccountAddress } from "@/types/account";
import type { MallOrderPreview, MallOrderSubmitParams } from "@/types/order";
import { toastComingSoon } from "@/utils/toast";

const user = useUserStore();
/** 首屏地址与算价加载中 */
const loading = ref(true);
/** 提交创建订单中 */
const submitting = ref(false);
/** 服务端算价结果（商品行、运费、应付等） */
const preview = ref<MallOrderPreview | null>(null);
/** 当前选用的收货地址 */
const address = ref<AccountAddress | null>(null);
/** 买家留言 */
const remark = ref("");
/** 从购物车带来的行主键 */
const cartIds = ref<string[]>([]);
/** 立即购买带来的 SKU 与数量 */
const buyItems = ref<{ skuId: string; quantity: number }[]>([]);

/** 省市区+详细地址拼成一行 */
const addressText = computed(() => {
  if (!address.value) {
    return "";
  }
  const a = address.value;
  return `${a.province || ""}${a.city || ""}${a.district || ""}${a.detailAddress || ""}`;
});

/** 运费文案；金额为 0 时显示免运费 */
const freightText = computed(() => {
  const n = Number(preview.value?.freightAmount ?? 0);
  if (!Number.isFinite(n) || n <= 0) {
    return "免运费";
  }
  return `¥${n.toFixed(2)}`;
});

/** 已选地址且算价成功才允许提交 */
const canSubmit = computed(() => Boolean(address.value?.addressId && preview.value));

/** 无商品时回到购物车 Tab */
function goCart() {
  uni.switchTab({ url: ROUTES.CART });
}

/** 地址列表页尚未接入，点击仅提示 */
function pickAddressHint() {
  toastComingSoon("地址管理");
}

/**
 * 组装算价或下单请求体。
 * @param withAddress 为 true 时带上当前选中的地址主键（下单必带）
 */
function buildParams(withAddress: boolean): MallOrderSubmitParams {
  const params: MallOrderSubmitParams = {
    buyerRemark: remark.value || undefined,
  };
  if (withAddress && address.value?.addressId) {
    params.addressId = address.value.addressId;
  }
  if (cartIds.value.length) {
    params.cartIds = cartIds.value;
  } else {
    params.items = buyItems.value;
  }
  return params;
}

/** 拉取收货地址列表，优先选用默认地址 */
async function loadAddress() {
  const page = await listMyAddresses(1, 50);
  const rows = page?.rows || [];
  address.value =
    rows.find((r) => Number(r.isDefault) === 1) || rows[0] || null;
}

/** 向服务端请求结算算价 */
async function runPreview() {
  preview.value = await previewOrder(buildParams(Boolean(address.value)));
}

/**
 * 解析入参并加载地址与算价。
 * 入参二选一：cartIds 逗号分隔，或 buySkuId + buyQty。
 */
async function bootstrap(query: Record<string, string | undefined>) {
  if (!user.isLoggedIn) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  loading.value = true;
  try {
    const ids = String(query.cartIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const buySkuId = String(query.buySkuId || "");
    const buyQty = Number(query.buyQty || 1);
    if (ids.length) {
      cartIds.value = ids;
    } else if (buySkuId) {
      buyItems.value = [{ skuId: buySkuId, quantity: buyQty > 0 ? buyQty : 1 }];
    } else {
      uni.showToast({ title: "缺少结算商品", icon: "none" });
      return;
    }
    await loadAddress();
    await runPreview();
  } catch {
    preview.value = null;
  } finally {
    loading.value = false;
  }
}

/** 创建订单成功后跳转收银台 */
async function onSubmit() {
  if (!canSubmit.value || submitting.value) {
    if (!address.value) {
      uni.showToast({ title: "请先配置收货地址", icon: "none" });
    }
    return;
  }
  submitting.value = true;
  try {
    const created = await createOrder(buildParams(true));
    if (!created?.orderId) {
      uni.showToast({ title: "下单失败", icon: "none" });
      return;
    }
    openPay(created.orderId, created.payAmount ?? preview.value?.payAmount ?? 0, created.orderNo);
  } catch {
    /* 错误提示由 request 弹出 */
  } finally {
    submitting.value = false;
  }
}

onLoad((q) => {
  bootstrap((q || {}) as Record<string, string | undefined>);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 20rpx 160rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.state {
  padding: 120rpx 32rpx;
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
}

.link {
  color: $color-brand;
}

.panel {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.addr-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.addr-body {
  flex: 1;
  min-width: 0;
}

.addr-name {
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
  margin-bottom: 10rpx;
}

.tag {
  display: inline-block;
  margin-right: 8rpx;
  padding: 2rpx 8rpx;
  font-size: 20rpx;
  font-weight: 500;
  color: #fff;
  background: $color-brand;
  border-radius: 6rpx;
  vertical-align: 2rpx;
}

.addr-detail,
.addr-empty {
  display: block;
  font-size: 26rpx;
  color: #555;
  line-height: 1.4;
}

.addr-empty {
  color: #888;
}

.more {
  color: #ccc;
  font-size: 36rpx;
  line-height: 1;
}

.goods-line {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.goods-line:last-child {
  margin-bottom: 0;
}

.g-body {
  flex: 1;
  min-width: 0;
}

.g-name {
  display: block;
  font-size: 26rpx;
  color: $color-ink;
  line-height: 1.35;
}

.g-sku {
  display: block;
  margin: 8rpx 0 10rpx;
  font-size: 24rpx;
  color: #888;
}

.cells {
  padding: 0 24rpx;
}

.cell-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  min-height: 88rpx;
  border-bottom: 1px solid #f5f5f5;
  font-size: 28rpx;
}

.cell-row:last-child {
  border-bottom: none;
}

.lab {
  color: #666;
  flex-shrink: 0;
}

.val {
  color: $color-ink;
  text-align: right;
}

.val.muted {
  color: #888;
}

.remark-row {
  align-items: stretch;
}

.remark {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: $color-ink;
  height: 88rpx;
}

.agree {
  margin: 8rpx 8rpx 0;
  text-align: center;
  font-size: 22rpx;
  color: #aaa;
}

.bar-space {
  height: 20rpx;
}

.sticky-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 110rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  z-index: 10;
  box-sizing: border-box;
}

.sum {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
