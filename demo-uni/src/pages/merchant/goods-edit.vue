<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label required">商品名称</text>
        <wd-input v-model="form.productName" clearable placeholder="请输入商品名称" />
      </view>
      <view class="field">
        <text class="label required">商品分类</text>
        <picker :range="categoryNames" :value="categoryIndex" @change="onCategoryChange">
          <view class="picker">{{ categoryLabel }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">主图</text>
        <view class="upload-row">
          <image
            v-if="mainImageUrl"
            class="thumb"
            :src="mainImageUrl"
            mode="aspectFill"
            @click="onPickMain"
          />
          <view v-else class="upload-slot" @click="onPickMain">
            <text class="plus">+</text>
            <text class="hint">上传</text>
          </view>
          <text v-if="form.mainImage" class="link" @click="form.mainImage = ''">清除</text>
        </view>
      </view>
      <view class="field">
        <text class="label">图集</text>
        <view class="upload-row wrap">
          <view v-for="(path, index) in form.galleryImages" :key="path + index" class="thumb-wrap">
            <image class="thumb" :src="resolveResourceUrl(path)" mode="aspectFill" />
            <text class="remove" @click="removeGallery(index)">×</text>
          </view>
          <view v-if="form.galleryImages.length < 6" class="upload-slot" @click="onPickGallery">
            <text class="plus">+</text>
            <text class="hint">最多6张</text>
          </view>
        </view>
      </view>
      <view class="field">
        <text class="label">简介</text>
        <wd-input v-model="form.intro" clearable placeholder="C 端详情展示的简介" />
      </view>
      <view class="field">
        <text class="label">计量单位</text>
        <wd-input v-model="form.unitName" clearable placeholder="件" />
      </view>
      <view class="field">
        <text class="label">固定运费</text>
        <wd-input v-model="form.freightAmount" type="digit" clearable placeholder="0" />
      </view>
      <view class="field">
        <text class="label">上架状态</text>
        <view class="radios">
          <text class="radio" :class="{ on: form.shelfStatus === 1 }" @click="form.shelfStatus = 1">上架</text>
          <text class="radio" :class="{ on: form.shelfStatus === 0 }" @click="form.shelfStatus = 0">下架</text>
        </view>
      </view>
      <view class="field">
        <text class="label">备注</text>
        <wd-input v-model="form.remark" clearable placeholder="后台备注，选填" />
      </view>
    </view>

    <view class="card">
      <view class="sku-head">
        <text class="title">SKU 规格</text>
        <text class="link" @click="addSku">+ 添加</text>
      </view>
      <view v-for="(sku, index) in form.skus" :key="index" class="sku">
        <view class="sku-top">
          <text class="sku-lab">规格 {{ index + 1 }}</text>
          <text v-if="form.skus.length > 1" class="link danger" @click="removeSku(index)">删除</text>
        </view>
        <wd-input v-model="sku.skuName" clearable placeholder="规格名称，如 透明款" />
        <view class="sku-row">
          <wd-input v-model="sku.salePrice" type="digit" clearable placeholder="售价" />
          <wd-input v-model="sku.marketPrice" type="digit" clearable placeholder="划线价" />
          <wd-input v-model="sku.stock" type="number" clearable placeholder="库存" />
        </view>
      </view>
    </view>

    <wd-button type="primary" size="large" block :loading="submitting" @click="onSubmit">
      保存
    </wd-button>
  </view>
</template>

<script setup lang="ts">
/** 本店商品新建/编辑：SPU 与 SKU 一并提交，含主图/图集/简介 */
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { listEnabledCategories } from "@/api/product";
import { createMyProduct, getMyProductDetail, updateMyProduct } from "@/api/merchantProduct";
import { requireOpenMerchant } from "@/composables/useMerchantGate";
import { ROUTES } from "@/constants/routes";
import type { MallCategory, MerchantProductSkuSavePayload } from "@/types/product";
import { resolveResourceUrl } from "@/utils/resource";
import { chooseAndUploadImage } from "@/utils/upload";

/** 有值表示编辑 */
const productId = ref<string>("");
const categories = ref<MallCategory[]>([]);
const categoryIndex = ref(0);
const submitting = ref(false);

const form = reactive({
  productName: "",
  unitName: "件",
  freightAmount: "0",
  shelfStatus: 0 as number,
  mainImage: "",
  galleryImages: [] as string[],
  intro: "",
  remark: "",
  skus: [
    { skuName: "默认", salePrice: "", marketPrice: "", stock: "100" },
  ] as Array<{
    skuId?: string;
    skuName: string;
    salePrice: string;
    marketPrice: string;
    stock: string;
  }>,
});

const categoryNames = computed(() => categories.value.map((c) => c.categoryName));
const categoryLabel = computed(() => categoryNames.value[categoryIndex.value] || "请选择分类");
const mainImageUrl = computed(() => resolveResourceUrl(form.mainImage));

/** 选择分类 */
function onCategoryChange(e: { detail: { value: string } }) {
  categoryIndex.value = Number(e.detail.value) || 0;
}

/** 上传主图 */
async function onPickMain() {
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (uploaded) {
      form.mainImage = uploaded.path;
    }
  } catch {
    /* toast 已处理 */
  }
}

/** 上传图集 */
async function onPickGallery() {
  if (form.galleryImages.length >= 6) {
    return;
  }
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (uploaded) {
      form.galleryImages.push(uploaded.path);
    }
  } catch {
    /* toast 已处理 */
  }
}

