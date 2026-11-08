<template>
  <!-- 购物车 Tab 占位，保证底部导航可切换 -->
  <view class="page">
    <wd-status-tip image="content" tip="购物车占位 · 待接入" />
  </view>
</template>

<script setup lang="ts">
/** 购物车页。当前仅占位，未登录也可打开且不白屏。 */
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 80rpx 32rpx;
  box-sizing: border-box;
  background: $color-bg;
}
</style>
