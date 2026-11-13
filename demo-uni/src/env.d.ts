/// <reference types="vite/client" />

/** 构建时注入到 import.meta.env 的环境变量 */
interface ImportMetaEnv {
  /** 后端接口根地址，请求封装拼在相对路径前面 */
  readonly VITE_API_BASE_URL: string;
  /** 管理端入口 URL；空则不渲染互跳 */
  readonly VITE_ADMIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** 允许以默认导入方式引用 Vue 单文件组件 */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
