<template>
  <view class="page">
    <view class="pay-ok">
      <view class="circle">✓</view>
      <text class="t">支付成功</text>
      <text v-if="orderNo" class="s">订单 {{ orderNo }}</text>
      <text v-else-if="orderId" class="s">订单 {{ orderId }}</text>
      <text class="s">商家即将发货</text>
      <view class="amt">
        <AppPrice :value="payAmount" size="xl" />
      </view>
      <view class="btns">
        <wd-button type="info" size="large" plain custom-style="flex:1;" @click="goHome">
          返回首页
        </wd-button>
        <wd-button type="primary" size="large" custom-style="flex:1;" @click="goOrders">
          查看订单
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 支付成功结果页。
 * 展示成功标识、订单号（优先编号）、实付金额与发货提示；
 * 「返回首页」切 Tab；「查看订单」在订单列表未接入前仅提示。
 */
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { ROUTES } from "@/constants/routes";

/** 订单主键；无编号时用于展示 */
const orderId = ref("");
/** 订单编号 */
const orderNo = ref("");
/** 实付金额 */
const payAmount = ref("0");

/** 切回首页 Tab */
function goHome() {
  uni.switchTab({ url: ROUTES.HOME });
}

/** 订单列表页尚未接入 */
function goOrders() {
  uni.showToast({ title: "订单页即将开放", icon: "none" });
}

/** 从收银台跳转参数读取展示信息 */
onLoad((q) => {
  orderId.value = String(q?.orderId || "");
  orderNo.value = String(q?.orderNo || "");
  payAmount.value = String(q?.payAmount || "0");
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  background: $color-bg;
}

.pay-ok {
  margin-top: 0;
  text-align: center;
  padding: 96rpx 48rpx 48rpx;
  background: #fff;
}

.circle {
  width: 128rpx;
  height: 128rpx;
  margin: 0 auto 32rpx;
  border-radius: 50%;
  background: $color-brand;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  font-weight: 700;
}

.t {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $color-ink;
  margin-bottom: 16rpx;
}

.s {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.amt {
  margin: 24rpx 0 48rpx;
}

.btns {
  display: flex;
  gap: 20rpx;
}
</style>
