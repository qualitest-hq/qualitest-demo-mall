<template>
  <view class="page">
    <scroll-view v-if="!pickMode" scroll-x class="tabs" :show-scrollbar="false">
      <view
        v-for="tab in COUPON_TABS"
        :key="tab.value"
        class="tab"
        :class="{ on: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </scroll-view>

    <view v-if="!pickMode && activeTab === 0" class="claim panel">
      <view class="claim-hd">
        <text class="claim-title">可领取优惠券</text>
        <text class="claim-tip" @click="loadClaimable">刷新</text>
      </view>
      <view v-if="claimLoading" class="mini-state">加载中…</view>
      <view v-else-if="!claimList.length" class="mini-state">暂无可领券</view>
      <view v-for="c in claimList" :key="String(c.couponId)" class="coupon claim-item">
        <view class="left">
          <AppPrice :value="c.discountAmount" size="lg" />
          <text class="th">满{{ formatAmount(c.thresholdAmount) }}可用</text>
        </view>
        <view class="mid">
          <text class="c-name">{{ c.couponName || "优惠券" }}</text>
          <text class="c-time">至 {{ shortTime(c.validEndTime) }}</text>
        </view>
        <wd-button size="small" type="primary" plain @click="onReceive(c)">领取</wd-button>
      </view>
    </view>

    <view v-if="pickMode" class="pick-bar panel" @click="pickNone">
      <text>不使用优惠券</text>
      <text class="arrow">›</text>
    </view>

    <view v-if="loading && !mineList.length" class="state">加载中…</view>
    <view v-else-if="!mineList.length" class="state">{{ emptyText }}</view>
    <view v-else class="list">
      <view
        v-for="row in displayList"
        :key="String(row.accountCouponId)"
        class="coupon"
        @click="onPick(row)"
      >
        <view class="left" :class="{ dim: activeTab !== 0 && !pickMode }">
          <AppPrice :value="row.discountAmount" size="lg" />
          <text class="th">满{{ formatAmount(row.thresholdAmount) }}可用</text>
        </view>
        <view class="mid">
          <text class="c-name">{{ row.couponName || "优惠券" }}</text>
          <text class="c-time">{{ validityText(row) }}</text>
        </view>
        <text v-if="pickMode" class="use">使用</text>
      </view>
    </view>
    <view v-if="loadingMore" class="foot">加载中…</view>
    <view v-else-if="noMore && mineList.length" class="foot">没有更多了</view>
  </view>
</template>

<script setup lang="ts">
/**
 * 优惠券页：领取、我的券分 Tab 查看；确认订单可带 pick 进入选券。
 */
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { listAvailableCoupons, listMyAvailableCoupons, listMyCoupons, receiveCoupon } from "@/api/coupon";
import { STORAGE_KEYS } from "@/constants/storage";
import type { AccountCoupon, CouponTemplate } from "@/types/coupon";
import { setStorage } from "@/utils/storage";

/** Tab：0 未使用，1 已使用，2 已过期 */
const COUPON_TABS = [
  { label: "未使用", value: 0 },
  { label: "已使用", value: 1 },
  { label: "已过期", value: 2 },
] as const;

const activeTab = ref(0);
/** 确认订单选券模式 */
const pickMode = ref(false);
/** 选券时传入的订单金额 */
const orderAmount = ref<number | string>("");

const loading = ref(false);
const loadingMore = ref(false);
const mineList = ref<AccountCoupon[]>([]);
const pageNum = ref(1);
const total = ref(0);
const pageSize = 10;

const claimList = ref<CouponTemplate[]>([]);
const claimLoading = ref(false);

const noMore = computed(() => mineList.value.length >= total.value && total.value > 0);

const emptyText = computed(() => {
  if (pickMode.value) return "暂无可用优惠券";
  if (activeTab.value === 0) return "暂无未使用优惠券";
  if (activeTab.value === 1) return "暂无已使用记录";
  return "暂无过期优惠券";
});

const displayList = computed(() => mineList.value);

function formatAmount(v?: number | string) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}

function shortTime(t?: string) {
  if (!t) return "—";
  return t.slice(0, 10);
}

function validityText(row: AccountCoupon) {
  if (row.validEndTime) {
    return `有效期至 ${shortTime(row.validEndTime)}`;
  }
  return "";
}

