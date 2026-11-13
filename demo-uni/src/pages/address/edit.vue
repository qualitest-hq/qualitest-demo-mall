<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label required">收货人</text>
        <wd-input v-model="form.receiverName" clearable placeholder="姓名" />
      </view>
      <view class="field">
        <text class="label required">手机号</text>
        <wd-input v-model="form.receiverPhone" type="number" clearable placeholder="11 位手机号" />
      </view>
      <view class="field">
        <text class="label required">省</text>
        <wd-input v-model="form.province" clearable placeholder="省份" />
      </view>
      <view class="field">
        <text class="label required">市</text>
        <wd-input v-model="form.city" clearable placeholder="城市" />
      </view>
      <view class="field">
        <text class="label required">区/县</text>
        <wd-input v-model="form.district" clearable placeholder="区或县" />
      </view>
      <view class="field">
        <text class="label required">详细地址</text>
        <wd-input v-model="form.detailAddress" clearable placeholder="街道门牌等" />
      </view>
      <view class="field row">
        <text class="label">设为默认</text>
        <switch :checked="Number(form.isDefault) === 1" color="#2F6F5E" @change="onDefaultChange" />
      </view>
    </view>
    <wd-button type="primary" size="large" block :loading="submitting" @click="onSubmit">保存</wd-button>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { createAddress, getAddress, updateAddress } from "@/api/account";
import { navigateBackOrHome } from "@/constants/routes";
import type { AccountAddressSaveParams } from "@/types/account";

const addressId = ref("");
const submitting = ref(false);
const form = reactive<AccountAddressSaveParams>({
  receiverName: "",
  receiverPhone: "",
  province: "",
  city: "",
  district: "",
  detailAddress: "",
  isDefault: 0,
});

function onDefaultChange(e: Event) {
  const checked = Boolean((e as unknown as { detail?: { value?: boolean } }).detail?.value);
  form.isDefault = checked ? 1 : 0;
}

/** 保存前校验必填项与手机号 */
function validate() {
  if (!form.receiverName?.trim()) {
    uni.showToast({ title: "请填写收货人", icon: "none" });
    return false;
  }
  if (!/^1\d{10}$/.test(String(form.receiverPhone || "").trim())) {
    uni.showToast({ title: "请填写正确手机号", icon: "none" });
    return false;
  }
  if (!form.province?.trim() || !form.city?.trim() || !form.district?.trim()) {
    uni.showToast({ title: "请填写省市区", icon: "none" });
    return false;
  }
  if (!form.detailAddress?.trim()) {
    uni.showToast({ title: "请填写详细地址", icon: "none" });
    return false;
  }
  return true;
}

async function loadDetail(id: string) {
  try {
    const row = await getAddress(id);
    if (!row) return;
    form.receiverName = row.receiverName || "";
    form.receiverPhone = row.receiverPhone || "";
    form.province = row.province || "";
    form.city = row.city || "";
    form.district = row.district || "";
    form.detailAddress = row.detailAddress || "";
    form.isDefault = row.isDefault ?? 0;
    form.addressId = row.addressId;
  } catch {
    /* toast */
  }
}

async function onSubmit() {
  if (!validate() || submitting.value) return;
  submitting.value = true;
  try {
    const payload: AccountAddressSaveParams = {
      ...form,
      receiverName: form.receiverName?.trim(),
      receiverPhone: form.receiverPhone?.trim(),
      province: form.province?.trim(),
      city: form.city?.trim(),
      district: form.district?.trim(),
      detailAddress: form.detailAddress?.trim(),
    };
    if (addressId.value) {
      payload.addressId = addressId.value;
      await updateAddress(payload);
    } else {
      await createAddress(payload);
    }
    uni.showToast({ title: "已保存", icon: "success" });
    setTimeout(() => navigateBackOrHome(), 400);
  } catch {
    /* toast */
  } finally {
    submitting.value = false;
  }
}

onLoad((q) => {
  const id = String(q?.addressId || "").trim();
  if (id) {
    addressId.value = id;
    uni.setNavigationBarTitle({ title: "编辑地址" });
    loadDetail(id);
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: $color-bg;
}

.card {
  background: $color-surface;
  border-radius: $radius-base;
  padding: 8rpx 24rpx 16rpx;
  margin-bottom: 32rpx;
}

.field {
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.field:last-child {
  border-bottom: none;
}

.field.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.field.row .label {
  margin-bottom: 0;
}

.required::before {
  content: "*";
  color: $color-price;
  margin-right: 4rpx;
}
</style>
