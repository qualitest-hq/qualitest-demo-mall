<template>
  <view class="page">
    <view class="card">
      <text class="title">入驻未通过</text>
      <text class="reason">{{ apply?.rejectReason || "资料不完整，请修改后重新提交。" }}</text>
      <wd-button type="primary" block @click="goReapply">修改并重提</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getLatestSettleApply } from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS, type MerchantApply } from "@/types/merchant";

const apply = ref<MerchantApply | null>(null);

async function load() {
  const latest = await getLatestSettleApply();
  if (!latest || Number(latest.status) !== APPLY_STATUS.REJECTED) {
    uni.redirectTo({ url: ROUTES.MERCHANT_INDEX });
    return;
  }
  apply.value = latest;
}

function goReapply() {
  uni.redirectTo({ url: ROUTES.MERCHANT_APPLY });
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
  font-size: 36rpx;
  font-weight: 600;
  color: $color-ink;
}
.reason {
  display: block;
  margin: 24rpx 0 40rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  background: #fff1f0;
  color: $color-price;
  font-size: 28rpx;
  line-height: 1.6;
}
</style>