/** 加载可领取券模板 */
async function loadClaimable() {
  claimLoading.value = true;
  try {
    const page = await listAvailableCoupons({ pageNum: 1, pageSize: 20 });
    claimList.value = page?.rows || [];
  } catch {
    claimList.value = [];
  } finally {
    claimLoading.value = false;
  }
}

/** 加载我的券；选券模式拉可用券，过期 Tab 传 expired */
async function loadMine(reset: boolean) {
  if (reset) {
    pageNum.value = 1;
    loading.value = true;
  } else {
    if (loadingMore.value || noMore.value) return;
    loadingMore.value = true;
  }
  try {
    if (pickMode.value) {
      const rows = await listMyAvailableCoupons(orderAmount.value || 0);
      mineList.value = rows || [];
      total.value = mineList.value.length;
    } else {
      const page = await listMyCoupons(
        activeTab.value === 2
          ? { expired: true, pageNum: pageNum.value, pageSize }
          : { useStatus: activeTab.value, pageNum: pageNum.value, pageSize },
      );
      const rows = page?.rows || [];
      total.value = Number(page?.total || 0);
      mineList.value = reset ? rows : mineList.value.concat(rows);
    }
  } catch {
    if (reset) mineList.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
    uni.stopPullDownRefresh();
  }
}

function switchTab(value: number) {
  if (activeTab.value === value) return;
  activeTab.value = value;
  loadMine(true);
}

async function onReceive(c: CouponTemplate) {
  if (!c.couponId) return;
  try {
    await receiveCoupon(c.couponId);
    uni.showToast({ title: "领取成功", icon: "success" });
    await Promise.all([loadClaimable(), loadMine(true)]);
  } catch {
    /* toast */
  }
}

/** 明确不使用优惠券并返回确认订单页 */
function pickNone() {
  setStorage(STORAGE_KEYS.CHECKOUT_PICK_COUPON, { accountCouponId: "0" });
  uni.navigateBack();
}

/** 选中一张券并返回确认订单页 */
function onPick(row: AccountCoupon) {
  if (!pickMode.value) return;
  if (!row.accountCouponId) return;
  setStorage(STORAGE_KEYS.CHECKOUT_PICK_COUPON, row);
  uni.navigateBack();
}

onLoad((q) => {
  pickMode.value = String(q?.pick || "") === "1";
  if (q?.orderAmount !== undefined) {
    orderAmount.value = q.orderAmount as string;
  }
  if (pickMode.value) {
    uni.setNavigationBarTitle({ title: "选择优惠券" });
  }
});

onShow(() => {
  if (!pickMode.value && activeTab.value === 0) {
    loadClaimable();
  }
  loadMine(true);
});

onPullDownRefresh(() => {
  if (!pickMode.value && activeTab.value === 0) {
    loadClaimable();
  }
  loadMine(true);
});

onReachBottom(() => {
  if (pickMode.value || noMore.value) return;
  pageNum.value += 1;
  loadMine(false);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 32rpx;
  background: $color-bg;
  box-sizing: border-box;
}

.tabs {
  white-space: nowrap;
  padding: 16rpx 20rpx;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.tab {
  display: inline-block;
  margin-right: 32rpx;
  padding-bottom: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.tab.on {
  color: $color-brand;
  font-weight: 650;
  border-bottom: 4rpx solid $color-brand;
}

.panel {
  margin: 20rpx;
  background: $color-surface;
  border-radius: $radius-base;
  padding: 20rpx 24rpx;
}

.claim-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.claim-title {
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
}

.claim-tip {
  font-size: 24rpx;
  color: $color-brand;
}

.mini-state {
  padding: 24rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.coupon {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  background: $color-surface;
  border-radius: $radius-base;
}

.claim-item {
  margin: 16rpx 0 0;
  padding: 20rpx 0 0;
  background: transparent;
  border-top: 1px dashed #eee;
}

.left {
  width: 160rpx;
  text-align: center;
  flex-shrink: 0;
}

.left.dim {
  opacity: 0.55;
}

.th {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #888;
}

.mid {
  flex: 1;
  min-width: 0;
}

.c-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-ink;
}

.c-time {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.use {
  font-size: 26rpx;
  color: $color-brand;
}

.pick-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: $color-ink;
}

.arrow {
  color: #ccc;
  font-size: 32rpx;
}

.state {
  padding: 80rpx 32rpx;
  text-align: center;
  color: #999;
}

.foot {
  padding: 24rpx;
  text-align: center;
  font-size: 24rpx;
  color: #aaa;
}
</style>
