<template>
  <!-- 横向商品行：缩略占位、标题、价格、销量；分类页与搜索页共用 -->
  <view class="row" @click="onClick">
    <view class="thumb">{{ initial }}</view>
    <view class="info">
      <text class="name">{{ product.productName }}</text>
      <view class="price-row">
        <AppPrice :value="product.salePrice" />
        <text class="sales">已售 {{ product.salesCount || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 列表场景下的横向商品行。
 * 布局与双列卡片不同；同样只展示与回传点击，不请求接口。
 */
import { computed } from "vue";
import AppPrice from "@/components/AppPrice.vue";
import type { MallProduct } from "@/types/product";
import { productInitial } from "@/utils/product";

const props = defineProps<{
  /** 要展示的商品 */
  product: MallProduct;
}>();

const emit = defineEmits<{
  /** 用户点击整行 */
  (e: "click", product: MallProduct): void;
}>();

/** 无主图时缩略区显示的首字 */
const initial = computed(() => productInitial(props.product.productName));

/** 把当前商品交给父组件 */
function onClick() {
  emit("click", props.product);
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 24rpx;
}

.thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  background: linear-gradient(145deg, #d8ebe4 0%, #b7d4c9 100%);
  color: $color-brand;
  font-size: 40rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.name {
  font-size: 28rpx;
  color: $color-ink;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.sales {
  font-size: 22rpx;
  color: #999;
}
</style>
