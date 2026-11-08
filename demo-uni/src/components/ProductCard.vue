<template>
  <!-- 双列商品卡：封面占位、标题、销售价、销量；点击把商品回传给父级 -->
  <view class="card" @click="onClick">
    <view class="cover">
      <text class="cover-text">{{ initial }}</text>
    </view>
    <view class="body">
      <text class="title">{{ product.productName }}</text>
      <view class="meta">
        <AppPrice :value="product.salePrice" />
        <text v-if="salesText" class="sales">{{ salesText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 首页等场景的双列商品卡片。
 * 只负责展示与点击事件，不发起网络请求。
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
  /** 用户点击卡片 */
  (e: "click", product: MallProduct): void;
}>();

/** 无主图时封面显示的首字 */
const initial = computed(() => productInitial(props.product.productName));

/** 销量文案；销量为 0 时不展示 */
const salesText = computed(() => {
  const n = Number(props.product.salesCount ?? 0);
  return n > 0 ? `已售 ${n}` : "";
});

/** 把当前商品交给父组件处理跳转等逻辑 */
function onClick() {
  emit("click", props.product);
}
</script>

<style lang="scss" scoped>
.card {
  background: $color-surface;
  border-radius: $radius-base;
  overflow: hidden;
}

.cover {
  height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #d8ebe4 0%, #b7d4c9 100%);
}

.cover-text {
  font-size: 72rpx;
  font-weight: 700;
  color: $color-brand;
  opacity: 0.55;
}

.body {
  padding: 16rpx 20rpx 20rpx;
}

.title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 26rpx;
  line-height: 1.4;
  color: $color-ink;
  min-height: 72rpx;
}

.meta {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8rpx;
}

.sales {
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}
</style>
