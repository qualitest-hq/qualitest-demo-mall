<template>
  <view class="page">
    <view v-if="loading && !list.length" class="state">加载中…</view>
    <view v-else-if="!list.length" class="state">暂无退款单</view>
    <view v-else class="list">
      <view v-for="item in list" :key="String(item.refundId)" class="card">
        <view class="hd">
          <text class="no">{{ item.refundNo || item.refundId }}</text>
          <text class="st">{{ statusText(item.refundStatus) }}</text>
        </view>
        <view class="row">
          <text class="lab">退款金额</text>
          <AppPrice :value="item.refundAmount" />
        </view>
        <view class="row">
          <text class="lab">原因</text>
          <text class="val">{{ item.refundReason || "—" }}</text>
        </view>
        <view class="row">
          <text class="lab">申请时间</text>
          <text class="val">{{ item.applyTime || "—" }}</text>
        </view>
        <view class="actions">
          <wd-button
            v-if="item.orderId"
            size="small"
            plain
            @click="openOrderDetail(String(item.orderId))"
          >
            订单详情
          </wd-button>
          <wd-button
            v-if="Number(item.refundStatus) === 0"
            size="small"
            plain
            custom-style="margin-left:16rpx;"
            @click="onCancel(item)"
          >
            撤销申请
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 我的退款列表（薄）：展示状态与撤销待审。
 */
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { cancelRefund, listMyRefunds } from "@/api/orderRefund";
import { openOrderDetail } from "@/constants/routes";
import type { MallOrderRefund } from "@/types/orderRefund";

const STATUS: Record<number, string> = {
  0: "待审核",
  1: "已通过",
  2: "已拒绝",
  3: "退款中",
  4: "已完成",
  5: "已取消",
};

const loading = ref(false);
const list = ref<MallOrderRefund[]>([]);

function statusText(status?: number | string | null) {
  if (status === undefined || status === null || status === "") return "未知";
  return STATUS[Number(status)] || `状态${status}`;
}

async function loadList() {
  loading.value = true;
  try {
    const page = await listMyRefunds(1, 50);
    list.value = page?.rows || [];
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "加载失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

function onCancel(item: MallOrderRefund) {
  const id = String(item.refundId || "");
  if (!id) return;
  uni.showModal({
    title: "撤销申请",
    content: "确认撤销该退款申请？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await cancelRefund(id);
        uni.showToast({ title: "已撤销", icon: "none" });
        await loadList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "撤销失败";
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  });
}

onShow(() => {
  loadList();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.state {
  text-align: center;
  color: #999;
  padding: 120rpx 24rpx;
  font-size: 26rpx;
}

.list {
  padding: 16rpx 0 48rpx;
}

.card {
  background: #fff;
  margin: 16rpx 20rpx;
  border-radius: $radius-base;
  padding: 24rpx;
}

.hd {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.no {
  font-size: 26rpx;
  font-weight: 650;
  color: $color-ink;
}

.st {
  font-size: 24rpx;
  color: $color-price;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  font-size: 26rpx;
}

.lab {
  color: #888;
}

.val {
  color: $color-ink;
  max-width: 70%;
  text-align: right;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
  padding-top: 12rpx;
  border-top: 1px solid #f5f5f5;
}
</style>
