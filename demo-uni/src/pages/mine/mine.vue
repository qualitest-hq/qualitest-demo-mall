<template>
  <!-- 我的 Tab：登录状态、去登录或本地退出 -->
  <view class="page">
    <view class="card">
      <text class="title">{{ appConfig.name }}</text>
      <text class="sub">{{ loginHint }}</text>
      <wd-button v-if="!user.isLoggedIn" type="primary" size="medium" @click="goLogin">
        去登录
      </wd-button>
      <wd-button v-else type="info" size="medium" plain @click="onLogout">退出</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 我的页。
 * 根据登录态展示昵称或游客提示；可跳转登录页，或仅清除本地登录信息。
 */
import { computed } from "vue";
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
}

.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 48rpx 32rpx;
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
</style>
