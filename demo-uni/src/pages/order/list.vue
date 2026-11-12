<template>
  <view class="page">
    <scroll-view scroll-x class="tabs" :show-scrollbar="false">
      <view
        v-for="tab in ORDER_TABS"
        :key="String(tab.value)"
        class="tab"
        :class="{ on: sameTab(tab.value) }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </scroll-view>

    <view v-if="loading && !list.length" class="state">加载中…</view>
    <view v-else-if="!list.length" class="state">暂无订单</view>
    <view v-else class="list">
      <view v-for="order in list" :key="String(order.orderId)" class="order">
        <view class="hd">
          <text class="shop">衡物精选</text>
          <text class="st" :class="{ warn: isWarnStatus(order) }">{{ displayOrderStatus(order) }}</text>
        </view>
        <view
          v-for="(it, idx) in order.items || []"
          :key="String(it.orderItemId || idx)"
          class="line"
          @click="openOrderDetail(String(order.orderId))"
        >
          <ProductThumb :name="it.productName" :image="it.productImage" size="sm" />
          <view class="body">
            <text class="ot">{{ it.productName }}</text>
            <text class="os">{{ it.skuName }}{{ Number(it.quantity) > 1 ? ` ×${it.quantity}` : "" }}</text>
            <AppPrice :value="it.salePrice" />
          </view>
        </view>
        <view class="amt">
          共{{ orderItemCount(order) }}件 · 实付/需付
          <AppPrice :value="order.payAmount" />
        </view>
        <view class="actions">
          <template v-if="isUnpaid(order)">
            <wd-button size="small" plain @click="onCancel(order)">取消订单</wd-button>
            <wd-button
              size="small"
              type="primary"
              plain
              custom-style="margin-left:16rpx;"
              @click="onPay(order)"
            >
              去支付
            </wd-button>
          </template>
          <template v-else-if="isPendingShip(order)">
            <wd-button size="small" plain @click="toastComingSoon('提醒发货')">提醒发货</wd-button>
          </template>
          <template v-else-if="isPendingReceive(order)">
            <wd-button size="small" plain @click="openLogistics(String(order.orderId))">查看物流</wd-button>
            <wd-button
              size="small"
              plain
              custom-style="margin-left:16rpx;"
              @click="openRefundApply(String(order.orderId))"
            >
              申请退款
            </wd-button>
            <wd-button
              size="small"
              type="primary"
              plain
              custom-style="margin-left:16rpx;"
              @click="onConfirm(order)"
            >
              确认收货
            </wd-button>
          </template>
          <template v-else-if="isFinished(order)">
            <wd-button size="small" plain @click="openLogistics(String(order.orderId))">查看物流</wd-button>
            <wd-button
              size="small"
              plain
              custom-style="margin-left:16rpx;"
              @click="openRefundApply(String(order.orderId))"
            >
              申请退款
            </wd-button>
          </template>
          <template v-else-if="isRefunding(order)">
            <wd-button size="small" plain @click="openRefundList()">退款进度</wd-button>
            <wd-button
              size="small"
              plain
              custom-style="margin-left:16rpx;"
              @click="openOrderDetail(String(order.orderId))"
            >
              订单详情
            </wd-button>
          </template>
        </view>
      </view>
      <view v-if="loadingMore" class="foot">加载中…</view>
      <view v-else-if="noMore && list.length" class="foot">没有更多了</view>
    </view>

    <wd-action-sheet
      v-model="cancelSheetVisible"
      :actions="cancelActions"
      cancel-text="再想想"
      @select="onCancelReasonSelect"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 我的订单列表：按状态 Tab 筛选，行内取消/支付/确认收货。
 */
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import { cancelOrder, confirmReceiveOrder, listMyOrders } from "@/api/order";
import { CANCEL_REASON_PRESETS, ORDER_TABS } from "@/constants/orderStatus";
import {
  openLogistics,
  openOrderDetail,
  openPay,
  openRefundApply,
  openRefundList,
} from "@/constants/routes";
import type { MallOrder } from "@/types/order";
import {
  displayOrderStatus,
  isFinished,
  isPendingReceive,
  isPendingShip,
  isRefunding,
  isUnpaid,
  orderItemCount,
} from "@/utils/order";
import { toastComingSoon } from "@/utils/toast";

