<template>
  <!-- 我的 Tab：登录状态、订单入口、商家中心 -->
  <view class="page">
    <view class="card user-card" @click="onUserTap">
      <text class="title">{{ appConfig.name }}</text>
      <text class="sub">{{ loginHint }}</text>
      <text v-if="user.isLoggedIn" class="edit-hint">点击编辑资料 ›</text>
      <wd-button v-if="!user.isLoggedIn" type="primary" size="medium" @click.stop="goLogin">
        去登录
      </wd-button>
    </view>

    <view class="card orders-card">
      <view class="orders-hd" @click="goOrders()">
        <text class="item-title">我的订单</text>
        <text class="all">全部 ›</text>
      </view>
      <view class="mine-orders">
        <view
          v-for="entry in MINE_ORDER_ENTRIES"
          :key="entry.value"
          class="entry"
          @click="goOrders(entry.value)"
        >
          <view class="ico">{{ entry.label.slice(0, 1) }}</view>
          <text>{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <view class="card menu">
      <view class="item" @click="goProfile">
        <view>
          <text class="item-title">个人资料</text>
          <text class="item-desc">昵称与性别</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goPassword">
        <view>
          <text class="item-title">修改密码</text>
          <text class="item-desc">原密码验证后修改</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goCoupons">
        <view>
          <text class="item-title">优惠券</text>
          <text class="item-desc">领取与使用记录</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goBalance">
        <view>
          <text class="item-title">我的余额</text>
          <text class="item-desc">充值与流水</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="onWithdraw">
        <view>
          <text class="item-title">提现账户</text>
          <text class="item-desc">绑定收款方式</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goAddress">
        <view>
          <text class="item-title">收货地址</text>
          <text class="item-desc">管理收货信息</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goRefunds">
        <view>
          <text class="item-title">我的退款</text>
          <text class="item-desc">申请进度与撤销</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="onNotify">
        <view>
          <text class="item-title">消息通知</text>
          <text class="item-desc">订单与活动提醒</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="goMerchant">
        <view>
          <text class="item-title">商家中心</text>
          <text class="item-desc">入驻开店 · 店铺资料 · 工作台</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <!-- #ifdef H5 -->
      <view v-if="adminUrl" class="item" @click="goAdmin">
        <view>
          <text class="item-title">管理端</text>
          <text class="item-desc">运营后台 · 测试场景</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <!-- #endif -->
    </view>

    <wd-button
      v-if="user.isLoggedIn"
      type="info"
      size="medium"
      plain
      block
      custom-style="margin-top:8rpx;"
      :loading="loggingOut"
      @click="onLogout"
    >
      退出登录
    </wd-button>

    <BeianFooter />
  </view>
</template>

<script setup lang="ts">
/**
 * 我的页。
 * 订单五宫格、资产菜单、商家中心；未登录点需登录项会先跳登录。
 */
import { computed, ref } from "vue";
import { logout as logoutApi } from "@/api/account";
import { openMerchantCenter } from "@/composables/useMerchantGate";
import { appConfig } from "@/config/app";
import { MINE_ORDER_ENTRIES } from "@/constants/orderStatus";
import {
  openAddressList,
  openBalance,
  openCouponList,
  openOrders,
  openPassword,
  openProfile,
  openRefundList,
  ROUTES,
} from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import BeianFooter from "@/components/BeianFooter.vue";
import { openExternalUrl } from "@/utils/openExternal";
import { toastComingSoon } from "@/utils/toast";

const user = useUserStore();
const loggingOut = ref(false);
/** 管理端互跳地址；空则不展示 */
const adminUrl = (import.meta.env.VITE_ADMIN_URL || "").trim();

/** 登录状态说明文案 */
const loginHint = computed(() =>
  user.isLoggedIn
    ? user.profile?.nickName || "已登录"
    : "未登录 · 可先逛购",
);

function requireLogin(): boolean {
  if (user.isLoggedIn) return true;
  goLogin();
  return false;
}

/** 打开登录页 */
function goLogin() {
  uni.navigateTo({ url: ROUTES.LOGIN });
}

function onUserTap() {
  if (!requireLogin()) return;
  openProfile();
}

function goProfile() {
  if (!requireLogin()) return;
  openProfile();
}

function goPassword() {
  if (!requireLogin()) return;
  openPassword();
}

function goCoupons() {
  if (!requireLogin()) return;
  openCouponList();
}

function goBalance() {
  if (!requireLogin()) return;
  openBalance();
}

function goAddress() {
  if (!requireLogin()) return;
  openAddressList();
}

function onWithdraw() {
  toastComingSoon("提现账户");
}

function onNotify() {
  toastComingSoon("消息通知");
}

/** 进入订单列表；未登录先登录 */
function goOrders(orderStatus?: number) {
  if (!requireLogin()) return;
  openOrders(orderStatus);
}

/** 我的退款 */
function goRefunds() {
  if (!requireLogin()) return;
  openRefundList();
}

/** 进入商家中心（未登录会先跳登录） */
function goMerchant() {
  openMerchantCenter();
}

/** 打开管理端（仅 H5；不共享登录态） */
function goAdmin() {
  openExternalUrl(adminUrl);
}

/** 请求服务端退出并清本地登录态 */
async function onLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await logoutApi();
  } catch {
    /* 仍清本地 */
  } finally {
    user.logout();
    loggingOut.value = false;
    uni.showToast({ title: "已退出", icon: "none" });
  }
}
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
  margin-bottom: 24rpx;
}

.user-card {
  position: relative;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $color-brand;
}

.sub {
  display: block;
  margin: 16rpx 0 12rpx;
  font-size: 26rpx;
  color: #666;
}

.edit-hint {
  display: block;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.orders-card {
  padding: 28rpx 24rpx 20rpx;
}

.orders-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.all {
  font-size: 24rpx;
  color: #999;
}

.mine-orders {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
  font-size: 22rpx;
  color: #555;
  gap: 8rpx 0;
}

.entry {
  padding: 8rpx 0;
}

.ico {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 8rpx;
  border-radius: 50%;
  background: #eaf4f0;
  color: $color-brand;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 650;
}

.menu {
  padding: 0;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
  border-bottom: 0;
}

.item-title {
  display: block;
  font-size: 30rpx;
  color: $color-ink;
  font-weight: 500;
}

.item-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.arrow {
  color: #ccc;
  font-size: 36rpx;
}
</style>
