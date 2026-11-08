<template>
  <!-- 登录页占位：令牌失效重定向落点；密码登录后续再接 -->
  <view class="page">
    <text class="brand">{{ appConfig.name }}</text>
    <text class="tip">登录页占位 · 密码登录待接入</text>
    <wd-button type="primary" size="medium" block @click="goHome">先去逛逛</wd-button>
  </view>
</template>

<script setup lang="ts">
/**
 * 登录页。
 * 当前为占位，保证未登录跳转有目标页；可切回首页继续浏览。
 */
import { appConfig } from "@/config/app";
import { ROUTES } from "@/constants/routes";

/** 切换到首页 Tab */
function goHome() {
  uni.switchTab({ url: ROUTES.HOME });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 120rpx 48rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.brand {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: $color-brand;
  margin-bottom: 16rpx;
}

.tip {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 48rpx;
}
</style>
