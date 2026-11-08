import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

/**
 * 创建 Vue 应用并安装 Pinia 全局状态。
 * 导出 createApp 供 uni 运行时调用并完成挂载。
 */
export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  return {
    app,
  };
}
