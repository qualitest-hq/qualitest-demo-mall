<template>
  <!-- 底部半屏：展示价库存、规格单选、数量步进；确认后关闭并回传所选规格 -->
  <wd-popup
    v-model="visible"
    position="bottom"
    closable
    :safe-area-inset-bottom="true"
    root-portal
    custom-style="border-radius: 24rpx 24rpx 0 0;"
    @close="onClose"
  >
    <view class="sheet">
      <view class="head">
        <view class="thumb">
          <image v-if="coverSrc" class="thumb-img" :src="coverSrc" mode="aspectFill" />
          <text v-else class="thumb-text">{{ initial }}</text>
        </view>
        <view class="head-info">
          <AppPrice :value="displayPrice" />
          <text v-if="displayMarket" class="old">¥{{ displayMarket }}</text>
          <text class="stock">库存 {{ displayStock }}</text>
          <text class="picked">已选：{{ pickedLabel }}</text>
        </view>
      </view>

      <view class="section">
        <text class="label">规格</text>
        <view class="opts">
          <view
            v-for="sku in skus"
            :key="sku.skuId"
            class="opt"
            :class="{
              on: sku.skuId === selectedSkuId,
              disabled: !isSkuUsable(sku),
            }"
            @click="selectSku(sku)"
          >
            <text>{{ sku.skuName || "默认规格" }}</text>
            <text v-if="!isSkuUsable(sku)" class="tag">缺</text>
          </view>
        </view>
      </view>

      <view class="section row">
        <text class="label">数量</text>
        <wd-input-number v-model="qty" :min="1" :max="qtyMax" />
      </view>

      <wd-button type="primary" size="large" block :disabled="!canConfirm" @click="onConfirm">
        {{ confirmText }}
      </wd-button>
    </view>
  </wd-popup>
</template>

<script setup lang="ts">
/**
 * 商品规格选择半屏。
 * 规格以名称列表单选；选中后即时刷新价与库存；确认时把规格、数量与打开意图回传父组件。
 */
import { computed, ref, watch } from "vue";
import AppPrice from "@/components/AppPrice.vue";
import type { MallProductSku } from "@/types/product";
import { formatMoney, isSkuUsable, pickDefaultSku, productInitial } from "@/utils/product";
import { resolveResourceUrl } from "@/utils/resource";

/**
 * 打开弹层时的业务意图。
 * select：仅确认已选规格；add：准备加购；buy：准备立即购买。
 * 具体后续动作由父组件根据意图决定。
 */
export type SkuNext = "select" | "add" | "buy";

const props = withDefaults(
  defineProps<{
    /** 是否显示弹层 */
    modelValue: boolean;
    /** 商品名称，用于无图时的首字占位 */
    productName?: string;
    /** 封面图路径 */
    coverImage?: string | null;
    /** 可选规格列表 */
    skus?: MallProductSku[];
    /** 未选中规格时的销售价兜底 */
    salePrice?: number | string | null;
    /** 未选中规格时的市场价兜底 */
    marketPrice?: number | string | null;
    /** 打开弹层时的确认意图 */
    next?: SkuNext;
    /** 外部已记住的规格主键，打开时优先选中 */
    skuId?: string;
  }>(),
  {
    productName: "",
    coverImage: "",
    skus: () => [],
    salePrice: 0,
    marketPrice: null,
    next: "select",
    skuId: "",
  },
);

/** 封面可展示地址 */
const coverSrc = computed(() => resolveResourceUrl(props.coverImage));

const emit = defineEmits<{
  /** 同步显示状态（支持 v-model） */
  (e: "update:modelValue", value: boolean): void;
  /** 用户确认有效规格 */
  (
    e: "confirm",
    payload: { sku: MallProductSku; qty: number; next: SkuNext },
  ): void;
}>();

/** 弹层显隐，双向绑定到 modelValue */
const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});

