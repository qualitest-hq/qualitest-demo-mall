<template>
  <view class="page">
    <view v-if="pendingApply" class="banner warn">
      <text>资料变更审核中，暂不可再次提交。</text>
      <text class="link" @click="onWithdraw">撤销</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label required">店铺名称</text>
        <wd-input v-model="form.merchantName" :disabled="!!pendingApply" clearable placeholder="请输入店铺名称" />
      </view>
      <view class="field">
        <text class="label required">经营类目</text>
        <picker :disabled="!!pendingApply" :range="categoryNames" :value="categoryIndex" @change="onCategoryChange">
          <view class="picker" :class="{ disabled: !!pendingApply }">{{ categoryLabel }}</view>
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
        </view>
      </view>
      <view class="field">
        <text class="label required">联系人</text>
        <wd-input v-model="form.contactName" :disabled="!!pendingApply" clearable placeholder="请输入联系人" />
      </view>
      <view class="field">
        <text class="label required">联系电话</text>
        <wd-input
          v-model="form.contactPhone"
          :disabled="!!pendingApply"
          type="number"
          clearable
          placeholder="请输入联系电话"
        />
      </view>
      <view class="field">
        <text class="label">营业状态</text>
        <view class="radios">
          <text class="radio" :class="{ on: form.openStatus === 1 }" @click="setOpenStatus(1)">营业</text>
          <text class="radio" :class="{ on: form.openStatus === 0 }" @click="setOpenStatus(0)">打烊</text>
        </view>
      </view>
      <view class="field">
        <text class="label">资质材料</text>
        <view class="upload-row wrap">
          <view v-for="(item, index) in licenseList" :key="item.url" class="thumb-wrap">
            <image class="thumb" :src="resolveResourceUrl(item.url)" mode="aspectFill" />
            <text v-if="!pendingApply" class="remove" @click="removeLicense(index)">×</text>
          </view>
          <view v-if="!pendingApply && licenseList.length < 5" class="upload-slot" @click="onPickLicense">
            <text class="plus">+</text>
            <text class="hint">选填</text>
          </view>
        </view>
      </view>
    </view>

    <wd-button
      type="primary"
      size="large"
      block
      :disabled="!!pendingApply"
      :loading="submitting"
      @click="onSubmit"
    >
      提交资料变更
    </wd-button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  getLatestProfileApply,
  getMyMerchant,
  listEnabledMerchantCategories,
  submitProfileApply,
  withdrawApply,
} from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS, type MerchantApply, type MerchantCategory } from "@/types/merchant";
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
const pendingApply = ref<MerchantApply | null>(null);
const submitting = ref(false);
const licenseList = ref<LicenseFileItem[]>([]);

const form = reactive({
  merchantName: "",
  categoryId: "" as string,
  logo: "",
  contactName: "",
  contactPhone: "",
  openStatus: 1,
});

const categoryNames = computed(() => categories.value.map((item) => item.categoryName));
const categoryLabel = computed(() => {
  const current = categories.value[categoryIndex.value];
  return current?.categoryName || "请选择经营类目";
});
const logoUrl = computed(() => resolveResourceUrl(form.logo));

function onCategoryChange(e: { detail: { value: string } }) {
  if (pendingApply.value) return;
  const index = Number(e.detail.value || 0);
  categoryIndex.value = index;
  form.categoryId = categories.value[index]?.categoryId || "";
}

function setOpenStatus(value: number) {
  if (pendingApply.value) return;
  form.openStatus = value;
}

async function onPickLogo() {
  if (pendingApply.value) return;
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (uploaded) form.logo = uploaded.path;
  } catch {
    /* ignore */
  }
}

async function onPickLicense() {
  if (pendingApply.value) return;
  try {
    const uploaded = await chooseAndUploadImage({ count: 1, sizeLimitMb: 5 });
    if (!uploaded) return;
    licenseList.value.push({
      url: uploaded.path,
      name: uploaded.originalName.replace(/\.[^.]+$/, "") || "资质",
      size: uploaded.size,
      fileType: extOfName(uploaded.originalName) || "jpg",
    });
  } catch {
    /* ignore */
  }
}

function removeLicense(index: number) {
  licenseList.value.splice(index, 1);
}

async function load() {
  const merchant = await getMyMerchant();
  if (!merchant?.merchantId) {
    uni.redirectTo({ url: ROUTES.MERCHANT_INDEX });
    return;
  }
  categories.value = (await listEnabledMerchantCategories()) || [];
  form.merchantName = merchant.merchantName || "";
  form.logo = merchant.logo || "";
  form.contactName = merchant.contactName || "";
  form.contactPhone = merchant.contactPhone || "";
  form.openStatus = Number(merchant.openStatus) === 0 ? 0 : 1;
  form.categoryId = merchant.categoryId || "";
  licenseList.value = parseLicenseFiles(merchant.licenseFiles);
  const idx = categories.value.findIndex((item) => String(item.categoryId) === String(merchant.categoryId));
  categoryIndex.value = idx >= 0 ? idx : 0;
  if (!form.categoryId && categories.value[0]) {
    form.categoryId = categories.value[0].categoryId;
  }

  const latest = await getLatestProfileApply();
  pendingApply.value =
    latest && Number(latest.status) === APPLY_STATUS.PENDING ? latest : null;
}

function onWithdraw() {
  if (!pendingApply.value?.applyId) return;
  uni.showModal({
    title: "撤销资料变更",
    content: "确认撤销当前待审资料变更？",
    success: async (res) => {
      if (!res.confirm || !pendingApply.value?.applyId) return;
      try {
        await withdrawApply(pendingApply.value.applyId);
        uni.showToast({ title: "已撤销", icon: "success" });
        await load();
      } catch {
        /* ignore */
      }
    },
  });
}

async function onSubmit() {
  if (pendingApply.value) return;
  if (!form.merchantName.trim() || !form.categoryId) {
    uni.showToast({ title: "请完善店铺名称与类目", icon: "none" });
    return;
  }
  if (!form.contactName.trim() || !form.contactPhone.trim()) {
    uni.showToast({ title: "请填写联系人与电话", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await submitProfileApply({
      merchantName: form.merchantName.trim(),
      categoryId: form.categoryId,
      logo: form.logo || undefined,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      licenseFiles: licenseList.value.length
        ? serializeLicenseFiles(licenseList.value)
        : undefined,
      openStatus: form.openStatus,
    });
    uni.showToast({ title: "已提交审核", icon: "success" });
    await load();
  } catch {
    /* ignore */
  } finally {
    submitting.value = false;
  }
}

onShow(() => {
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
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx 24rpx;
  border-radius: $radius-base;
  font-size: 24rpx;
  line-height: 1.5;
}
.banner.warn {
  background: #fff7e8;
  color: #a15c00;
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
}
.picker.disabled {
  color: #bbb;
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
.radios {
  display: flex;
  gap: 16rpx;
}
.radio {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  border: 1px solid #ddd;
  font-size: 26rpx;
  color: #666;
}
.radio.on {
  border-color: $color-brand;
  color: $color-brand;
  background: #eef7f3;
}
.link {
  color: $color-brand;
  flex-shrink: 0;
}
</style>
