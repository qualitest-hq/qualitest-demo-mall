<template>
  <view class="page">
    <view v-if="!user.isLoggedIn" class="empty-wrap">
      <wd-status-tip image="content" tip="登录后查看购物车" />
      <wd-button type="primary" size="medium" @click="goLogin">去登录</wd-button>
    </view>
    <view v-else-if="loading" class="empty-wrap">加载中…</view>
    <view v-else-if="!items.length" class="empty-wrap">
      <wd-status-tip image="content" tip="购物车是空的" />
      <wd-button type="primary" size="medium" plain @click="goHome">去逛逛</wd-button>
    </view>
    <template v-else>
      <view class="topbar">
        <text class="top-title">购物车({{ items.length }})</text>
        <text class="top-link" @click="toggleManage">{{ managing ? "完成" : "管理" }}</text>
      </view>

      <view v-if="!managing" class="coupon-tip" @click="toastComingSoon('优惠券')">
        有可用优惠券，确认订单时在「优惠」中选择 ›
      </view>

      <view v-if="availableItems.length" class="store-card">
        <view class="store-hd" @click="toggleSelectAll(availableItems, allAliveSelected)">
          <view class="chk" :class="{ on: allAliveSelected }" />
          <text class="shop">{{ appConfig.officialShopName }}</text>
        </view>
        <view v-for="row in availableItems" :key="row.cartId" class="cart-line">
          <view class="chk" :class="{ on: row.selected === 1 }" @click.stop="toggleSelect(row)" />
          <ProductThumb :name="row.productName" @click="openDetail(row)" />
          <view class="info">
            <text class="title" @click="openDetail(row)">{{ row.productName }}</text>
            <text class="sku">{{ row.skuName }}</text>
            <view class="bottom">
              <AppPrice :value="row.salePrice" />
              <wd-input-number
                v-if="!managing"
                :model-value="row.quantity"
                :min="1"
                :max="99"
                @change="onQtyEvent(row, $event)"
              />
            </view>
          </view>
        </view>
      </view>

      <view v-if="unavailableItems.length" class="store-card dead-box">
        <view class="dead-hd">
          <text>失效商品（{{ unavailableItems.length }}）</text>
          <text class="clear" @click="removeRows(unavailableItems.map((r) => r.cartId))">一键清空</text>
        </view>
        <view v-for="row in unavailableItems" :key="row.cartId" class="cart-line dead">
          <view
            v-if="managing"
            class="chk"
            :class="{ on: row.selected === 1 }"
            @click.stop="toggleSelect(row, true)"
          />
          <view v-else class="chk ghost" />
          <ProductThumb :name="row.productName" muted />
          <view class="info">
            <text class="title">
              {{ row.productName }}
              <text class="dead-tag">已失效</text>
            </text>
            <text class="sku">{{ row.skuName }}</text>
            <view class="bottom">
              <AppPrice :value="row.salePrice" muted />
              <text class="dead-tip">{{ row.unavailableReason || "不可结算" }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bar-space" />
      <view class="cart-footer">
        <view
          class="all"
          @click="
            managing
              ? toggleSelectAll(items, allManageSelected)
              : toggleSelectAll(availableItems, allAliveSelected)
          "
        >
          <view class="chk" :class="{ on: managing ? allManageSelected : allAliveSelected }" />
          <text>全选</text>
        </view>
        <template v-if="managing">
          <wd-button
            type="error"
            size="medium"
            :disabled="!manageSelectedIds.length"
            custom-style="border-radius:999px;padding:0 36rpx;"
            @click="removeRows(manageSelectedIds)"
          >
            删除
          </wd-button>
        </template>
        <template v-else>
          <view class="sum">
            <view class="l1">
              <text>合计</text>
              <AppPrice :value="selectedAmount" size="lg" />
            </view>
            <text class="l2">优惠另计 · 去结算查看</text>
          </view>
          <wd-button
            type="primary"
            size="medium"
            :disabled="!selectedIds.length"
            custom-style="border-radius:999px;padding:0 36rpx;"
            @click="goCheckout"
          >
            结算({{ selectedIds.length }})
          </wd-button>
        </template>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
/**
 * 购物车 Tab 页。
 * 未登录引导登录；有货按店铺卡展示可结算行；失效商品单独成区；
 * 普通态可改数量、勾选结算；管理态可勾选（含失效）并批量删除。
 */
import { computed, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import {
  listMyCart,
  removeCartItems,
  updateCartQuantity,
  updateCartSelected,
} from "@/api/cart";
import { appConfig } from "@/config/app";
import { openCheckout, openProduct, ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import type { MallCartItem } from "@/types/cart";
import { toastComingSoon } from "@/utils/toast";

const user = useUserStore();
/** 列表请求中 */
const loading = ref(false);
/** 是否处于管理态（底栏改为删除，可勾失效行） */
const managing = ref(false);
/** 购物车全部行 */
const items = ref<MallCartItem[]>([]);

/** 可结算行 */
const availableItems = computed(() => items.value.filter((r) => r.available !== false));
/** 失效行（下架、无库存等） */
const unavailableItems = computed(() => items.value.filter((r) => r.available === false));

/** 普通态：已勾选且可结算的主键，用于结算跳转 */
const selectedIds = computed(() =>
  availableItems.value.filter((r) => r.selected === 1).map((r) => r.cartId),
);
/** 管理态：全部已勾选主键（含失效），用于批量删除 */
const manageSelectedIds = computed(() =>
  items.value.filter((r) => r.selected === 1).map((r) => r.cartId),
);
/** 可结算行是否已全选 */
const allAliveSelected = computed(
  () =>
    availableItems.value.length > 0 &&
    availableItems.value.every((r) => r.selected === 1),
);
/** 管理态是否整车全选 */
const allManageSelected = computed(
  () => items.value.length > 0 && items.value.every((r) => r.selected === 1),
);
/** 已勾选可结算行的小计合计 */
const selectedAmount = computed(() =>
  availableItems.value
    .filter((r) => r.selected === 1)
    .reduce((sum, r) => sum + Number(r.subtotal ?? 0), 0),
);

/** 行数变化时同步导航栏标题 */
watch(
  () => items.value.length,
  (n) => {
    uni.setNavigationBarTitle({ title: n ? `购物车(${n})` : "购物车" });
  },
);

/** 去登录页 */
function goLogin() {
  uni.navigateTo({ url: ROUTES.LOGIN });
}

/** 空车时切到首页逛逛 */
function goHome() {
  uni.switchTab({ url: ROUTES.HOME });
}

/** 打开商品详情 */
function openDetail(row: MallCartItem) {
  if (row.productId) {
    openProduct(row.productId);
  }
}

/** 切换普通态 / 管理态 */
function toggleManage() {
  managing.value = !managing.value;
}

/** 拉取我的购物车；未登录清空本地列表 */
async function loadCart() {
  if (!user.isLoggedIn) {
    items.value = [];
    return;
  }
  loading.value = true;
  try {
    items.value = (await listMyCart()) || [];
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 切换单行勾选并同步服务端。
 * @param allowDead 为 true 时允许勾选失效行（仅管理态）
 */
async function toggleSelect(row: MallCartItem, allowDead = false) {
  if (!allowDead && row.available === false) {
    uni.showToast({ title: "失效商品不可勾选", icon: "none" });
    return;
  }
  const next = (row.selected === 1 ? 0 : 1) as 0 | 1;
  try {
    await updateCartSelected({ cartIds: [row.cartId], selected: next });
    row.selected = next;
  } catch {
    /* 错误提示由 request 弹出 */
  }
}

/**
 * 对给定行集批量勾选或取消。
 * @param allOn 当前是否已全选；为 true 则本次改为全不选
 */
async function toggleSelectAll(rows: MallCartItem[], allOn: boolean) {
  if (!rows.length) {
    return;
  }
  const next = (allOn ? 0 : 1) as 0 | 1;
  const ids = rows.map((r) => r.cartId);
  try {
    await updateCartSelected({ cartIds: ids, selected: next });
    const idSet = new Set(ids);
    items.value.forEach((r) => {
      if (idSet.has(r.cartId)) {
        r.selected = next;
      }
    });
  } catch {
    /* 忽略 */
  }
}

/** 步进器 change 事件桥接到改量逻辑 */
function onQtyEvent(row: MallCartItem, event: { value: number | string }) {
  void onQtyChange(row, event.value);
}

/**
 * 修改数量；数量为 0 时从列表移除该行。
 * 失败则整表重拉，避免本地与服务端不一致。
 */
async function onQtyChange(row: MallCartItem, value: number | string) {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty === row.quantity) {
    return;
  }
  try {
    await updateCartQuantity({ cartId: row.cartId, quantity: qty });
    if (qty === 0) {
      items.value = items.value.filter((r) => r.cartId !== row.cartId);
    } else {
      row.quantity = qty;
      row.subtotal = Number(row.salePrice || 0) * qty;
    }
  } catch {
    await loadCart();
  }
}

/** 按主键批量删除（管理删除与一键清空失效共用） */
async function removeRows(ids: string[]) {
  if (!ids.length) {
    return;
  }
  try {
    await removeCartItems(ids);
    const idSet = new Set(ids);
    items.value = items.value.filter((r) => !idSet.has(r.cartId));
  } catch {
    /* 忽略 */
  }
}

/** 带着已勾选 cartIds 进入确认订单 */
function goCheckout() {
  if (!selectedIds.value.length) {
    uni.showToast({ title: "请先勾选商品", icon: "none" });
    return;
  }
  openCheckout(`cartIds=${selectedIds.value.join(",")}`);
}

/** 每次显示页面刷新列表（含从详情加购返回） */
onShow(() => {
  loadCart();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + var(--window-bottom, 50px));
  box-sizing: border-box;
  background: $color-bg;
}

.empty-wrap {
  padding: 120rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  color: #999;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx 8rpx;
}

.top-title {
  font-size: 30rpx;
  font-weight: 650;
  color: $color-ink;
}

.top-link {
  font-size: 26rpx;
  color: $color-brand;
}

.coupon-tip {
  margin: 12rpx 20rpx 0;
  padding: 18rpx 22rpx;
  background: #fff8f0;
  color: #c47a2c;
  font-size: 24rpx;
  border-radius: $radius-base;
}

.store-card {
  margin: 20rpx 20rpx 0;
  background: $color-surface;
  border-radius: $radius-base;
  padding: 24rpx;
}

.store-card.dead-box {
  background: #fafafa;
}

.store-hd {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.shop {
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
}

.dead-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #666;
}

.clear {
  color: $color-brand;
  font-size: 24rpx;
}

.cart-line {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx 0;
  border-top: 1px solid #f2f2f2;
}

.cart-line:first-of-type {
  border-top: none;
}

.cart-line.dead {
  opacity: 0.78;
}

.chk {
  width: 36rpx;
  height: 36rpx;
  margin-top: 28rpx;
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

.chk.ghost {
  visibility: hidden;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  font-size: 28rpx;
  color: $color-ink;
  line-height: 1.35;
}

.dead-tag {
  margin-left: 8rpx;
  font-size: 20rpx;
  color: #fff;
  background: #bbb;
  border-radius: 6rpx;
  padding: 2rpx 8rpx;
}

.sku {
  display: inline-block;
  margin-top: 10rpx;
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  color: #888;
  background: #f3f3f3;
  border-radius: 8rpx;
}

.bottom {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.dead-tip {
  font-size: 22rpx;
  color: #aaa;
}

.bar-space {
  height: 24rpx;
}

.cart-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom, 50px);
  min-height: 110rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 16rpx;
  z-index: 10;
  box-sizing: border-box;
}

.all {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.all .chk {
  margin-top: 0;
}

.sum {
  margin-left: auto;
  text-align: right;
  line-height: 1.25;
}

.l1 {
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8rpx;
}

.l2 {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #aaa;
}
</style>
