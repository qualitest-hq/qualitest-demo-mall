<template>
  <view class="page">
    <view class="head">
      <view class="search-row" @click="goSearch">
        <text class="search-brand">{{ appConfig.name }}</text>
        <text class="search-ph">搜索商品</text>
      </view>
      <view class="msg" @click="onMsg">
        <text class="msg-icon">铃</text>
      </view>
    </view>

    <view class="banner">
      <text class="banner-title">春日上新</text>
      <text class="banner-sub">精选日用 · 本地联调演示</text>
    </view>

    <view class="cats">
      <view
        v-for="item in categoryTiles"
        :key="item.key"
        class="cat"
        @click="onCategoryTile(item)"
      >
        <view class="cat-icon">{{ item.icon }}</view>
        <text class="cat-name">{{ item.name }}</text>
      </view>
    </view>

    <view class="seckill">
      <view class="seckill-head">
        <text class="seckill-title">限时秒杀</text>
        <text class="seckill-tip">示意位</text>
      </view>
      <scroll-view scroll-x class="seckill-scroll">
        <view v-for="(p, i) in seckillItems" :key="i" class="seckill-card" @click="onProduct(p)">
          <view class="seckill-cover">{{ productInitial(p.productName) }}</view>
          <AppPrice :value="p.salePrice" />
        </view>
      </scroll-view>
    </view>

    <view class="feed-head">
      <text class="feed-title">猜你喜欢</text>
    </view>
    <view v-if="loading && !feed.length" class="state">加载中…</view>
    <view v-else-if="!feed.length" class="state">暂无商品</view>
    <view v-else class="feed">
      <view v-for="p in feed" :key="p.productId" class="feed-item">
        <ProductCard :product="p" @click="onProduct" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 商城首页。
 * 顶部可进搜索；分类宫格跳转分类 Tab；猜你喜欢双列展示有货商品。
 * 横幅与限时秒杀区为前端示意，不请求活动接口。
 */
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import ProductCard from "@/components/ProductCard.vue";
import { listEnabledCategories, listProducts } from "@/api/product";
import { appConfig } from "@/config/app";
import { ROUTES, openCouponList, openProduct, openSearch } from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import { STORAGE_KEYS } from "@/constants/storage";
import type { MallCategory, MallProduct } from "@/types/product";
import { filterInStockProducts, productInitial } from "@/utils/product";
import { setStorage } from "@/utils/storage";

/** 首页分类宫格一项 */
interface CategoryTile {
  /** 列表渲染键 */
  key: string;
  /** 展示名称 */
  name: string;
  /** 宫格图标字 */
  icon: string;
  /** 真实分类主键；领券项没有 */
  categoryId?: string;
  /** 特殊动作，如领券占位 */
  action?: "coupon";
}

const user = useUserStore();

/** 接口返回的分类列表 */
const categories = ref<MallCategory[]>([]);
/** 猜你喜欢双列商品 */
const feed = ref<MallProduct[]>([]);
/** 首屏加载中 */
const loading = ref(false);

/**
 * 把分类拼成最多 10 个宫格。
 * 前面放真实分类，最后补一个「领券」入口（暂未接券接口）。
 */
const categoryTiles = computed<CategoryTile[]>(() => {
  const icons = ["杯", "壶", "本", "灯", "皂", "袋", "茶", "居"];
  const tiles: CategoryTile[] = categories.value.slice(0, 9).map((c, i) => ({
    key: c.categoryId,
    name: c.categoryName,
    icon: icons[i % icons.length],
    categoryId: c.categoryId,
  }));
  tiles.push({ key: "coupon", name: "领券", icon: "券", action: "coupon" });
  return tiles.slice(0, 10);
});

/** 秒杀横滑取猜你喜欢前几条做示意 */
const seckillItems = computed(() => feed.value.slice(0, 3));

/** 并行加载分类与商品列表 */
async function loadData() {
  loading.value = true;
  try {
    const [cats, page] = await Promise.all([
      listEnabledCategories(),
      listProducts({ pageNum: 1, pageSize: 20 }),
    ]);
    categories.value = cats || [];
    feed.value = filterInStockProducts(page?.rows).slice(0, 6);
  } catch {
    // 失败提示由请求封装弹出；保留页面上一次成功数据
  } finally {
    loading.value = false;
  }
}

/** 进入搜索页 */
function goSearch() {
  openSearch();
}

/** 消息入口占位 */
function onMsg() {
  uni.showToast({ title: "消息中心暂未开放", icon: "none" });
}

/**
 * 点击分类宫格。
 * 领券项只提示；普通分类先写入待选主键再切到分类 Tab。
 */
function onCategoryTile(item: CategoryTile) {
  if (item.action === "coupon") {
    if (!user.isLoggedIn) {
      uni.navigateTo({ url: ROUTES.LOGIN });
      return;
    }
    openCouponList();
    return;
  }
  if (item.categoryId) {
    setStorage(STORAGE_KEYS.PENDING_CATEGORY_ID, item.categoryId);
  }
  uni.switchTab({ url: ROUTES.CATEGORY });
}

/** 打开商品详情 */
function onProduct(p: MallProduct) {
  openProduct(p.productId);
}

/** 每次显示首页时刷新数据 */
onShow(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 32rpx;
  background: $color-bg;
  box-sizing: border-box;
}

.head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx 16rpx;
  background: $color-brand;
}

.search-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 999rpx;
  padding: 16rpx 28rpx;
}

.search-brand {
  color: $color-brand;
  font-size: 24rpx;
  font-weight: 650;
  border-right: 1px solid #eee;
  padding-right: 16rpx;
}

.search-ph {
  font-size: 26rpx;
  color: #999;
}

.msg {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-icon {
  color: #fff;
  font-size: 24rpx;
}

.banner {
  margin: 24rpx;
  padding: 40rpx 32rpx;
  border-radius: $radius-base;
  background: linear-gradient(120deg, #2f6f5e 0%, #4a9a82 100%);
  color: #fff;
}

.banner-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.banner-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.85;
}

.cats {
  margin: 0 24rpx;
  padding: 24rpx 8rpx 8rpx;
  background: $color-surface;
  border-radius: $radius-base;
  display: flex;
  flex-wrap: wrap;
}

.cat {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.cat-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #eef6f3;
  color: $color-brand;
  font-size: 28rpx;
  font-weight: 650;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-name {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #555;
}

.seckill {
  margin: 24rpx;
  padding: 24rpx;
  background: $color-surface;
  border-radius: $radius-base;
}

.seckill-head {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.seckill-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-ink;
}

.seckill-tip {
  font-size: 22rpx;
  color: #999;
}

.seckill-scroll {
  white-space: nowrap;
}

.seckill-card {
  display: inline-flex;
  flex-direction: column;
  gap: 8rpx;
  width: 180rpx;
  margin-right: 16rpx;
  vertical-align: top;
}

.seckill-cover {
  height: 180rpx;
  border-radius: 8rpx;
  background: linear-gradient(145deg, #f7e3df 0%, #efc4bc 100%);
  color: $color-price;
  font-size: 48rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.feed-head {
  padding: 8rpx 24rpx 16rpx;
}

.feed-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-ink;
}

.feed {
  padding: 0 24rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16rpx 0;
}

.feed-item {
  width: calc(50% - 8rpx);

  :deep(.card) {
    height: 100%;
  }
}

.state {
  padding: 48rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>
