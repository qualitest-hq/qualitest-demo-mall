<template>
  <view class="page">
    <view class="bar">
      <text class="cancel" @click="navigateBackOrHome">取消</text>
      <input
        v-model="keyword"
        class="input"
        type="text"
        confirm-type="search"
        placeholder="搜索商品"
        focus
        @confirm="doSearch"
      />
      <text class="go" @click="doSearch">搜索</text>
    </view>

    <view v-if="searched" class="sort-bar">
      <text
        v-for="opt in sortOptions"
        :key="opt.value"
        class="sort-item"
        :class="{ on: sortBy === opt.value }"
        @click="onSort(opt.value)"
      >
        {{ opt.label }}
      </text>
    </view>

    <view v-if="searched" class="result-head">找到 {{ products.length }} 件</view>

    <view v-if="loading" class="state">搜索中…</view>
    <view v-else-if="searched && !products.length" class="state">
      <wd-status-tip image="search" tip="没有找到相关商品" />
    </view>
    <view v-else class="list">
      <view v-for="p in products" :key="p.productId" class="list-row">
        <ProductListRow :product="p" @click="onProduct" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 商品搜索页。
 * 用 keyword 模糊查询名称/简介；支持价格与销量排序；结果只保留有库存商品。
 */
import { ref } from "vue";
import ProductListRow from "@/components/ProductListRow.vue";
import { listProducts } from "@/api/product";
import { navigateBackOrHome, openProduct } from "@/constants/routes";
import type { MallProduct, ProductSortBy } from "@/types/product";
import { filterInStockProducts } from "@/utils/product";

/** 搜索框输入 */
const keyword = ref("");
/** 搜索结果列表 */
const products = ref<MallProduct[]>([]);
/** 是否正在请求 */
const loading = ref(false);
/** 是否已经发起过至少一次搜索（用于区分初始态与空结果） */
const searched = ref(false);
/** 当前排序 */
const sortBy = ref<ProductSortBy>("default");

const sortOptions: Array<{ label: string; value: ProductSortBy }> = [
  { label: "综合", value: "default" },
  { label: "价格↑", value: "priceAsc" },
  { label: "价格↓", value: "priceDesc" },
  { label: "销量", value: "salesDesc" },
];

/**
 * 执行搜索。
 * 关键词为空时提示；成功后写入过滤后的结果列表。
 */
async function doSearch() {
  const q = keyword.value.trim();
  if (!q) {
    uni.showToast({ title: "请输入关键词", icon: "none" });
    return;
  }
  loading.value = true;
  searched.value = true;
  try {
    const page = await listProducts({
      keyword: q,
      sortBy: sortBy.value,
      pageNum: 1,
      pageSize: 50,
    });
    products.value = filterInStockProducts(page?.rows);
  } catch {
    products.value = [];
  } finally {
    loading.value = false;
  }
}

/** 切换排序并重新搜索 */
function onSort(value: ProductSortBy) {
  if (sortBy.value === value) {
    return;
  }
  sortBy.value = value;
  if (searched.value && keyword.value.trim()) {
    doSearch();
  }
}

/** 打开商品详情 */
function onProduct(p: MallProduct) {
  openProduct(p.productId);
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: $color-surface;
}

.cancel {
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.input {
  flex: 1;
  height: 64rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.go {
  font-size: 28rpx;
  color: $color-brand;
  font-weight: 650;
  flex-shrink: 0;
}

.sort-bar {
  display: flex;
  gap: 8rpx;
  padding: 16rpx 24rpx 0;
  background: $color-surface;
}

.sort-item {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  border-radius: 999rpx;
  background: #f5f5f5;
}

.sort-item.on {
  color: $color-brand;
  background: rgba(47, 111, 94, 0.12);
  font-weight: 650;
}

.result-head {
  padding: 20rpx 24rpx 8rpx;
  font-size: 24rpx;
  color: #888;
  background: $color-surface;
}

.list {
  background: $color-surface;
}

.list-row {
  border-bottom: 1px solid #f5f5f5;
}

.state {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
