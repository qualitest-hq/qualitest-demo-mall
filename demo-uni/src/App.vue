<script setup lang="ts">
/**
 * 应用根组件。
 * 冷启动时从本地恢复登录态；全局样式在 page 上挂色板 CSS 变量并设置页面底色。
 */
import { onLaunch } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";

onLaunch(() => {
  useUserStore().hydrate();
});
</script>

<style lang="scss">
/**
 * 将 SCSS 色板输出为 page 上的 CSS 变量，供组件库主题与非 SCSS 场景使用。
 * 左侧美元开头的色板名由 uni.scss 注入，此处可直接引用。
 */
page {
  /* 业务可读的色板 CSS 变量 */
  --color-brand: #{$color-brand};
  --color-price: #{$color-price};
  --color-bg: #{$color-bg};
  --color-surface: #{$color-surface};
  --color-ink: #{$color-ink};
  --radius-base: #{$radius-base};

  /* 组件库主题色，与上方业务色板同源 */
  --wot-color-theme: var(--color-brand);
  --wot-color-danger: var(--color-price);

  background-color: var(--color-bg);
  color: var(--color-ink);
  font-size: 28rpx;
}
</style>
