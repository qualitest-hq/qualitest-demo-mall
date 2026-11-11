import { getLatestSettleApply, getMyMerchant } from "@/api/merchant";
import { ROUTES } from "@/constants/routes";
import { APPLY_STATUS } from "@/types/merchant";
import { useUserStore } from "@/stores/user";

export type MerchantGateTarget = "apply" | "pending" | "rejected" | "dash";

/**
 * 根据店铺 / 最新入驻申请决定商家中心落地页。
 */
export async function resolveMerchantGate(): Promise<MerchantGateTarget> {
  const merchant = await getMyMerchant();
  if (merchant?.merchantId) {
    return "dash";
  }
  const apply = await getLatestSettleApply();
  if (!apply) {
    return "apply";
  }
  const status = Number(apply.status);
  if (status === APPLY_STATUS.PENDING) {
    return "pending";
  }
  if (status === APPLY_STATUS.REJECTED) {
    return "rejected";
  }
  return "apply";
}

const GATE_ROUTE: Record<MerchantGateTarget, string> = {
  apply: ROUTES.MERCHANT_APPLY,
  pending: ROUTES.MERCHANT_PENDING,
  rejected: ROUTES.MERCHANT_REJECTED,
  dash: ROUTES.MERCHANT_DASH,
};

/** 打开商家中心（未登录先去登录） */
export async function openMerchantCenter() {
  const user = useUserStore();
  if (!user.isLoggedIn) {
    uni.navigateTo({ url: ROUTES.LOGIN });
    return;
  }
  uni.showLoading({ title: "加载中", mask: true });
  try {
    const target = await resolveMerchantGate();
    uni.navigateTo({ url: GATE_ROUTE[target] });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "进入失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
}

/** 入口页重定向到实际屏（replace） */
export async function redirectMerchantGate() {
  const target = await resolveMerchantGate();
  uni.redirectTo({ url: GATE_ROUTE[target] });
}
