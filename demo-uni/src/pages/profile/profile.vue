<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label">昵称</text>
        <wd-input v-model="nickName" clearable placeholder="请输入昵称" />
      </view>
      <view v-if="showGender" class="field">
        <text class="label">性别</text>
        <view class="radios">
          <text class="radio" :class="{ on: gender === 0 }" @click="gender = 0">男</text>
          <text class="radio" :class="{ on: gender === 1 }" @click="gender = 1">女</text>
          <text class="radio" :class="{ on: gender === 2 }" @click="gender = 2">未知</text>
        </view>
      </view>
      <view class="field readonly">
        <text class="label">手机号</text>
        <text class="val">{{ mobile || "—" }}</text>
      </view>
    </view>
    <wd-button type="primary" size="large" block :loading="saving" @click="onSave">保存</wd-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getProfile, updateProfile } from "@/api/account";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const nickName = ref("");
const gender = ref<number | undefined>(undefined);
const mobile = ref("");
const saving = ref(false);
const showGender = ref(true);

async function load() {
  try {
    const p = await getProfile();
    nickName.value = p?.nickName || "";
    mobile.value = p?.mobile || "";
    if (p?.gender !== undefined && p?.gender !== null) {
      gender.value = Number(p.gender);
    }
  } catch {
    /* toast from request */
  }
}

async function onSave() {
  const name = nickName.value.trim();
  if (!name) {
    uni.showToast({ title: "请输入昵称", icon: "none" });
    return;
  }
  saving.value = true;
  try {
    await updateProfile({
      nickName: name,
      gender: gender.value,
    });
    user.setSession(user.token, {
      accountId: user.profile?.accountId,
      nickName: name,
    });
    uni.showToast({ title: "已保存", icon: "success" });
  } catch {
    /* toast from request */
  } finally {
    saving.value = false;
  }
}

onShow(() => {
  load();
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
  padding: 8rpx 24rpx 24rpx;
  margin-bottom: 32rpx;
}

.field {
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.field:last-child {
  border-bottom: none;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.readonly .val {
  font-size: 30rpx;
  color: $color-ink;
}

.radios {
  display: flex;
  gap: 16rpx;
}

.radio {
  padding: 12rpx 28rpx;
  border-radius: 999px;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.radio.on {
  color: #fff;
  background: $color-brand;
}
</style>
