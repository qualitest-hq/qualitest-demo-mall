<template>
  <view class="page">
    <text class="brand">{{ appConfig.name }}</text>
    <text class="sub">App · 登录后同步购物车与订单</text>
    <text class="hint">{{ appConfig.demoHint }}</text>

    <view class="tabs">
      <text class="tab" :class="{ on: mode === 'password' }" @click="mode = 'password'">密码登录</text>
      <text class="tab" :class="{ on: mode === 'sms' }" @click="mode = 'sms'">验证码登录</text>
    </view>

    <view class="form">
      <wd-input v-model="mobile" type="number" clearable placeholder="手机号" custom-class="field" />
      <wd-input
        v-if="mode === 'password'"
        v-model="password"
        show-password
        clearable
        placeholder="密码"
        custom-class="field"
      />
      <view v-else class="sms-row">
        <wd-input v-model="smsCode" type="number" clearable placeholder="验证码" custom-class="field flex" />
        <wd-button size="medium" plain @click="onSmsUnavailable">获取验证码</wd-button>
      </view>
    </view>

    <view class="agree" @click="agreed = !agreed">
      <view class="check" :class="{ on: agreed }" />
      <text class="agree-text">
        我已阅读并同意
        <text class="link" @click.stop="openLegalUserAgreement">《用户协议》</text>
        <text class="link" @click.stop="openLegalPrivacy">《隐私政策》</text>
        与
        <text class="link" @click.stop="toastLegal('第三方信息共享清单')">《共享清单》</text>
      </text>
    </view>

    <wd-button type="primary" size="large" block :loading="submitting" @click="onSubmit">
      {{ mode === "password" ? "登录" : "登录·注册" }}
    </wd-button>

    <view class="oauth">
      <wd-button size="medium" plain @click="onOauthUnavailable('微信')">微信</wd-button>
      <wd-button size="medium" plain @click="onOauthUnavailable('QQ')">QQ</wd-button>
    </view>

    <text class="foot">演示账号已预填，勾选协议后即可登录</text>
    <!-- #ifdef H5 -->
    <text v-if="adminUrl" class="cross-link" @click="goAdmin">进入管理端</text>
    <!-- #endif -->
    <BeianFooter />
  </view>
</template>

<script setup lang="ts">
/**
 * 登录页。
 * 支持密码登录提交；验证码与第三方按钮仅展示，点击提示暂未开放。
 * 登录成功后写入本地会话并切换到首页 Tab。
 */
import { ref } from "vue";
import { loginByPassword } from "@/api/auth";
import { appConfig } from "@/config/app";
import { DEMO_ACCOUNT } from "@/constants/demo";
import { openLegalPrivacy, openLegalUserAgreement, ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user";
import BeianFooter from "@/components/BeianFooter.vue";
import { openExternalUrl } from "@/utils/openExternal";

/** 登录方式：密码或短信验证码 */
type LoginMode = "password" | "sms";

const user = useUserStore();
/** 当前登录方式 */
const mode = ref<LoginMode>("password");
/** 手机号，默认填入演示号便于联调 */
const mobile = ref(DEMO_ACCOUNT.mobile);
/** 密码，默认填入演示密码便于联调 */
const password = ref(DEMO_ACCOUNT.password);
/** 短信验证码输入（当前不参与真实登录） */
const smsCode = ref("");
/** 是否已勾选用户协议 */
const agreed = ref(true);
/** 提交中，用于禁用重复点击 */
const submitting = ref(false);
/** 管理端互跳地址；空则不展示 */
const adminUrl = (import.meta.env.VITE_ADMIN_URL || "").trim();

function goAdmin() {
  openExternalUrl(adminUrl);
}

/** 协议链接占位：正式协议页尚未接入时只提示 */
function toastLegal(name: string) {
  uni.showToast({ title: `${name}页暂未开放`, icon: "none" });
}

/** 短信验证码能力未接入 */
function onSmsUnavailable() {
  uni.showToast({ title: "验证码登录暂未开放", icon: "none" });
}

/** 第三方授权登录未接入 */
function onOauthUnavailable(channel: string) {
  uni.showToast({ title: `${channel}登录暂未开放`, icon: "none" });
}

/**
 * 点击主按钮提交。
 * 校验协议与表单后调用密码登录；成功则保存令牌并进入首页。
 */
async function onSubmit() {
  if (!agreed.value) {
    uni.showToast({ title: "请先勾选协议", icon: "none" });
    return;
  }
  if (mode.value === "sms") {
    onSmsUnavailable();
    return;
  }
  const phone = mobile.value.trim();
  if (!phone) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
  if (!password.value) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const data = await loginByPassword({ mobile: phone, password: password.value });
    user.setSession(data.token, {
      accountId: String(data.accountId),
      nickName: data.nickName,
    });
    uni.switchTab({ url: ROUTES.HOME });
  } catch {
    // 失败提示已由统一请求封装弹出
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 80rpx 48rpx 48rpx;
  box-sizing: border-box;
  background: $color-surface;
}

.brand {
  display: block;
  font-size: 64rpx;
  font-weight: 750;
  letter-spacing: 0.12em;
  color: $color-brand;
}

.sub {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.hint {
  display: block;
  margin-top: 8rpx;
  margin-bottom: 40rpx;
  font-size: 22rpx;
  color: #aaa;
}

.tabs {
  display: flex;
  gap: 40rpx;
  margin-bottom: 32rpx;
}

.tab {
  font-size: 30rpx;
  color: #999;
  padding-bottom: 12rpx;
  position: relative;

  &.on {
    color: $color-brand;
    font-weight: 650;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 4rpx;
      background: $color-brand;
      border-radius: 2rpx;
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.sms-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.agree {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin: 28rpx 0 32rpx;
}

.check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  margin-top: 4rpx;
  flex-shrink: 0;
  box-sizing: border-box;

  &.on {
    border-color: $color-brand;
    background: $color-brand;
    box-shadow: inset 0 0 0 6rpx #fff;
  }
}

.agree-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.link {
  color: $color-brand;
}

.oauth {
  margin-top: 32rpx;
  display: flex;
  gap: 24rpx;
  justify-content: center;
}

.foot {
  display: block;
  margin-top: 28rpx;
  text-align: center;
  font-size: 22rpx;
  color: #aaa;
  line-height: 1.5;
}

.cross-link {
  display: block;
  margin-top: 20rpx;
  text-align: center;
  font-size: 24rpx;
  color: $color-brand;
}
</style>