const loading = ref(false);
const loadingMore = ref(false);
const list = ref<MallOrder[]>([]);
const pageNum = ref(1);
const total = ref(0);
const activeStatus = ref<number | null>(null);
const cancelSheetVisible = ref(false);
const cancelTargetId = ref("");

const pageSize = 10;
const noMore = computed(() => list.value.length >= total.value && total.value > 0);

const cancelActions = CANCEL_REASON_PRESETS.map((name) => ({ name }));

function sameTab(value: number | null) {
  return activeStatus.value === value;
}

function isWarnStatus(order: MallOrder) {
  return isUnpaid(order) || isRefunding(order);
}

async function loadList(reset: boolean) {
  if (reset) {
    pageNum.value = 1;
    loading.value = true;
  } else {
    if (loadingMore.value || noMore.value) return;
    loadingMore.value = true;
  }
  try {
    const page = await listMyOrders({
      orderStatus: activeStatus.value,
      pageNum: pageNum.value,
      pageSize,
    });
    const rows = page?.rows || [];
    total.value = Number(page?.total || 0);
    list.value = reset ? rows : list.value.concat(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "加载失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
    loadingMore.value = false;
    uni.stopPullDownRefresh();
  }
}

function switchTab(value: number | null) {
  if (activeStatus.value === value) return;
  activeStatus.value = value;
  loadList(true);
}

function onPay(order: MallOrder) {
  if (!order.orderId) return;
  openPay(String(order.orderId), order.payAmount ?? 0, order.orderNo);
}

function onCancel(order: MallOrder) {
  cancelTargetId.value = String(order.orderId || "");
  cancelSheetVisible.value = true;
}

async function onCancelReasonSelect({ item }: { item: { name: string } }) {
  const orderId = cancelTargetId.value;
  if (!orderId || !item?.name) return;
  try {
    await cancelOrder(orderId, { cancelReason: item.name });
    uni.showToast({ title: "订单已取消", icon: "none" });
    await loadList(true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "取消失败";
    uni.showToast({ title: msg, icon: "none" });
  }
}

function onConfirm(order: MallOrder) {
  const orderId = String(order.orderId || "");
  if (!orderId) return;
  uni.showModal({
    title: "确认收货",
    content: "确认已收到商品？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await confirmReceiveOrder(orderId);
        uni.showToast({ title: "确认收货成功", icon: "none" });
        await loadList(true);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "操作失败";
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  });
}

onLoad((q) => {
  if (q?.orderStatus !== undefined && q.orderStatus !== "") {
    const n = Number(q.orderStatus);
    activeStatus.value = Number.isNaN(n) ? null : n;
  }
});

onShow(() => {
  loadList(true);
});

onPullDownRefresh(() => {
  loadList(true);
});

onReachBottom(() => {
  if (noMore.value || loading.value) return;
  pageNum.value += 1;
  loadList(false);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.tabs {
  white-space: nowrap;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 8rpx;
}

.tab {
  display: inline-block;
  padding: 24rpx 22rpx;
  font-size: 26rpx;
  color: #666;
}

.tab.on {
  color: $color-brand;
  font-weight: 650;
  position: relative;
}

.tab.on::after {
  content: "";
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: 0;
  height: 4rpx;
  background: $color-brand;
  border-radius: 4rpx;
}

.state,
.foot {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 80rpx 24rpx;
}

.foot {
  padding: 32rpx;
}

.list {
  padding: 16rpx 0 48rpx;
}

.order {
  background: #fff;
  margin: 16rpx 20rpx;
  border-radius: $radius-base;
  padding: 20rpx 24rpx 16rpx;
}

.hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.shop {
  font-size: 26rpx;
  font-weight: 650;
  color: $color-ink;
}

.st {
  font-size: 24rpx;
  color: #888;
}

.st.warn {
  color: $color-price;
}

.line {
  display: flex;
  gap: 20rpx;
  padding: 12rpx 0;
}

.body {
  flex: 1;
  min-width: 0;
}

.ot {
  display: block;
  font-size: 28rpx;
  color: $color-ink;
}

.os {
  display: block;
  margin: 8rpx 0;
  font-size: 24rpx;
  color: #888;
}

.amt {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8rpx;
  font-size: 24rpx;
  color: #555;
  padding: 8rpx 0 16rpx;
}

.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8rpx 0;
  padding-top: 8rpx;
  border-top: 1px solid #f5f5f5;
}
</style>
