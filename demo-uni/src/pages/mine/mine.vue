<template>
  <!-- 我的 Tab：登录状态、商家中心入口、本地退出 -->
  <view class="page">
    <view class="card">
      <text class="title">{{ appConfig.name }}</text>
      <text class="sub">{{ loginHint }}</text>
      <wd-button v-if="!user.isLoggedIn" type="primary" size="medium" @click="goLogin">
        去登录
      </wd-button>
      <wd-button v-else type="info" size="medium" plain @click="onLogout">退出</wd-button>
    </view>

    <view class="card menu">
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
 * 根据登录态展示昵称或游客提示；可跳转登录、商家中心，或仅清除本地登录信息。
 */
import { computed } from "vue";
import { openMerchantCenter } from "@/composables/useMerchantGate";
import { appConfig } from "@/config/app";
import { ROUTES } from "@/constants/routes";
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

.menu {
  padding: 0;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
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
