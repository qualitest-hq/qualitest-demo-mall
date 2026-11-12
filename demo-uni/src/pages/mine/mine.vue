<template>
  <!-- 我的 Tab：登录状态、订单入口、商家中心 -->
  <view class="page">
    <view class="card">
      <text class="title">{{ appConfig.name }}</text>
      <text class="sub">{{ loginHint }}</text>
      <wd-button v-if="!user.isLoggedIn" type="primary" size="medium" @click="goLogin">
        去登录
      </wd-button>
      <wd-button v-else type="info" size="medium" plain @click="onLogout">退出</wd-button>
    </view>

    <view class="card orders-card">
      <view class="orders-hd" @click="goOrders()">
        <text class="item-title">我的订单</text>
        <text class="all">全部 ›</text>
      </view>
      <view class="mine-orders">
        <view
          v-for="entry in MINE_ORDER_ENTRIES"
          :key="entry.value"
          class="entry"
          @click="goOrders(entry.value)"
        >
          <view class="ico">{{ entry.label.slice(0, 1) }}</view>
          <text>{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <view class="card menu">
      <view class="item" @click="goRefunds">
        <view>
          <text class="item-title">我的退款</text>
          <text class="item-desc">申请进度与撤销</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goMerchant">
        <view>
          <text class="item-title">商家中心</text>
          <text class="item-desc">入驻开店 · 店铺资料 · 工作台</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 我的页。
 * 订单五宫格、退款入口、商家中心；未登录点订单会先跳登录。
 */
import { computed } from "vue";
import { openMerchantCenter } from "@/composables/useMerchantGate";
import { appConfig } from "@/config/app";
import { MINE_ORDER_ENTRIES } from "@/constants/orderStatus";
import { openOrders, openRefundList, ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";

const user = useUserStore();

/** 登录状态说明文案 */
const loginHint = computed(() =>
  user.isLoggedIn
    ? user.profile?.nickName || "已登录"
    : "未登录 · 可先逛购",
);

/** 打开登录页 */
function goLogin() {
  uni.navigateTo({ url: ROUTES.LOGIN });
}

/** 进入订单列表；未登录先登录 */
function goOrders(orderStatus?: number) {
  if (!user.isLoggedIn) {
    goLogin();
    return;
  }
  openOrders(orderStatus);
}

/** 我的退款 */
function goRefunds() {
  if (!user.isLoggedIn) {
    goLogin();
    return;
  }
  openRefundList();
}

/** 进入商家中心（未登录会先跳登录） */
function goMerchant() {
  openMerchantCenter();
}

/** 只清本地登录态，不请求服务端 */
function onLogout() {
  user.logout();
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $color-brand;
}

.sub {
  display: block;
  margin: 16rpx 0 32rpx;
  font-size: 26rpx;
  color: #666;
}

.orders-card {
  padding: 28rpx 24rpx 20rpx;
}

.orders-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.all {
  font-size: 24rpx;
  color: #999;
}

.mine-orders {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
  font-size: 22rpx;
  color: #555;
  gap: 8rpx 0;
}

.entry {
  padding: 8rpx 0;
}

.ico {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 8rpx;
  border-radius: 50%;
  background: #eaf4f0;
  color: $color-brand;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 650;
}

.menu {
  padding: 0;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
  border-bottom: 0;
}

.item-title {
  display: block;
  font-size: 30rpx;
  color: $color-ink;
  font-weight: 500;
}

.item-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.arrow {
  color: #ccc;
  font-size: 36rpx;
}
</style>
