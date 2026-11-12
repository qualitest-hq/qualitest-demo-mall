<template>
  <!-- 有主图则展示图片，否则色块 + 品名首字 -->
  <view class="thumb" :class="[size, { muted: muted }]">
    <image v-if="src" class="img" :src="src" mode="aspectFill" />
    <text v-else class="text">{{ initial }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 商品缩略图组件。
 * 列表、购物车、结算等复用；无图时回退首字占位。
 */
import { computed } from "vue";
import { productInitial } from "@/utils/product";
import { resolveResourceUrl } from "@/utils/resource";

const props = withDefaults(
  defineProps<{
    /** 商品名，取第一个可见字符展示 */
    name?: string | null;
    /** 主图或封面路径（相对路径或完整 URL） */
    image?: string | null;
    /** 尺寸：md 购物车行，sm 结算明细行 */
    size?: "md" | "sm";
    /** 失效等场景降低饱和度 */
    muted?: boolean;
  }>(),
  {
    name: "",
    image: "",
    size: "md",
    muted: false,
  },
);

/** 可展示的图片地址 */
const src = computed(() => resolveResourceUrl(props.image));

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
  overflow: hidden;
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

.img {
  width: 100%;
  height: 100%;
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
