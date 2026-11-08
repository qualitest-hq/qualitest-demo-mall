/**
 * 组件库在模板中按标签名使用时的全局类型补充。
 * 只做薄声明供编辑器与类型检查识别 Wd 开头组件；
 * 不把组件库源码拉进类型检查，避免第三方文件触发大量报错。
 */
import type { DefineComponent } from "vue";

declare module "vue" {
  export interface GlobalComponents {
    WdButton: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdStatusTip: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdEmpty: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdLoading: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdPopup: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdNavbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdTab: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdTabs: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdInput: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdCell: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdCellGroup: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdIcon: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdSwiper: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdStepper: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdInputNumber: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdTag: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    WdToast: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  }
}

export {};
