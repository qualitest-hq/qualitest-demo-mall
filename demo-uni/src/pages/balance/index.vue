<template>
  <view class="page">
    <view class="head panel">
      <text class="lab">账户余额（元）</text>
      <AppPrice :value="balance" size="lg" />
      <wd-button type="primary" size="medium" custom-style="margin-top:24rpx;" @click="showRecharge = true">
        充值
      </wd-button>
    </view>

    <view class="section-title">余额明细</view>
    <view v-if="loading && !records.length" class="state">加载中…</view>
    <view v-else-if="!records.length" class="state">暂无流水</view>
    <view v-else class="list">
      <view v-for="row in records" :key="String(row.balanceRecordId)" class="row panel">
        <view class="row-hd">
          <text class="title">{{ recordTitle(row) }}</text>
          <text class="amt" :class="{ out: Number(row.changeType) === 2 }">
            {{ amountPrefix(row) }}{{ formatMoney(row.changeAmount) }}
          </text>
        </view>
        <text class="sub">{{ row.createTime || "" }}</text>
        <text v-if="row.remark" class="sub">{{ row.remark }}</text>
      </view>
      <view v-if="loadingMore" class="foot">加载中…</view>
      <view v-else-if="noMore" class="foot">没有更多了</view>
    </view>

    <wd-popup v-model="showRecharge" position="center" custom-style="border-radius:16rpx;">
      <view class="dlg">
        <text class="dlg-title">模拟充值</text>
        <wd-input v-model="rechargeAmount" type="digit" placeholder="请输入金额" />
        <view class="dlg-actions">
          <wd-button size="medium" plain @click="showRecharge = false">取消</wd-button>
          <wd-button size="medium" type="primary" :loading="recharging" @click="onRecharge">确定</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
/**
 * 余额页：展示余额、充值与余额流水。
 */
import { computed, ref } from "vue";
import { onPullDownRefresh, onReachBottom, onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import { getProfile, listBalanceRecords, rechargeBalance } from "@/api/account";
import type { AccountBalanceRecord } from "@/types/account";

const balance = ref<number | string>(0);
const records = ref<AccountBalanceRecord[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const pageNum = ref(1);
const total = ref(0);
const pageSize = 15;

const showRecharge = ref(false);
const rechargeAmount = ref("");
const recharging = ref(false);

const noMore = computed(() => records.value.length >= total.value && total.value > 0);

function formatMoney(v?: number | string) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function recordTitle(row: AccountBalanceRecord) {
  const map: Record<number, string> = {
    1: "充值",
    2: "赠送",
    3: "订单支付",
    4: "订单退款",
  };
  if (row.recordType !== undefined && map[row.recordType]) {
    return map[row.recordType];
  }
  return row.remark || "余额变动";
}

function amountPrefix(row: AccountBalanceRecord) {
  return Number(row.changeType) === 2 ? "-" : "+";
}

async function loadBalance() {
  try {
    const p = await getProfile();
    balance.value = p?.balance ?? 0;
  } catch {
    /* toast */
  }
}

async function loadRecords(reset: boolean) {
  if (reset) {
    pageNum.value = 1;
    loading.value = true;
  } else {
    if (loadingMore.value || noMore.value) return;
    loadingMore.value = true;
  }
  try {
    const page = await listBalanceRecords({ pageNum: pageNum.value, pageSize });
    const rows = page?.rows || [];
    total.value = Number(page?.total || 0);
    records.value = reset ? rows : records.value.concat(rows);
  } catch {
    if (reset) records.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
    uni.stopPullDownRefresh();
  }
}

async function onRecharge() {
  const n = Number(rechargeAmount.value);
  if (!Number.isFinite(n) || n <= 0) {
    uni.showToast({ title: "请输入正确金额", icon: "none" });
    return;
  }
  recharging.value = true;
  try {
    await rechargeBalance(n);
    uni.showToast({ title: "充值成功", icon: "success" });
    showRecharge.value = false;
    rechargeAmount.value = "";
    await Promise.all([loadBalance(), loadRecords(true)]);
  } catch {
    /* toast */
  } finally {
    recharging.value = false;
  }
}

onShow(() => {
  loadBalance();
  loadRecords(true);
});

onPullDownRefresh(() => {
  Promise.all([loadBalance(), loadRecords(true)]);
});

onReachBottom(() => {
  if (noMore.value) return;
  pageNum.value += 1;
  loadRecords(false);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.panel {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 24rpx;
}

.head {
  text-align: center;
  margin-bottom: 24rpx;
}

.lab {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.section-title {
  padding: 8rpx 8rpx 16rpx;
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
}

.row {
  margin-bottom: 16rpx;
}

.row-hd {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16rpx;
}

.title {
  font-size: 28rpx;
  color: $color-ink;
}

.amt {
  font-size: 30rpx;
  font-weight: 650;
  color: $color-brand;
}

.amt.out {
  color: $color-ink;
}

.sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.state,
.foot {
  padding: 48rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.dlg {
  width: 560rpx;
  padding: 32rpx;
  box-sizing: border-box;
}

.dlg-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 30rpx;
  font-weight: 650;
  text-align: center;
}

.dlg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 28rpx;
}
</style>
