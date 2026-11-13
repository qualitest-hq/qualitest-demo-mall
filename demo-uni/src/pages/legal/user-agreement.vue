<template>
  <view class="page">
  <view class="card">
    <text class="h1">衡物用户服务协议</text>
    <text class="p">欢迎使用衡物商城演示应用。本协议为本地联调与产品演示用途的占位文本，不构成正式法律文件。</text>
    <text class="h2">一、账号注册与使用</text>
    <text class="p">您应使用真实有效的手机号码注册账号，并妥善保管登录密码。因您自身原因导致的账号泄露或损失，由您自行承担。</text>
    <text class="h2">二、商品与交易</text>
    <text class="p">平台展示的商品信息、价格与库存以结算页为准。下单即表示您确认收货地址、商品规格及应付金额。</text>
    <text class="h2">三、余额与优惠券</text>
    <text class="p">演示环境中的余额充值与优惠券领取仅为功能展示，不代表真实资金往来。请勿在演示环境输入真实支付信息。</text>
    <text class="h2">四、其他</text>
    <text class="p">我们可能在演示版本中调整功能而不另行通知。正式上线前将另行公布完整协议版本。</text>
    </view>
  </view>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 32rpx;
}

.h1 {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $color-ink;
  margin-bottom: 24rpx;
}

.h2 {
  display: block;
  margin: 28rpx 0 12rpx;
  font-size: 28rpx;
  font-weight: 650;
  color: $color-brand;
}

.p {
  display: block;
  font-size: 26rpx;
  color: #555;
  line-height: 1.65;
}
</style>
