<template>
  <view class="page">
    <text class="tip">正在进入商家中心…</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 商家中心入口：按开店 / 入驻申请状态分流到对应页面。
 */
import { onShow } from "@dcloudio/uni-app";
import { redirectMerchantGate } from "@/composables/useMerchantGate";
import { ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";

const user = useUserStore();

onShow(() => {
  if (!user.isLoggedIn) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  redirectMerchantGate().catch((error) => {
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg;
}
.tip {
  color: #999;
  font-size: 28rpx;
}
</style>
