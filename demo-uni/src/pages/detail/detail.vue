<template>
  <view class="page">
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!product" class="state">商品不存在或已下架</view>
    <template v-else>
      <view class="gallery">
        <view class="gallery-cover">
          <text class="gallery-text">{{ productInitial(product.productName) }}</text>
        </view>
        <view class="gallery-back" @click="navigateBackOrHome">返回</view>
      </view>

      <view class="panel">
        <view class="price-line">
          <AppPrice :value="displayPrice" />
          <text v-if="displayMarket" class="old">¥{{ displayMarket }}</text>
          <text class="sales">已售 {{ product.salesCount || 0 }}</text>
        </view>
        <text class="title">{{ product.productName }}</text>
      </view>

      <view class="cell" @click="openSku('select')">
        <text class="cell-label">选择</text>
        <text class="cell-value">{{ selectedLabel }}</text>
        <text class="cell-arrow">›</text>
      </view>
      <view class="cell">
        <text class="cell-label">发货</text>
        <text class="cell-value">{{ freightText }}</text>
      </view>
      <view class="cell">
        <text class="cell-label">单位</text>
        <text class="cell-value">{{ product.unitName || "件" }}</text>
      </view>

      <view class="desc">
        <text class="desc-title">商品详情</text>
        <text class="desc-body">{{ product.remark || "暂无图文详情" }}</text>
        <view class="desc-placeholder">
          <text>{{ productInitial(product.productName) }}</text>
        </view>
      </view>

      <view class="buybar-space" />
      <view class="buybar">
        <view class="buy-side" @click="toastSoon('店铺')">店</view>
        <view class="buy-side" @click="toastSoon('客服')">讯</view>
        <wd-button
          type="warning"
          size="medium"
          :disabled="!canBuy"
          custom-style="flex:1;margin-right:12rpx;"
          @click="openSku('add')"
        >
          加入购物车
        </wd-button>
        <wd-button type="primary" size="medium" :disabled="!canBuy" custom-style="flex:1;" @click="openSku('buy')">
          立即购买
        </wd-button>
      </view>
    </template>

    <SkuSheet
      v-model="skuVisible"
      :product-name="product?.productName"
      :skus="product?.skus || []"
      :sale-price="product?.salePrice"
      :market-price="product?.marketPrice"
      :sku-id="selectedSkuId"
      :next="skuNext"
      @confirm="onSkuConfirm"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 商品详情页。
 * 展示价、运费、单位与备注；通过半屏选择规格并回填已选信息。
 * 加购与立即购买在确认规格后暂以提示代替真实下单接口。
 */
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPrice from "@/components/AppPrice.vue";
import SkuSheet, { type SkuNext } from "@/components/SkuSheet.vue";
import { getProductDetail } from "@/api/product";
import { navigateBackOrHome } from "@/constants/routes";
import type { MallProduct, MallProductSku } from "@/types/product";
import { formatMoney, pickDefaultSku, productInitial } from "@/utils/product";

/** 当前商品详情；加载失败或无主键时为空 */
const product = ref<MallProduct | null>(null);
/** 详情请求中 */
const loading = ref(true);
/** 规格半屏是否打开 */
const skuVisible = ref(false);
/** 打开半屏时的确认意图 */
const skuNext = ref<SkuNext>("select");
/** 页面上记住的已选规格主键 */
const selectedSkuId = ref("");
/** 页面上记住的已选数量 */
const selectedQty = ref(1);

/** 当前已选规格对象 */
const selectedSku = computed(
  () => (product.value?.skus || []).find((s) => s.skuId === selectedSkuId.value) || null,
);

/** 页头销售价：优先规格价 */
const displayPrice = computed(
  () => selectedSku.value?.salePrice ?? product.value?.salePrice ?? 0,
);

/** 页头划线价文案 */
const displayMarket = computed(() =>
  formatMoney(selectedSku.value?.marketPrice ?? product.value?.marketPrice),
);

/** 「选择」行展示的已选规格与数量 */
const selectedLabel = computed(() => {
  if (!selectedSku.value) {
    return "请选择规格";
  }
  return `${selectedSku.value.skuName} ×${selectedQty.value}`;
});

