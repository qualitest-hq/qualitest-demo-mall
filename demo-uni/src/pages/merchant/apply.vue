<template>
  <view class="page">
    <view class="banner">本项目仅用于演示，请勿提交真实营业执照等敏感材料。</view>

    <view class="card">
      <view class="field">
        <text class="label required">店铺名称</text>
        <wd-input v-model="form.merchantName" clearable placeholder="请输入店铺名称" />
      </view>
      <view class="field">
        <text class="label required">经营类目</text>
        <picker :range="categoryNames" :value="categoryIndex" @change="onCategoryChange">
          <view class="picker">{{ categoryLabel }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">店铺 Logo</text>
        <view class="upload-row">
          <image v-if="logoUrl" class="thumb" :src="logoUrl" mode="aspectFill" @click="onPickLogo" />
          <view v-else class="upload-slot" @click="onPickLogo">
            <text class="plus">+</text>
            <text class="hint">上传</text>
          </view>
          <text v-if="form.logo" class="link" @click="clearLogo">清除</text>
        </view>
      </view>
      <view class="field">
        <text class="label required">联系人</text>
        <wd-input v-model="form.contactName" clearable placeholder="请输入联系人" />
      </view>
      <view class="field">
        <text class="label required">联系电话</text>
        <wd-input v-model="form.contactPhone" type="number" clearable placeholder="请输入联系电话" />
      </view>
      <view class="field">
        <text class="label required">资质材料</text>
        <view class="upload-row wrap">
          <view v-for="(item, index) in licenseList" :key="item.url" class="thumb-wrap">
            <image class="thumb" :src="resolveResourceUrl(item.url)" mode="aspectFill" />
            <text class="remove" @click="removeLicense(index)">×</text>
          </view>
          <view v-if="licenseList.length < 5" class="upload-slot" @click="onPickLicense">
            <text class="plus">+</text>
            <text class="hint">最多5张</text>
          </view>
        </view>
      </view>
    </view>

    <view class="agree" @click="agreed = !agreed">
      <view class="check" :class="{ on: agreed }" />
      <text class="agree-text">
        已阅读并同意
        <text class="link" @click.stop="toastLegal('商家入驻协议')">《商家入驻协议》</text>
        、
        <text class="link" @click.stop="toastLegal('平台交易规则')">《平台交易规则》</text>
        及
        <text class="link" @click.stop="toastLegal('隐私政策')">《隐私政策》</text>
      </text>
    </view>

    <wd-button type="primary" size="large" block :loading="submitting" @click="onSubmit">
      提交申请
    </wd-button>
  </view>
</template>

<script setup lang="ts">
/**
 * 商家入驻申请表单。
 * 驳回后再进本页会带出最近一次申请内容，便于修改重提。
 */
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getLatestSettleApply,
  listEnabledMerchantCategories,
  submitSettleApply,
} from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS, type MerchantCategory } from "@/types/merchant";
import { resolveResourceUrl } from "@/utils/resource";
import {
  chooseAndUploadImage,
  extOfName,
  parseLicenseFiles,
  serializeLicenseFiles,
  type LicenseFileItem,
} from "@/utils/upload";

const categories = ref<MerchantCategory[]>([]);
const categoryIndex = ref(0);
const agreed = ref(true);
const submitting = ref(false);
const licenseList = ref<LicenseFileItem[]>([]);

const form = reactive({
  merchantName: "",
  categoryId: "" as string,
  logo: "",
  contactName: "",
  contactPhone: "",
});

const categoryNames = computed(() => categories.value.map((item) => item.categoryName));
const categoryLabel = computed(() => {
  const current = categories.value[categoryIndex.value];
  return current?.categoryName || "请选择经营类目";
});
const logoUrl = computed(() => resolveResourceUrl(form.logo));

function toastLegal(name: string) {
  uni.showToast({ title: `${name}（演示）`, icon: "none" });
}

function onCategoryChange(e: { detail: { value: string } }) {
  const index = Number(e.detail.value || 0);
  categoryIndex.value = index;
  form.categoryId = categories.value[index]?.categoryId || "";
}

async function onPickLogo() {
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (uploaded) {
      form.logo = uploaded.path;
    }
  } catch {
    /* toast 已提示 */
  }
}

function clearLogo() {
  form.logo = "";
}

