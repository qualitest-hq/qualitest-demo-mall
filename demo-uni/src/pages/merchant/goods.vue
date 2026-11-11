<template>
  <view class="page">
    <view class="card">
      <text class="title">商品管理</text>
      <text class="desc">
        商品归属商家的接口与表字段尚未合入本批，当前仅保留入口。后续将支持本店商品列表、新建编辑与上下架。
      </text>
      <wd-button type="primary" plain block @click="goDash">返回工作台</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ROUTES } from "@/constants/routes";

function goDash() {
  uni.navigateBack({
    fail: () => uni.redirectTo({ url: ROUTES.MERCHANT_DASH }),
  });
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
}
.title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: $color-ink;
}
.desc {
  display: block;
  margin: 20rpx 0 36rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
