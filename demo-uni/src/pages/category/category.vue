<template>
  <view class="page">
    <view class="body">
      <scroll-view scroll-y class="side">
        <view
          class="side-item"
          :class="{ on: activeId === '' }"
          @click="selectCategory('')"
        >
          全部
        </view>
        <view
          v-for="c in categories"
          :key="c.categoryId"
          class="side-item"
          :class="{ on: activeId === c.categoryId }"
          @click="selectCategory(c.categoryId)"
        >
          {{ c.categoryName }}
        </view>
      </scroll-view>

      <scroll-view scroll-y class="main">
        <view class="main-head">
          <text>{{ activeName }} · {{ products.length }} 件</text>
          <text class="top-search" @click="openSearch">搜索</text>
        </view>
        <view v-if="loading" class="state">加载中…</view>
        <view v-else-if="!products.length" class="state">
          <wd-status-tip image="content" tip="该分类暂无在售商品" />
        </view>
        <view v-else class="list">
          <ProductListRow
            v-for="p in products"
            :key="p.productId"
            :product="p"
            @click="onProduct"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 分类 Tab 页。
 * 左侧切换分类（含全部）；右侧按当前分类拉商品，并只展示有库存行。
 * 若首页写入了待选分类主键，本页显示时读取并清空，用于选中对应侧栏。
 */
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import ProductListRow from "@/components/ProductListRow.vue";
import { listEnabledCategories, listProducts } from "@/api/product";
import { openProduct, openSearch } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage";
import type { MallCategory, MallProduct } from "@/types/product";
import { filterInStockProducts } from "@/utils/product";
import { getStorage, removeStorage } from "@/utils/storage";

/** 侧栏分类数据 */
const categories = ref<MallCategory[]>([]);
/** 右侧商品列表 */
const products = ref<MallProduct[]>([]);
/** 当前选中的分类主键；空字符串表示全部 */
const activeId = ref("");
/** 商品列表加载中 */
const loading = ref(false);
/** 分类是否已成功加载过，避免重复请求 */
const catsLoaded = ref(false);

/** 右侧标题用的分类名 */
const activeName = computed(() => {
  if (!activeId.value) {
    return "全部";
  }
  return categories.value.find((c) => c.categoryId === activeId.value)?.categoryName || "分类";
});

/** 首次进入时加载分类侧栏 */
async function ensureCategories() {
  if (catsLoaded.value) {
    return;
  }
  const list = await listEnabledCategories();
  categories.value = list || [];
  catsLoaded.value = true;
}

/** 按当前分类拉取有库存商品 */
async function loadProducts() {
  loading.value = true;
  try {
    const page = await listProducts({
      categoryId: activeId.value || undefined,
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

/** 切换侧栏分类并刷新右侧列表 */
function selectCategory(id: string) {
  if (activeId.value === id) {
    return;
  }
  activeId.value = id;
  loadProducts();
}

/** 打开商品详情 */
function onProduct(p: MallProduct) {
  openProduct(p.productId);
}

/**
 * Tab 每次显示时：
 * 1. 确保分类已加载
 * 2. 消费首页传来的待选分类
 * 3. 刷新商品列表
 */
onShow(async () => {
  try {
    await ensureCategories();
    const pending = getStorage<string>(STORAGE_KEYS.PENDING_CATEGORY_ID, "");
    if (pending) {
      removeStorage(STORAGE_KEYS.PENDING_CATEGORY_ID);
      activeId.value = pending;
    }
    await loadProducts();
  } catch {
    // 分类或列表失败时保持当前界面，错误提示由请求封装处理
  }
});
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $color-bg;
  box-sizing: border-box;
}

.top-search {
  font-size: 26rpx;
  color: $color-brand;
  font-weight: 650;
}

.body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.side {
  width: 180rpx;
  height: 100%;
  background: #f0f0f0;
}

.side-item {
  padding: 28rpx 20rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;

  &.on {
    background: $color-surface;
    color: $color-brand;
    font-weight: 650;
  }
}

.main {
  flex: 1;
  height: 100%;
  background: $color-surface;
}

.main-head {
  padding: 20rpx 24rpx;
  font-size: 24rpx;
  color: #888;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list {
  padding: 8rpx 0 32rpx;
}

.state {
  padding: 64rpx 24rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
