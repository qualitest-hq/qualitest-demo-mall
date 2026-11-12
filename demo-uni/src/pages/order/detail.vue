<template>
  <view class="page">
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!order" class="state">订单不存在</view>
    <template v-else>
      <view class="panel">
        <text class="status">{{ displayOrderStatus(order) }}</text>
        <text class="ono">订单号 {{ order.orderNo || order.orderId }}</text>
        <text v-if="order.cancelReason" class="hint">取消原因：{{ order.cancelReason }}</text>
      </view>

      <view class="panel">
        <view v-for="(it, idx) in order.items || []" :key="String(it.orderItemId || idx)" class="goods">
          <ProductThumb :name="it.productName" :image="it.productImage" size="sm" />
          <view class="g-body">
            <text class="g-name">{{ it.productName }}</text>
            <text class="g-sku">{{ it.skuName }}</text>
            <AppPrice :value="it.salePrice" />
          </view>
          <text class="qty">×{{ it.quantity }}</text>
        </view>
      </view>

      <view class="panel cells">
        <view class="cell-row">
          <text class="lab">商品</text>
          <AppPrice :value="order.totalAmount" />
        </view>
        <view class="cell-row">
          <text class="lab">运费</text>
          <AppPrice :value="order.freightAmount" />
        </view>
        <view class="cell-row">
          <text class="lab">优惠</text>
          <text class="val">{{ couponText }}</text>
        </view>
        <view class="cell-row" @click="onLogistics">
          <text class="lab">物流</text>
          <text class="val">{{ logisticsText }}</text>
          <text class="more">›</text>
        </view>
        <view class="cell-row">
          <text class="lab">配送</text>
          <text class="val">{{ receiverText }}</text>
        </view>
        <view class="cell-row" @click="onEditRemark">
          <text class="lab">留言</text>
          <text class="val">{{ order.buyerRemark || (isUnpaid(order) ? "点击修改" : "无") }}</text>
          <text v-if="isUnpaid(order)" class="more">›</text>
        </view>
        <view class="cell-row">
          <text class="lab">实付/需付</text>
          <AppPrice :value="order.payAmount" size="lg" />
        </view>
      </view>

      <view class="bar-space" />
      <view class="sticky-bar">
        <template v-if="isUnpaid(order)">
          <wd-button plain custom-style="flex:1;border-radius:999px;" @click="onCancel">取消订单</wd-button>
          <wd-button
            type="primary"
            custom-style="flex:1;margin-left:16rpx;border-radius:999px;"
            @click="onPay"
          >
            去支付
          </wd-button>
        </template>
        <template v-else-if="isPendingReceive(order)">
          <wd-button plain custom-style="flex:1;border-radius:999px;" @click="onLogistics">查看物流</wd-button>
          <wd-button
            plain
            custom-style="flex:1;margin-left:16rpx;border-radius:999px;"
            @click="openRefundApply(String(order.orderId))"
          >
            申请退款
          </wd-button>
          <wd-button
            type="primary"
            plain
            custom-style="flex:1;margin-left:16rpx;border-radius:999px;"
            @click="onConfirm"
          >
            确认收货
          </wd-button>
        </template>
        <template v-else-if="canApplyRefundEntry(order)">
          <wd-button
            plain
            custom-style="flex:1;border-radius:999px;"
            @click="openRefundApply(String(order.orderId))"
          >
            申请退款
          </wd-button>
        </template>
        <template v-else-if="isRefunding(order)">
          <wd-button custom-style="flex:1;border-radius:999px;" plain @click="openRefundList()">
            退款进度
          </wd-button>
        </template>
      </view>
    </template>

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
 * 订单详情：金额构成、收货信息；待付款可改留言、取消、去支付。
 */
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import {
  cancelOrder,
  confirmReceiveOrder,
  getMyOrder,
  updateOrderReceiver,
} from "@/api/order";
import { CANCEL_REASON_PRESETS } from "@/constants/orderStatus";
import {
  openLogistics,
  openPay,
  openRefundApply,
  openRefundList,
} from "@/constants/routes";
import type { MallOrder } from "@/types/order";
import {
  canApplyRefundEntry,
  displayOrderStatus,
  isPendingReceive,
  isRefunding,
  isUnpaid,
} from "@/utils/order";

