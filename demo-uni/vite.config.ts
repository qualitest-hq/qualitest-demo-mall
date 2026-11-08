import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { fileURLToPath, URL } from "node:url";

/** 源码根目录绝对路径，供别名解析 */
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Vite 构建与开发服务器配置。
 * - uni 插件：编译多端页面
 * - 别名 @：业务代码用 @/ 指向 src
 * - scss：使用现代编译接口；压制依赖库旧写法产生的弃用日志
 * - proxy：H5 开发时把浏览器请求的 /api 转到本机商城后端
 *
 * 全局色板写在 uni.scss，由运行时注入各组件，不在此拼装 scss 片段。
 * 修改本文件后需重启开发服务器才会生效。
 */
export default defineConfig({
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
