<template>
  <!-- 首页 Tab：品牌区 + 联调探测区（逛购列表后续再接） -->
  <view class="page">
    <view class="hero">
      <text class="brand">{{ appConfig.name }}</text>
      <text class="slogan">{{ appConfig.slogan }}</text>
      <text class="hint">{{ appConfig.demoHint }}</text>
    </view>

    <view class="probe">
      <view class="probe-row">
        <text class="label">示意价</text>
        <AppPrice :value="12.8" />
      </view>
      <wd-button type="primary" size="medium" @click="pingApi">探测分类接口</wd-button>
      <text class="probe-msg">{{ probeMsg }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 首页。
 * 展示品牌文案与价格组件；提供一次分类列表请求，用于确认后端地址与请求封装可用。
 */
import { ref } from "vue";
import AppPrice from "@/components/AppPrice.vue";
import { appConfig } from "@/config/app";
import { request } from "@/utils/request";

/** 探测按钮旁的结果文案 */
const probeMsg = ref("未探测");

/** 请求启用中的分类列表；失败不弹 toast，文案写在页面上 */
async function pingApi() {
  probeMsg.value = "请求中…";
  try {
    await request({
      url: "/api/mall/mallCategory/enabled",
      method: "GET",
      showError: false,
    });
    probeMsg.value = "已连通后端";
  } catch (e) {
    probeMsg.value = e instanceof Error ? e.message : "请求失败（页面仍可用）";
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.hero {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 48rpx 32rpx;
  margin-bottom: 32rpx;
}

.brand {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: $color-brand;
}

.slogan {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: $color-ink;
}

.hint {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.probe {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 32rpx;
}

.probe-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.label {
  color: #666;
  font-size: 26rpx;
}

.probe-msg {
  display: block;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