const loading = ref(true);
const order = ref<MallOrder | null>(null);
const orderId = ref("");
const cancelSheetVisible = ref(false);
const cancelActions = CANCEL_REASON_PRESETS.map((name) => ({ name }));

const couponText = computed(() => {
  const o = order.value;
  if (!o) return "无";
  const amt = Number(o.couponAmount || 0);
  if (amt > 0) return `${o.couponName || "优惠"} -¥${amt.toFixed(2)}`;
  return "无";
});

const logisticsText = computed(() => {
  const o = order.value;
  if (!o) return "";
  if (isPendingReceive(o) || Number(o.orderStatus) === 3) return "点击查看物流";
  return "暂无物流轨迹";
});

const receiverText = computed(() => {
  const o = order.value;
  if (!o) return "";
  return `${o.receiverName || ""} ${o.receiverPhone || ""}\n${o.receiverAddress || ""}`;
});

async function loadDetail() {
  if (!orderId.value) return;
  loading.value = true;
  try {
    order.value = await getMyOrder(orderId.value);
  } catch (e: unknown) {
    order.value = null;
    const msg = e instanceof Error ? e.message : "加载失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

function onPay() {
  const o = order.value;
  if (!o?.orderId) return;
  openPay(String(o.orderId), o.payAmount ?? 0, o.orderNo);
}

function onCancel() {
  cancelSheetVisible.value = true;
}

async function onCancelReasonSelect({ item }: { item: { name: string } }) {
  if (!orderId.value || !item?.name) return;
  try {
    await cancelOrder(orderId.value, { cancelReason: item.name });
    uni.showToast({ title: "订单已取消", icon: "none" });
    await loadDetail();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "取消失败";
    uni.showToast({ title: msg, icon: "none" });
  }
}

function onConfirm() {
  uni.showModal({
    title: "确认收货",
    content: "确认已收到商品？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await confirmReceiveOrder(orderId.value);
        uni.showToast({ title: "确认收货成功", icon: "none" });
        await loadDetail();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "操作失败";
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  });
}

function onLogistics() {
  openLogistics(orderId.value);
}

function onEditRemark() {
  const o = order.value;
  if (!o || !isUnpaid(o)) return;
  uni.showModal({
    title: "修改留言",
    editable: true,
    placeholderText: "选填，给商家留言",
    content: o.buyerRemark || "",
    success: async (res) => {
      if (!res.confirm) return;
      const buyerRemark = String(res.content ?? "").slice(0, 60);
      try {
        await updateOrderReceiver(orderId.value, { buyerRemark });
        uni.showToast({ title: "已更新", icon: "none" });
        await loadDetail();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "更新失败";
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  });
}

onLoad((q) => {
  orderId.value = String(q?.orderId || "");
});

onShow(() => {
  loadDetail();
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
  padding: 120rpx 24rpx;
  font-size: 26rpx;
}

.panel {
  background: #fff;
  margin: 20rpx;
  border-radius: $radius-base;
  padding: 24rpx;
}

.status {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $color-brand;
}

.ono,
.hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #888;
}

.goods {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.goods:last-child {
  margin-bottom: 0;
}

.g-body {
  flex: 1;
  min-width: 0;
}

.g-name {
  display: block;
  font-size: 28rpx;
}

.g-sku {
  display: block;
  margin: 10rpx 0;
  font-size: 24rpx;
  color: #888;
}

.qty {
  font-size: 24rpx;
  color: #888;
}

.cells .cell-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 26rpx;
}

.cells .cell-row:last-child {
  border-bottom: 0;
}

.lab {
  width: 120rpx;
  color: #888;
  flex-shrink: 0;
}

.val {
  flex: 1;
  color: $color-ink;
  white-space: pre-wrap;
  word-break: break-all;
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
  display: flex;
  gap: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
}
</style>
