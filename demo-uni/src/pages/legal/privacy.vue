<template>
  <view class="page">
    <view class="card">
      <text class="h1">隐私政策</text>
      <text class="p">衡物演示应用重视您的个人信息保护。本政策说明我们在演示环境中可能收集的信息类型及使用方式。</text>
      <text class="h2">我们收集的信息</text>
      <text class="p">包括您注册时提供的手机号、昵称，以及下单所需的收货地址、订单与余额流水等业务数据。</text>
      <text class="h2">信息的使用</text>
      <text class="p">上述信息仅用于完成登录鉴权、订单履约、售后与账户资产管理等功能演示，不会用于未授权的商业用途。</text>
      <text class="h2">信息的存储与安全</text>
      <text class="p">演示数据存储于联调服务器。请勿在演示环境填写真实敏感信息。正式上线前将采用符合法规要求的保护措施。</text>
      <text class="h2">联系我们</text>
      <text class="p">如对隐私有疑问，可通过应用内客服入口（演示占位）与我们沟通。</text>
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