/** 发货行文案：无运费或固定运费 */
const freightText = computed(() => {
  const amount = Number(product.value?.freightAmount ?? 0);
  if (!amount) {
    return "包邮 / 无运费";
  }
  return `固定运费 ¥${formatMoney(amount)}`;
});

/** 上架中才允许加购与购买 */
const canBuy = computed(() => Number(product.value?.shelfStatus ?? 1) === 1);

/** 店铺、客服等未接入能力的占位提示 */
function toastSoon(name: string) {
  uni.showToast({ title: `${name}暂未开放`, icon: "none" });
}

/**
 * 打开规格半屏。
 * @param next 确认后希望执行的意图
 */
function openSku(next: SkuNext) {
  if (!canBuy.value) {
    uni.showToast({ title: "商品已下架", icon: "none" });
    return;
  }
  skuNext.value = next;
  skuVisible.value = true;
}

/**
 * 规格半屏确认回调。
 * 始终回填规格与数量；加购、购买在未接购物车/结算接口时只提示。
 */
function onSkuConfirm(payload: { sku: MallProductSku; qty: number; next: SkuNext }) {
  selectedSkuId.value = payload.sku.skuId;
  selectedQty.value = payload.qty;
  if (payload.next === "add") {
    uni.showToast({ title: "购物车暂未开放", icon: "none" });
    return;
  }
  if (payload.next === "buy") {
    uni.showToast({ title: "结算暂未开放", icon: "none" });
    return;
  }
  uni.showToast({ title: "已选择规格", icon: "none" });
}

/** 按主键加载详情并初始化默认规格 */
async function loadDetail(productId: string) {
  loading.value = true;
  try {
    const data = await getProductDetail(productId);
    product.value = data;
    const def = pickDefaultSku(data.skus);
    selectedSkuId.value = def?.skuId || "";
    selectedQty.value = 1;
  } catch {
    product.value = null;
  } finally {
    loading.value = false;
  }
}

/** 从路由查询参数读取商品主键并加载 */
onLoad((query) => {
  const id = String(query?.productId || "");
  if (!id) {
    loading.value = false;
    product.value = null;
    return;
  }
  loadDetail(id);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.gallery {
  position: relative;
  height: 720rpx;
  background: #e8f2ee;
}

.gallery-cover {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #d8ebe4 0%, #b7d4c9 55%, #9fc4b5 100%);
}

.gallery-text {
  font-size: 160rpx;
  font-weight: 700;
  color: $color-brand;
  opacity: 0.35;
}

.gallery-back {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 24rpx;
}

.panel {
  margin-top: -16rpx;
  padding: 28rpx 28rpx 24rpx;
  background: $color-surface;
  border-radius: 24rpx 24rpx 0 0;
  position: relative;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.old {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.sales {
  margin-left: auto;
  font-size: 22rpx;
  color: #999;
}

.title {
  display: block;
  margin-top: 16rpx;
  font-size: 32rpx;
  font-weight: 650;
  color: $color-ink;
  line-height: 1.4;
}

.cell {
  margin-top: 16rpx;
  padding: 28rpx;
  background: $color-surface;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cell-label {
  width: 80rpx;
  font-size: 26rpx;
  color: #888;
  flex-shrink: 0;
}

.cell-value {
  flex: 1;
  font-size: 26rpx;
  color: $color-ink;
}

.cell-arrow {
  color: #ccc;
  font-size: 32rpx;
}

.desc {
  margin-top: 16rpx;
  padding: 28rpx;
  background: $color-surface;
}

.desc-title {
  display: block;
  font-size: 28rpx;
  font-weight: 650;
  color: $color-ink;
  margin-bottom: 12rpx;
}

.desc-body {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.desc-placeholder {
  margin-top: 24rpx;
  height: 280rpx;
  border-radius: $radius-base;
  background: #f3f7f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-brand;
  font-size: 72rpx;
  font-weight: 700;
  opacity: 0.35;
}

.buybar-space {
  height: 140rpx;
}

.buybar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx calc(16rpx + env(safe-area-inset-bottom));
  background: $color-surface;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.buy-side {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f5f5f5;
  color: #666;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.state {
  padding: 120rpx 32rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
</style>
