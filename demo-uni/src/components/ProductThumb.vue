<template>
  <!-- 无商品主图时用色块 + 品名首字占位 -->
  <view class="thumb" :class="[size, { muted: muted }]">
    <text class="text">{{ initial }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 商品缩略图占位组件。
 * 接口暂未返回主图时，列表、购物车、结算等复用同一色块与首字，避免各页各自写渐变样式。
 */
import { computed } from "vue";
import { productInitial } from "@/utils/product";

const props = withDefaults(
  defineProps<{
    /** 商品名，取第一个可见字符展示 */
    name?: string | null;
    /** 尺寸：md 购物车行，sm 结算明细行 */
    size?: "md" | "sm";
    /** 失效等场景降低饱和度 */
    muted?: boolean;
  }>(),
  {
    name: "",
    size: "md",
    muted: false,
  },
);

/** 色块上显示的首字 */
const initial = computed(() => productInitial(props.name));
</script>

<style lang="scss" scoped>
.thumb {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(145deg, #d8ebe4 0%, #b7d4c9 100%);
  box-sizing: border-box;
}

.thumb.md {
  width: 176rpx;
  height: 176rpx;
}

.thumb.sm {
  width: 128rpx;
  height: 128rpx;
}

.thumb.muted {
  filter: grayscale(0.7);
  opacity: 0.9;
}

.text {
  font-weight: 700;
  color: $color-brand;
  opacity: 0.9;
}

.md .text {
  font-size: 56rpx;
}

.sm .text {
  font-size: 44rpx;
}
</style>
