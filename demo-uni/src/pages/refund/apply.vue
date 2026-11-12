<template>
  <view class="page">
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="preview && preview.canRefund === false" class="state">
      {{ preview.refuseReason || "当前订单不可退款" }}
    </view>
    <template v-else-if="preview">
      <view class="panel">
        <view v-for="(it, idx) in preview.items || []" :key="String(it.orderItemId || idx)" class="line">
          <view class="body">
            <text class="name">{{ it.productName }}</text>
            <text class="sku">{{ it.skuName }} · 可退 {{ it.refundableQuantity || 0 }}</text>
          </view>
          <AppPrice :value="it.refundAmount" />
        </view>
        <view class="sum">
          可退合计
          <AppPrice :value="preview.refundAmount" size="lg" />
        </view>
      </view>

      <view class="panel cells">
        <view class="cell-row" @click="pickReason">
          <text class="lab">退款原因</text>
          <text class="val">{{ reason || "请选择" }}</text>
          <text class="more">›</text>
        </view>
        <view class="cell-row">
          <text class="lab">类型</text>
          <text class="val">仅退款</text>
        </view>
      </view>

      <view class="bar-space" />
      <view class="sticky-bar">
        <wd-button
          type="primary"
          block
          :loading="submitting"
          :disabled="!reason"
          custom-style="border-radius:999px;"
          @click="onSubmit"
        >
          提交申请
        </wd-button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
/**
 * 薄退款申请：preview 后整单可退数量提交仅退款。
 */
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { applyRefund, previewRefund } from "@/api/orderRefund";
import { openRefundList } from "@/constants/routes";
import type { MallOrderRefundPreview } from "@/types/orderRefund";

const REASONS = ["不想要了", "商品破损", "少件/漏发", "与描述不符", "其他"];

const loading = ref(true);
const submitting = ref(false);
const orderId = ref("");
const preview = ref<MallOrderRefundPreview | null>(null);
const reason = ref("");

async function loadPreview() {
  loading.value = true;
  try {
    preview.value = await previewRefund({
      orderId: orderId.value,
      refundType: 1,
      refundReason: "预览",
    });
  } catch (e: unknown) {
    preview.value = null;
    const msg = e instanceof Error ? e.message : "预览失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

function pickReason() {
  uni.showActionSheet({
    itemList: REASONS,
    success: (res) => {
      reason.value = REASONS[res.tapIndex] || "";
    },
  });
}

async function onSubmit() {
  if (!preview.value?.canRefund || !reason.value) return;
  const items = (preview.value.items || [])
    .filter((it) => Number(it.refundableQuantity) > 0 && it.orderItemId)
    .map((it) => ({
      orderItemId: String(it.orderItemId),
      refundQuantity: Number(it.refundableQuantity),
    }));
  if (!items.length) {
    uni.showToast({ title: "无可退商品", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await applyRefund({
      orderId: orderId.value,
      refundType: 1,
      refundReason: reason.value,
      items,
    });
    uni.showToast({ title: "已提交申请", icon: "none" });
    setTimeout(() => openRefundList(), 400);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "提交失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    submitting.value = false;
  }
}

onLoad((q) => {
  orderId.value = String(q?.orderId || "");
  if (orderId.value) loadPreview();
  else {
    loading.value = false;
    uni.showToast({ title: "缺少订单", icon: "none" });
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.state {
  text-align: center;
  color: #999;
  padding: 120rpx 32rpx;
  font-size: 26rpx;
}

.panel {
  background: #fff;
  margin: 20rpx;
  border-radius: $radius-base;
  padding: 24rpx;
}

.line {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.line:last-of-type {
  border-bottom: 0;
}

.name {
  display: block;
  font-size: 28rpx;
}

.sku {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #888;
}

.sum {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8rpx;
  margin-top: 16rpx;
  font-size: 26rpx;
}

.cells .cell-row {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 26rpx;
}

.cells .cell-row:last-child {
  border-bottom: 0;
}

.lab {
  width: 140rpx;
  color: #888;
}

.val {
  flex: 1;
  color: $color-ink;
}

.more {
  color: #ccc;
}

.bar-space {
  height: 40rpx;
}

.sticky-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
}
</style>
