/**
 * 弹出「某功能即将开放」类轻提示。
 * @param feature 功能名称，会拼进提示文案
 */
export function toastComingSoon(feature: string) {
  uni.showToast({ title: `${feature}即将开放`, icon: "none" });
}
