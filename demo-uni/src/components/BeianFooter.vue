<template>
  <!-- #ifdef H5 -->
  <view v-if="visible" class="beian">
    <text
      v-if="mps.number"
      class="link"
      @click="openUrl(mps.url)"
    >
      <!-- 图标在站点根 /beian-mps.png，勿走 /h5/ 前缀 -->
      <img v-if="showIcon" class="ico" :src="mpsIconSrc" alt="" @error="showIcon = false" />
      {{ mps.number }}
    </text>
    <text v-if="icp" class="link" @click="openUrl('https://beian.miit.gov.cn/')">{{ icp }}</text>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
/**
 * 公网演示站页脚备案（ICP + 公网安备）。
 * 读站点根 /config.js；号码为空不渲染。仅 H5。
 */
import { computed, ref } from "vue";
import { readIcpNumber, readMpsBeian } from "@/utils/beian";
import { openExternalUrl } from "@/utils/openExternal";

const icp = readIcpNumber();
const mps = readMpsBeian();
const showIcon = ref(!!mps.number);
const visible = computed(() => !!(icp || mps.number));
/** 与 demo-ui 一致：演示机 compose 挂到 Nginx 根路径 */
const mpsIconSrc =
  typeof location !== "undefined" ? `${location.origin}/beian-mps.png` : "/beian-mps.png";

function openUrl(url: string) {
  openExternalUrl(url);
}
</script>

<style lang="scss" scoped>
.beian {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16rpx 24rpx;
  margin-top: 24rpx;
  padding: 0 24rpx 16rpx;
}

.link {
  font-size: 20rpx;
  color: #999;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.ico {
  width: 22rpx;
  height: 22rpx;
  flex-shrink: 0;
}
</style>
