<template>
  <!-- 价格：品牌价色 + 可选人民币符号 + 字号档 -->
  <text class="app-price" :class="[size, { muted: muted }]">
    <text v-if="showSymbol" class="symbol">¥</text>
    <text class="value">{{ display }}</text>
  </text>
</template>

<script setup lang="ts">
/**
 * 价格展示组件。
 * 统一价格色与两位小数，列表、底栏合计、收银台大额等复用，避免各页自行拼接货币符号。
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 金额，数字或可转成数字的字符串 */
    value?: number | string | null;
    /** 是否显示人民币符号，默认显示 */
    showSymbol?: boolean;
    /** 弱化样式，用于次要或失效金额 */
    muted?: boolean;
    /**
     * 字号档。
     * md 默认列表价；lg 底栏合计；xl 支付结果；hero 收银台大额。
     */
    size?: "md" | "lg" | "xl" | "hero";
  }>(),
  {
    value: 0,
    showSymbol: true,
    muted: false,
    size: "md",
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
/* 价格色来自全局 SCSS 变量 */
.app-price {
  color: $color-price;
  font-weight: 600;
  font-size: 28rpx;

  &.muted {
    color: #999;
    font-weight: 400;
  }

  &.lg {
    font-size: 36rpx;
    font-weight: 700;
  }

  &.xl {
    font-size: 56rpx;
    font-weight: 750;

    .symbol {
      font-size: 32rpx;
    }
  }

  &.hero {
    font-size: 72rpx;
    font-weight: 750;

    .symbol {
      font-size: 32rpx;
      margin-right: 4rpx;
    }
  }

  .symbol {
    font-size: 22rpx;
    margin-right: 2rpx;
  }
}
</style>
