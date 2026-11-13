<template>
  <view class="page">
    <view v-if="loading && !list.length" class="state">加载中…</view>
    <view v-else-if="!list.length" class="state">暂无地址</view>
    <view v-else class="list">
      <view v-for="row in list" :key="row.addressId" class="card" @click="onPick(row)">
        <view class="hd">
          <text v-if="Number(row.isDefault) === 1" class="tag">默认</text>
          <text class="name">{{ row.receiverName }} {{ row.receiverPhone }}</text>
        </view>
        <text class="addr">{{ formatAddress(row) }}</text>
        <view v-if="!pickMode" class="ops" @click.stop>
          <text class="op" @click="onEdit(row)">编辑</text>
          <text class="op" @click="onDefault(row)">设为默认</text>
          <text class="op danger" @click="onDelete(row)">删除</text>
        </view>
        <text v-else class="pick-hint">点击选择</text>
      </view>
    </view>
    <view class="bar-space" />
    <view class="sticky-bar">
      <wd-button type="primary" size="large" block @click="onAdd">新增地址</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { deleteAddress, listMyAddresses, setDefaultAddress } from "@/api/account";
import { STORAGE_KEYS } from "@/constants/storage";
import { openAddressEdit } from "@/constants/routes";
import type { AccountAddress } from "@/types/account";
import { setStorage } from "@/utils/storage";

const loading = ref(false);
const list = ref<AccountAddress[]>([]);
const pickMode = ref(false);

function formatAddress(row: AccountAddress) {
  return `${row.province || ""}${row.city || ""}${row.district || ""}${row.detailAddress || ""}`;
}

async function load() {
  loading.value = true;
  try {
    const page = await listMyAddresses(1, 50);
    list.value = page?.rows || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function onAdd() {
  openAddressEdit();
}

function onEdit(row: AccountAddress) {
  if (!row.addressId) return;
  openAddressEdit({ id: row.addressId });
}

function onPick(row: AccountAddress) {
  if (!pickMode.value || !row.addressId) return;
  setStorage(STORAGE_KEYS.CHECKOUT_PICK_ADDRESS, row);
  uni.navigateBack();
}

async function onDefault(row: AccountAddress) {
  if (!row.addressId || Number(row.isDefault) === 1) return;
  try {
    await setDefaultAddress(row.addressId);
    uni.showToast({ title: "已设为默认", icon: "success" });
    await load();
  } catch {
    /* toast */
  }
}

function onDelete(row: AccountAddress) {
  if (!row.addressId) return;
  uni.showModal({
    title: "删除地址",
    content: "确定删除该收货地址？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await deleteAddress(row.addressId!);
        uni.showToast({ title: "已删除", icon: "success" });
        await load();
      } catch {
        /* toast */
      }
    },
  });
}

onLoad((q) => {
  pickMode.value = String(q?.pick || "") === "1";
});

onShow(() => {
  load();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 20rpx 160rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.state {
  padding: 120rpx 32rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.hd {
  margin-bottom: 12rpx;
}

.tag {
  display: inline-block;
  margin-right: 8rpx;
  padding: 2rpx 10rpx;
  font-size: 20rpx;
  color: #fff;
  background: $color-brand;
  border-radius: 6rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 650;
  color: $color-ink;
}

.addr {
  display: block;
  font-size: 26rpx;
  color: #555;
  line-height: 1.45;
}

.ops {
  display: flex;
  justify-content: flex-end;
  gap: 28rpx;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid #f5f5f5;
}

.op {
  font-size: 26rpx;
  color: $color-brand;
}

.op.danger {
  color: $color-price;
}

.pick-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
  text-align: right;
}

.bar-space {
  height: 20rpx;
}

.sticky-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
  box-sizing: border-box;
}
</style>
