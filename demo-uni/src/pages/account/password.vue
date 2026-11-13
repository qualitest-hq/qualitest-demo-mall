<template>
  <view class="page">
    <view class="card">
      <view class="field">
        <text class="label">原密码</text>
        <wd-input v-model="oldPassword" show-password clearable placeholder="请输入原密码" />
      </view>
      <view class="field">
        <text class="label">新密码</text>
        <wd-input v-model="newPassword" show-password clearable placeholder="请输入新密码" />
      </view>
      <view class="field">
        <text class="label">确认新密码</text>
        <wd-input v-model="confirmPassword" show-password clearable placeholder="再次输入新密码" />
      </view>
    </view>
    <wd-button type="primary" size="large" block :loading="submitting" @click="onSubmit">
      确认修改
    </wd-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { updatePassword } from "@/api/account";
import { navigateBackOrHome } from "@/constants/routes";

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const submitting = ref(false);

async function onSubmit() {
  const oldPwd = oldPassword.value.trim();
  const newPwd = newPassword.value.trim();
  const confirm = confirmPassword.value.trim();
  if (!oldPwd || !newPwd) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }
  if (newPwd.length < 6) {
    uni.showToast({ title: "新密码至少 6 位", icon: "none" });
    return;
  }
  if (newPwd !== confirm) {
    uni.showToast({ title: "两次新密码不一致", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await updatePassword({ oldPassword: oldPwd, newPassword: newPwd });
    uni.showToast({ title: "密码已更新", icon: "success" });
    setTimeout(() => navigateBackOrHome(), 500);
  } catch {
    /* toast from request */
  } finally {
    submitting.value = false;
  }
}
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
</style>