/** 删除图集一张 */
function removeGallery(index: number) {
  form.galleryImages.splice(index, 1);
}

/** 追加 SKU 行 */
function addSku() {
  form.skus.push({ skuName: "", salePrice: "", marketPrice: "", stock: "0" });
}

/** 删除 SKU 行（至少保留一条） */
function removeSku(index: number) {
  if (form.skus.length <= 1) {
    return;
  }
  form.skus.splice(index, 1);
}

/** 加载可选分类 */
async function loadCategories() {
  categories.value = (await listEnabledCategories()) || [];
  if (categories.value.length && categoryIndex.value >= categories.value.length) {
    categoryIndex.value = 0;
  }
}

/** 回填编辑详情 */
async function loadDetail(id: string) {
  const detail = await getMyProductDetail(id);
  form.productName = detail.productName || "";
  form.unitName = detail.unitName || "件";
  form.freightAmount = String(detail.freightAmount ?? 0);
  form.shelfStatus = Number(detail.shelfStatus) === 1 ? 1 : 0;
  form.mainImage = detail.mainImage || "";
  form.galleryImages = [...(detail.galleryImages || [])];
  form.intro = detail.intro || "";
  form.remark = detail.remark || "";
  const idx = categories.value.findIndex((c) => String(c.categoryId) === String(detail.categoryId));
  categoryIndex.value = idx >= 0 ? idx : 0;
  if (detail.skus?.length) {
    form.skus = detail.skus.map((s) => ({
      skuId: s.skuId,
      skuName: s.skuName || "",
      salePrice: String(s.salePrice ?? ""),
      marketPrice: String(s.marketPrice ?? ""),
      stock: String(s.stock ?? 0),
    }));
  }
}

/** 组装保存入参 */
function buildPayload() {
  const category = categories.value[categoryIndex.value];
  if (!category?.categoryId) {
    throw new Error("请选择分类");
  }
  if (!form.productName.trim()) {
    throw new Error("请填写商品名称");
  }
  const skus: MerchantProductSkuSavePayload[] = form.skus.map((s) => {
    if (!s.skuName.trim()) {
      throw new Error("SKU名称不能为空");
    }
    const salePrice = Number(s.salePrice);
    const stock = Number(s.stock);
    if (Number.isNaN(salePrice) || salePrice < 0) {
      throw new Error("SKU售价无效");
    }
    if (Number.isNaN(stock) || stock < 0) {
      throw new Error("SKU库存无效");
    }
    return {
      skuId: s.skuId,
      skuName: s.skuName.trim(),
      salePrice,
      marketPrice: s.marketPrice === "" ? salePrice : Number(s.marketPrice),
      stock,
      status: 0,
    };
  });
  return {
    productId: productId.value || undefined,
    categoryId: String(category.categoryId),
    productName: form.productName.trim(),
    unitName: form.unitName.trim() || "件",
    freightAmount: Number(form.freightAmount || 0),
    mainImage: form.mainImage || "",
    galleryImages: form.galleryImages,
    intro: form.intro || "",
    shelfStatus: form.shelfStatus,
    remark: form.remark || undefined,
    skus,
  };
}

/** 提交新建或更新 */
async function onSubmit() {
  if (submitting.value) {
    return;
  }
  submitting.value = true;
  try {
    const payload = buildPayload();
    if (productId.value) {
      await updateMyProduct(payload);
    } else {
      await createMyProduct(payload);
    }
    uni.showToast({ title: "已保存", icon: "success" });
    setTimeout(() => {
      uni.navigateBack({
        fail: () => uni.redirectTo({ url: ROUTES.MERCHANT_GOODS }),
      });
    }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存失败";
    if (msg && !msg.includes("请求")) {
      uni.showToast({ title: msg, icon: "none" });
    }
  } finally {
    submitting.value = false;
  }
}

onLoad(async (query) => {
  if (!(await requireOpenMerchant())) {
    return;
  }
  await loadCategories();
  const id = query?.productId ? String(query.productId) : "";
  productId.value = id;
  if (id) {
    await loadDetail(id);
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 48rpx;
  box-sizing: border-box;
  background: $color-bg;
}
.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 8rpx 28rpx 28rpx;
  margin-bottom: 24rpx;
}
.field {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.field:last-child {
  border-bottom: none;
}
.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #666;
}
.label.required::before {
  content: "*";
  color: $color-price;
  margin-right: 6rpx;
}
.picker {
  padding: 16rpx 0;
  font-size: 28rpx;
  color: $color-ink;
}
.upload-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: nowrap;
}
.upload-row.wrap {
  flex-wrap: wrap;
}
.upload-slot,
.thumb {
  width: 144rpx;
  height: 144rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.upload-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}
.plus {
  font-size: 40rpx;
  line-height: 1;
}
.hint {
  font-size: 20rpx;
  margin-top: 4rpx;
}
.thumb-wrap {
  position: relative;
}
.remove {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 24rpx;
  text-align: center;
  line-height: 36rpx;
}
.radios {
  display: flex;
  gap: 16rpx;
}
.radio {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}
.radio.on {
  color: #fff;
  background: $color-brand;
}
.sku-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0 8rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  color: $color-ink;
}
.link {
  color: $color-brand;
  font-size: 26rpx;
}
.link.danger {
  color: $color-price;
}
.sku {
  padding: 16rpx 0 8rpx;
  border-top: 1rpx solid #f0f0f0;
}
.sku-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.sku-lab {
  font-size: 24rpx;
  color: #888;
}
.sku-row {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}
</style>
