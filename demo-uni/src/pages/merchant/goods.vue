<template>
  <view class="page">
    <view class="tabs">
      <text
        v-for="tab in tabs"
        :key="String(tab.value)"
        class="tab"
        :class="{ on: shelfFilter === tab.value }"
        @click="onTab(tab.value)"
      >
        {{ tab.label }}
      </text>
    </view>

    <view v-if="loading && !list.length" class="empty">加载中…</view>
    <view v-else-if="!list.length" class="empty">暂无商品，点击右下角新建</view>

    <view v-for="item in list" :key="item.productId" class="card">
      <view class="row" @click="goEdit(item.productId)">
        <view class="thumb">
          <image
            v-if="productCoverUrl(item)"
            class="thumb-img"
            :src="productCoverUrl(item)"
            mode="aspectFill"
          />
          <text v-else>{{ productInitial(item.productName) }}</text>
        </view>
        <view class="main">
          <text class="name">{{ item.productName }}</text>
          <text class="meta">
            ¥{{ item.salePrice }} · 库存 {{ item.stockTotal ?? 0 }} ·
            {{ Number(item.shelfStatus) === 1 ? "在售" : "已下架" }}
          </text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="actions">
        <wd-button size="small" plain @click="goEdit(item.productId)">编辑</wd-button>
        <wd-button
          size="small"
          :type="Number(item.shelfStatus) === 1 ? 'warning' : 'primary'"
          :loading="togglingId === item.productId"
          @click="onToggleShelf(item)"
        >
          {{ Number(item.shelfStatus) === 1 ? "下架" : "上架" }}
        </wd-button>
      </view>
    </view>

    <view class="fab">
      <wd-button type="primary" block @click="goCreate">新建商品</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 本店商品列表：筛选、编辑入口、上下架 */
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { changeMyProductShelfStatus, listMyProducts } from "@/api/merchantProduct";
import { requireOpenMerchant } from "@/composables/useMerchantGate";
import { openMerchantGoodsEdit } from "@/constants/routes";
import type { MallProduct } from "@/types/product";
import { productCoverUrl, productInitial } from "@/utils/product";

const tabs = [
  { label: "全部", value: undefined as number | undefined },
  { label: "在售", value: 1 },
  { label: "下架", value: 0 },
];

/** 上架状态筛选 */
const shelfFilter = ref<number | undefined>(undefined);
const list = ref<MallProduct[]>([]);
const loading = ref(false);
/** 正在切换上下架的商品ID */
const togglingId = ref<string | null>(null);

/** 加载本店商品 */
async function load() {
  if (!(await requireOpenMerchant())) {
    return;
  }
  loading.value = true;
  try {
    const page = await listMyProducts({
      shelfStatus: shelfFilter.value,
      pageNum: 1,
      pageSize: 50,
    });
    list.value = page?.rows || [];
  } finally {
    loading.value = false;
  }
}

/** 切换筛选 Tab */
function onTab(value: number | undefined) {
  shelfFilter.value = value;
  load();
}

/** 新建商品 */
function goCreate() {
  openMerchantGoodsEdit();
}

/** 编辑商品 */
function goEdit(productId: string) {
  openMerchantGoodsEdit(productId);
}

/** 切换上下架 */
async function onToggleShelf(item: MallProduct) {
  const next = Number(item.shelfStatus) === 1 ? 0 : 1;
  togglingId.value = item.productId;
  try {
    await changeMyProductShelfStatus(item.productId, next);
    uni.showToast({ title: next === 1 ? "已上架" : "已下架", icon: "success" });
    await load();
  } finally {
    togglingId.value = null;
  }
}

onShow(() => {
  load();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
  box-sizing: border-box;
  background: $color-bg;
}
.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.tab {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #666;
  background: $color-surface;
}
.tab.on {
  color: #fff;
  background: $color-brand;
}
.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 12rpx;
  background: linear-gradient(145deg, #d8ebe4 0%, #b7d4c9 100%);
  color: $color-brand;
  font-size: 36rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.thumb-img {
  width: 100%;
  height: 100%;
}
.main {
  flex: 1;
  min-width: 0;
}
.name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-ink;
}
.meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #888;
}
.arrow {
  color: #ccc;
  font-size: 36rpx;
  margin-left: 12rpx;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
}
.empty {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
.fab {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
}
</style>
