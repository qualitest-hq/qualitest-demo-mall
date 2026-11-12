<template>
  <view class="page">
    <view class="panel">
      <text class="title">物流详情</text>
      <text class="sub">订单 {{ orderNo || orderId || "—" }}</text>
    </view>
    <view class="panel">
      <text class="empty-title">暂无运单信息</text>
      <text class="empty-desc">
        商家发货后将展示承运商与轨迹。本批为占位页，真实物流随后续批次接入。
      </text>
    </view>
    <view v-if="receiverAddress" class="panel">
      <text class="lab">收货地址</text>
      <text class="addr">{{ receiverName }} {{ receiverPhone }}</text>
      <text class="addr">{{ receiverAddress }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 物流占位页：本批无运单字段，仅展示订单与收货摘要。
 */
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getMyOrder } from "@/api/order";

const orderId = ref("");
const orderNo = ref("");
const receiverName = ref("");
const receiverPhone = ref("");
const receiverAddress = ref("");

onLoad(async (q) => {
  orderId.value = String(q?.orderId || "");
  if (!orderId.value) return;
  try {
    const order = await getMyOrder(orderId.value);
    orderNo.value = order?.orderNo || "";
    receiverName.value = order?.receiverName || "";
    receiverPhone.value = order?.receiverPhone || "";
    receiverAddress.value = order?.receiverAddress || "";
  } catch {
    /* 占位页失败时保持空态 */
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  padding: 20rpx 0;
  box-sizing: border-box;
}

.panel {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: $radius-base;
  padding: 28rpx 24rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $color-brand;
}

.sub,
.lab {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #888;
}

.empty-title {
  display: block;
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.addr {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $color-ink;
}
</style>