/** 当前选中的规格主键 */
const selectedSkuId = ref("");
/** 购买数量 */
const qty = ref(1);

/** 头图占位首字 */
const initial = computed(() => productInitial(props.productName));

/** 当前选中的规格对象 */
const selectedSku = computed(
  () => props.skus.find((s) => s.skuId === selectedSkuId.value) || null,
);

/** 展示销售价：优先规格价，否则用商品价 */
const displayPrice = computed(
  () => selectedSku.value?.salePrice ?? props.salePrice ?? 0,
);

/** 展示划线价文案 */
const displayMarket = computed(() =>
  formatMoney(selectedSku.value?.marketPrice ?? props.marketPrice),
);

/** 当前规格库存 */
const displayStock = computed(() => Number(selectedSku.value?.stock ?? 0));

/** 数量上限至少为 1，避免步进器最大值非法 */
const qtyMax = computed(() => Math.max(1, displayStock.value || 1));

/** 已选规格文案 */
const pickedLabel = computed(() => selectedSku.value?.skuName || "请选择规格");

/** 仅当选中可选规格时允许确认 */
const canConfirm = computed(() => {
  const sku = selectedSku.value;
  return Boolean(sku && isSkuUsable(sku));
});

/** 主按钮文案随打开意图变化 */
const confirmText = computed(() => {
  if (props.next === "add") {
    return "加入购物车";
  }
  if (props.next === "buy") {
    return "立即购买";
  }
  return "确定";
});

/** 弹层打开时初始化选中规格与数量 */
watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      return;
    }
    const fromProp = props.skus.find((s) => s.skuId === props.skuId);
    const fallback = pickDefaultSku(props.skus);
    selectedSkuId.value = fromProp?.skuId || fallback?.skuId || "";
    qty.value = 1;
  },
);

/** 库存变小时，把数量压回上限内 */
watch(displayStock, (stock) => {
  if (qty.value > stock) {
    qty.value = Math.max(1, stock || 1);
  }
});

/**
 * 点击某个规格。
 * 不可选时提示；可选则切换选中并重置数量为 1。
 */
function selectSku(sku: MallProductSku) {
  if (!isSkuUsable(sku)) {
    uni.showToast({ title: "该规格暂无库存", icon: "none" });
    return;
  }
  selectedSkuId.value = sku.skuId;
  qty.value = 1;
}

/** 关闭弹层 */
function onClose() {
  emit("update:modelValue", false);
}

/**
 * 确认当前选择。
 * 校验通过后回传规格、数量与意图，并关闭弹层。
 */
function onConfirm() {
  const sku = selectedSku.value;
  if (!sku || !isSkuUsable(sku)) {
    uni.showToast({ title: "请选择有货规格", icon: "none" });
    return;
  }
  emit("confirm", { sku, qty: Number(qty.value) || 1, next: props.next });
  emit("update:modelValue", false);
}
</script>

<style lang="scss" scoped>
.sheet {
  padding: 32rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.head {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-base;
  background: linear-gradient(145deg, #d8ebe4 0%, #b7d4c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-text {
  font-size: 56rpx;
  font-weight: 700;
  color: $color-brand;
  opacity: 0.55;
}

.head-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-top: 8rpx;
}

.old {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
}

.stock,
.picked {
  font-size: 24rpx;
  color: #666;
}

.section {
  margin-bottom: 32rpx;
}

.section.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  display: block;
  font-size: 26rpx;
  color: $color-ink;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.section.row .label {
  margin-bottom: 0;
}

.opts {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.opt {
  position: relative;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: $color-ink;
  border: 2rpx solid transparent;

  &.on {
    background: rgba(47, 111, 94, 0.08);
    border-color: $color-brand;
    color: $color-brand;
  }

  &.disabled {
    color: #bbb;
  }
}

.tag {
  margin-left: 8rpx;
  font-size: 20rpx;
  color: #bbb;
}
</style>
