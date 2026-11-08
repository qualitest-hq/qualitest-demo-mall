<template>
  <view class="page">
    <view class="pay-amount">
      <text class="lab">需支付</text>
      <AppPrice :value="payAmount" size="hero" />
    </view>

    <view class="panel">
      <view class="pay-method">
        <view class="chk on" />
        <view class="name">
          <text class="title">余额支付</text>
          <text class="sub">可用 ¥{{ balanceText }}</text>
        </view>
      </view>
      <view
        v-for="ch in placeholderChannels"
        :key="ch"
        class="pay-method muted"
        @click="toastChannel"
      >
        <view class="chk" />
        <view class="name">
          <text class="title">{{ ch }}</text>
          <text class="sub">暂未开通</text>
        </view>
      </view>
    </view>

    <view class="panel link-row" @click="onRechargeHint">
      <text class="val">{{ insufficient ? `余额不足？去充值（差 ¥${needRecharge}）` : "余额不足？去充值" }}</text>
      <text class="more">›</text>
    </view>

    <view class="legal">
      支付即表示同意《用户协议》中的交易条款，余额支付即时扣款。
    </view>

    <view class="bar-space" />
    <view class="sticky-bar">
      <wd-button
        type="primary"
        size="large"
        :loading="paying || recharging"
        :disabled="!orderId"
        custom-style="width:100%;border-radius:999px;"
        @click="onPrimary"
      >
        {{ primaryText }}
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 收银台页。
 * 主路径为余额支付（payType=3）；微信、支付宝仅作未开通占位；
 * 余额不足时可按差额模拟充值，再确认支付，成功后进入支付结果页。
 */
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { getProfile, rechargeBalance } from "@/api/account";
import { payOrder } from "@/api/order";
import { formatMoney } from "@/utils/product";
import { openPayResult, ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
/** 待支付订单主键 */
const orderId = ref("");
/** 订单编号，展示用 */
const orderNo = ref("");
/** 应付金额（路由传入） */
const payAmount = ref("0");
/** 当前账户余额 */
const balance = ref(0);
/** 支付请求进行中 */
const paying = ref(false);
/** 充值请求进行中 */
const recharging = ref(false);
/**
 * 第三方支付渠道名称列表。
 * 仅展示为未开通占位，不发起真实支付；可点选时会提示改用余额。
 */
const placeholderChannels = ["微信支付", "支付宝"] as const;

/** 可用余额两位小数字符串 */
const balanceText = computed(() => formatMoney(balance.value) || "0.00");
/** 余额是否不足以支付（加微小误差避免浮点误判） */
const insufficient = computed(() => balance.value + 1e-9 < Number(payAmount.value || 0));
/** 还需充值的差额 */
const needRecharge = computed(() => {
  const gap = Number(payAmount.value || 0) - balance.value;
  return gap > 0 ? gap.toFixed(2) : "0.00";
});
/** 底栏主按钮文案：不足时引导充值，够则确认支付 */
const primaryText = computed(() => {
  if (insufficient.value) {
    return `余额不足，先充值 ¥${needRecharge.value}`;
  }
  return `确认支付 ¥${formatMoney(payAmount.value) || "0.00"}`;
});

/** 点击占位渠道时提示使用余额 */
function toastChannel() {
  uni.showToast({ title: "请使用余额支付", icon: "none" });
}

/** 从账号资料刷新余额 */
async function loadBalance() {
  const profile = await getProfile();
  balance.value = Number(profile?.balance ?? 0);
}

/** 按当前差额向上取整后调用模拟充值，再刷新余额 */
async function onRecharge() {
  const amount = Number(needRecharge.value);
  if (!(amount > 0) || recharging.value) {
    return;
  }
  recharging.value = true;
  try {
    await rechargeBalance(Math.ceil(amount));
    await loadBalance();
    uni.showToast({ title: "充值成功", icon: "success" });
  } catch {
    /* 忽略 */
  } finally {
    recharging.value = false;
  }
}

/**
 * 充值入口点击：
 * 余额不足则直接充值差额；已够则提示独立余额页尚未开放。
 */
function onRechargeHint() {
  if (insufficient.value) {
    void onRecharge();
    return;
  }
  uni.showToast({ title: "余额页即将开放", icon: "none" });
}

/** 底栏主按钮：不足先充值，够则发起余额支付 */
function onPrimary() {
  if (insufficient.value) {
    void onRecharge();
    return;
  }
  void onPay();
}

/** 调用余额支付接口，成功后替换进入结果页 */
async function onPay() {
  if (!orderId.value || paying.value) {
    return;
  }
  if (insufficient.value) {
    uni.showToast({ title: "余额不足，请先充值", icon: "none" });
    return;
  }
  paying.value = true;
  try {
    await payOrder(orderId.value, { payType: 3 });
    openPayResult(orderId.value, payAmount.value, orderNo.value);
  } catch {
    await loadBalance();
  } finally {
    paying.value = false;
  }
}

/** 读取订单参数并加载余额；未登录回登录页 */
onLoad(async (q) => {
  if (!user.isLoggedIn) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  orderId.value = String(q?.orderId || "");
  orderNo.value = String(q?.orderNo || "");
  payAmount.value = String(q?.payAmount || "0");
  try {
    await loadBalance();
  } catch {
    balance.value = 0;
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 0 0 140rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.pay-amount {
  text-align: center;
  padding: 56rpx 24rpx 16rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.lab {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #999;
}

.panel {
  margin: 0 20rpx 20rpx;
  background: $color-surface;
  border-radius: $radius-base;
  padding: 8rpx 24rpx;
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.pay-method:last-child {
  border-bottom: none;
}

.pay-method.muted {
  opacity: 0.55;
}

.chk {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  box-sizing: border-box;
  flex-shrink: 0;
}

.chk.on {
  border-color: $color-brand;
  background: $color-brand;
  box-shadow: inset 0 0 0 6rpx #fff;
}

.name {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  font-size: 28rpx;
  color: $color-ink;
}

.sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
}

.val {
  font-size: 28rpx;
  color: $color-ink;
}

.more {
  color: #ccc;
  font-size: 32rpx;
}

.legal {
  margin: 8rpx 28rpx 0;
  font-size: 22rpx;
  color: #aaa;
  line-height: 1.55;
  text-align: center;
}

.bar-space {
  height: 20rpx;
}

.sticky-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 10;
  box-sizing: border-box;
}
</style>