async function onPickLicense() {
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (!uploaded) {
      return;
    }
    licenseList.value.push({
      url: uploaded.path,
      name: uploaded.originalName.replace(/\.[^.]+$/, "") || "资质",
      size: uploaded.size,
      fileType: extOfName(uploaded.originalName) || "jpg",
    });
  } catch {
    /* toast 已提示 */
  }
}

function removeLicense(index: number) {
  licenseList.value.splice(index, 1);
}

function fillFromApply(apply: {
  merchantName?: string;
  categoryId?: string;
  logo?: string;
  contactName?: string;
  contactPhone?: string;
  licenseFiles?: string;
}) {
  form.merchantName = apply.merchantName || "";
  form.logo = apply.logo || "";
  form.contactName = apply.contactName || "";
  form.contactPhone = apply.contactPhone || "";
  licenseList.value = parseLicenseFiles(apply.licenseFiles);
  if (apply.categoryId) {
    const idx = categories.value.findIndex((item) => String(item.categoryId) === String(apply.categoryId));
    if (idx >= 0) {
      categoryIndex.value = idx;
      form.categoryId = categories.value[idx].categoryId;
    }
  }
}

async function load() {
  categories.value = (await listEnabledMerchantCategories()) || [];
  if (categories.value.length && !form.categoryId) {
    form.categoryId = categories.value[0].categoryId;
    categoryIndex.value = 0;
  }
  const latest = await getLatestSettleApply();
  if (latest && Number(latest.status) === APPLY_STATUS.REJECTED) {
    fillFromApply(latest);
  }
}

async function onSubmit() {
  if (!agreed.value) {
    uni.showToast({ title: "请先勾选入驻协议", icon: "none" });
    return;
  }
  if (!form.merchantName.trim()) {
    uni.showToast({ title: "请填写店铺名称", icon: "none" });
    return;
  }
  if (!form.categoryId) {
    uni.showToast({ title: "请选择经营类目", icon: "none" });
    return;
  }
  if (!form.contactName.trim() || !form.contactPhone.trim()) {
    uni.showToast({ title: "请填写联系人与电话", icon: "none" });
    return;
  }
  if (!licenseList.value.length) {
    uni.showToast({ title: "请上传资质材料", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await submitSettleApply({
      merchantName: form.merchantName.trim(),
      categoryId: form.categoryId,
      logo: form.logo || undefined,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      licenseFiles: serializeLicenseFiles(licenseList.value),
      openStatus: 1,
    });
    uni.showToast({ title: "已提交", icon: "success" });
    setTimeout(() => {
      uni.redirectTo({ url: ROUTES.MERCHANT_PENDING });
    }, 400);
  } catch {
    /* request 已 toast */
  } finally {
    submitting.value = false;
  }
}

onLoad(() => {
  load().catch((error) => {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  });
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: $color-bg;
}
.banner {
  margin-bottom: 20rpx;
  padding: 20rpx 24rpx;
  border-radius: $radius-base;
  background: #fff7e8;
  color: #a15c00;
  font-size: 24rpx;
  line-height: 1.5;
}
.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 8rpx 28rpx 20rpx;
  margin-bottom: 24rpx;
}
.field {
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
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
.required::before {
  content: "*";
  color: $color-price;
  margin-right: 6rpx;
}
.picker {
  min-height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: $color-ink;
}
.upload-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.upload-row.wrap {
  flex-wrap: wrap;
}
.upload-slot,
.thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
}
.upload-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  color: #999;
  background: #fafafa;
}
.plus {
  font-size: 40rpx;
  line-height: 1;
}
.hint {
  margin-top: 6rpx;
  font-size: 20rpx;
}
.thumb-wrap {
  position: relative;
}
.remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  text-align: center;
  line-height: 34rpx;
  font-size: 28rpx;
}
.link {
  color: $color-brand;
  font-size: 24rpx;
}
.agree {
  display: flex;
  gap: 12rpx;
  margin: 8rpx 0 28rpx;
  align-items: flex-start;
}
.check {
  width: 32rpx;
  height: 32rpx;
  margin-top: 4rpx;
  border-radius: 50%;
  border: 1.5px solid #ccc;
  flex-shrink: 0;
}
.check.on {
  border-color: $color-brand;
  background: $color-brand;
  box-shadow: inset 0 0 0 6rpx #fff;
}
.agree-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}
</style>
