import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

/** 源码根目录绝对路径，供别名解析 */
const srcDir = fileURLToPath(new URL("./src", import.meta.url));
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
);

/** 与 manifest.json h5.router.base、演示站 Nginx /h5/ 一致 */
const h5Base = "/h5/";

// 构建期写入 import.meta.env（Docker 可再注入 VITE_GIT_SHA）
process.env.VITE_APP_VERSION = process.env.VITE_APP_VERSION || pkg.version;
process.env.VITE_BUILD_TIME = process.env.VITE_BUILD_TIME || new Date().toISOString();
process.env.VITE_GIT_SHA = process.env.VITE_GIT_SHA || process.env.GITHUB_SHA || "";

/**
 * Vite 构建与开发服务器配置。
 * - uni 插件：编译多端页面
 * - 别名 @：业务代码用 @/ 指向 src
 * - scss：使用现代编译接口；压制依赖库旧写法产生的弃用提示
 * - proxy：H5 开发时把浏览器请求的 /api 转到本机商城后端
 * - base：挂演示站 /h5/；本机请打开 http://localhost:<port>/h5/
 *
 * 全局色板写在 uni.scss，由运行时注入各组件，不在此拼装 scss 片段。
 * 修改本文件后需重启开发服务器才会生效。
 */
export default defineConfig({
  base: h5Base,
  plugins: [uni()],
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        /** 使用 Dart Sass 现代 API，减少旧版 JS API 警告 */
        api: "modern",
        /** 忽略第三方包内旧 @import、旧全局函数等弃用提示，避免刷屏 */
        silenceDeprecations: ["import", "global-builtin", "legacy-js-api"],
      },
    },
  },
  server: {
    proxy: {
      /** 开发态：/api 转发到商城服务，便于浏览器同源联调 */
      "/api": {
        target: "http://localhost:8801",
        changeOrigin: true,
      },
    },
  },
});
