<template>
  <view class="page">
    <view class="hero card">
      <image v-if="logoUrl" class="logo" :src="logoUrl" mode="aspectFill" />
      <view v-else class="logo placeholder">店</view>
      <view class="hero-main">
        <text class="name">{{ merchant?.merchantName || "我的店铺" }}</text>
        <text class="status">{{ openStatusText }} · {{ merchantStatusText }}</text>
      </view>
    </view>

    <view class="stats">
      <view class="stat" @click="goGoods">
        <text class="lab">在售商品</text>
        <text class="num">—</text>
        <text class="hint">去管理 ›</text>
      </view>
      <view class="stat disabled">
        <text class="lab">待发货</text>
        <text class="num">—</text>
        <text class="hint">后置开放</text>
      </view>
      <view class="stat disabled">
        <text class="lab">待售后</text>
        <text class="num">—</text>
        <text class="hint">后置开放</text>
      </view>
    </view>

    <view class="card menu">
      <view class="item" @click="goGoods">
        <text>商品管理</text>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goProfile">
        <text>店铺资料</text>
        <text class="arrow">›</text>
      </view>
      <view class="item disabled">
        <text>订单发货</text>
        <text class="tag">后置</text>
      </view>
      <view class="item disabled">
        <text>售后处理</text>
        <text class="tag">后置</text>
      </view>
    </view>

    <view v-if="profilePending" class="notice" @click="goProfile">
      有资料变更待审核，点此查看 ›
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getLatestProfileApply, getMyMerchant } from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS, type Merchant } from "@/types/merchant";
import { resolveResourceUrl } from "@/utils/resource";

const merchant = ref<Merchant | null>(null);
const profilePending = ref(false);

const logoUrl = computed(() => resolveResourceUrl(merchant.value?.logo));
const openStatusText = computed(() =>
  Number(merchant.value?.openStatus) === 0 ? "打烊" : "营业中",
);
const merchantStatusText = computed(() =>
  Number(merchant.value?.status) === 1 ? "已停用" : "正常",
);

async function load() {
  const mine = await getMyMerchant();
  if (!mine?.merchantId) {
    uni.redirectTo({ url: ROUTES.MERCHANT_INDEX });
    return;
  }
  merchant.value = mine;
  const profile = await getLatestProfileApply();
  profilePending.value = Number(profile?.status) === APPLY_STATUS.PENDING;
}

function goGoods() {
  uni.navigateTo({ url: ROUTES.MERCHANT_GOODS });
}

function goProfile() {
  uni.navigateTo({ url: ROUTES.MERCHANT_PROFILE });
}

onShow(() => {
  load().catch((error) => {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  });
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: $color-bg;
}
.card {
  background: $color-surface;
  border-radius: $radius-base;
}
.hero {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}
.logo {
  width: 112rpx;
  height: 112rpx;
  border-radius: 16rpx;
  background: #eee;
}
.logo.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: $color-brand;
  font-size: 40rpx;
}
.hero-main {
  flex: 1;
  min-width: 0;
}
.name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: $color-ink;
}
.status {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #888;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.stat {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 24rpx 16rpx;
}
.stat.disabled {
  opacity: 0.55;
}
.lab {
  display: block;
  font-size: 22rpx;
  color: #888;
}
.num {
  display: block;
  margin: 10rpx 0 6rpx;
  font-size: 40rpx;
  font-weight: 600;
  color: $color-ink;
}
.hint {
  font-size: 20rpx;
  color: $color-brand;
}
.menu {
  overflow: hidden;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
  border-bottom: 1px solid #f2f2f2;
  font-size: 30rpx;
  color: $color-ink;
}
.item:last-child {
  border-bottom: none;
}
.item.disabled {
  color: #bbb;
}
.arrow {
  color: #ccc;
  font-size: 36rpx;
}
.tag {
  font-size: 22rpx;
  color: #aaa;
}
.notice {
  margin-top: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: $radius-base;
  background: #eef7f3;
  color: $color-brand;
  font-size: 26rpx;
}
</style>
