<template>
  <view class="page">
    <view class="card">
      <text class="title">入驻审核中</text>
      <text class="desc">
        店铺「{{ apply?.merchantName || "—" }}」已提交，预计 1–2 个工作日完成审核。
      </text>
      <view class="meta">
        <text>联系人：{{ apply?.contactName || "—" }}</text>
        <text>电话：{{ apply?.contactPhone || "—" }}</text>
      </view>
      <wd-button type="info" plain block :loading="withdrawing" @click="onWithdraw">撤销申请</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getLatestSettleApply, withdrawApply } from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS, type MerchantApply } from "@/types/merchant";

const apply = ref<MerchantApply | null>(null);
const withdrawing = ref(false);

async function load() {
  const latest = await getLatestSettleApply();
  if (!latest || Number(latest.status) !== APPLY_STATUS.PENDING) {
    uni.redirectTo({ url: ROUTES.MERCHANT_INDEX });
    return;
  }
  apply.value = latest;
}

function onWithdraw() {
  if (!apply.value?.applyId) {
    return;
  }
  uni.showModal({
    title: "撤销申请",
    content: "确认撤销当前入驻申请？",
    success: async (res) => {
      if (!res.confirm || !apply.value?.applyId) {
        return;
      }
      withdrawing.value = true;
      try {
        await withdrawApply(apply.value.applyId);
        uni.showToast({ title: "已撤销", icon: "success" });
        setTimeout(() => {
          uni.redirectTo({ url: ROUTES.MERCHANT_APPLY });
        }, 400);
      } catch {
        /* request toast */
      } finally {
        withdrawing.value = false;
      }
    },
  });
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
.desc {
  display: block;
  margin: 20rpx 0 28rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 36rpx;
  font-size: 26rpx;
  color: #999;
}
</style>
