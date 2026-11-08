<template>
  <!-- 商城价格：价格色金额，可选人民币符号 -->
  <text class="app-price" :class="{ muted: muted }">
    <text v-if="showSymbol" class="symbol">¥</text>
    <text class="value">{{ display }}</text>
  </text>
</template>

<script setup lang="ts">
/**
 * 价格展示组件。
 * 统一价格色与两位小数，列表与详情复用，避免各页各自拼接货币符号。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 金额，数字或可转成数字的字符串 */
    value?: number | string | null;
    /** 是否显示人民币符号，默认显示 */
    showSymbol?: boolean;
    /** 弱化样式，用于次要金额 */
    muted?: boolean;
  }>(),
  {
    value: 0,
    showSymbol: true,
    muted: false,
  },
);

/** 能转成数字则保留两位小数，否则原样展示 */
const display = computed(() => {
  const n = Number(props.value);
  if (Number.isNaN(n)) {
    return String(props.value ?? "");
  }
  return n.toFixed(2);
});
</script>

<style lang="scss" scoped>
/* 价格色来自全局 SCSS 变量注入 */
.app-price {
  color: $color-price;
  font-weight: 600;
  font-size: 28rpx;

  &.muted {
    color: #999;
    font-weight: 400;
  }

  .symbol {
    font-size: 22rpx;
    margin-right: 2rpx;
  }
}
</style>
