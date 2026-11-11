import { useUserStore } from "@/stores/user";
import { API_SUCCESS, API_UNAUTHORIZED } from "@/types/api";
import { toStoredPath } from "@/utils/resource";

/** 单文件上传结果 */
export interface UploadResult {
  /** 建议入库路径：本地多为相对路径，对象存储可为完整 https */
  path: string;
  /** 原始文件名 */
  originalName: string;
  /** 文件大小（字节） */
  size: number;
}

interface UploadAjaxBody {
  code?: number;
  msg?: string;
  url?: string;
  fileName?: string;
  newFileName?: string;
  originalFilename?: string;
}

function resolveUploadUrl(action = "/common/upload"): string {
  if (/^https?:\/\//i.test(action)) {
    return action;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const path = action.startsWith("/") ? action : `/${action}`;
  return `${base}${path}`;
}

/**
 * 选择并上传一张图片到后端 /common/upload。
 * 成功返回建议入库路径（相对路径或对象存储完整 URL）；取消选择时返回 null。
 */
export function chooseAndUploadImage(options?: {
  count?: number;
  sizeLimitMb?: number;
}): Promise<UploadResult | null> {
  const count = options?.count ?? 1;
  const sizeLimitMb = options?.sizeLimitMb ?? 5;

  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const filePath = res.tempFilePaths?.[0];
        if (!filePath) {
          resolve(null);
          return;
        }
        const tempFiles = Array.isArray(res.tempFiles) ? res.tempFiles : res.tempFiles ? [res.tempFiles] : [];
        const fileSize = Number((tempFiles[0] as { size?: number } | undefined)?.size || 0);
        if (sizeLimitMb && fileSize > sizeLimitMb * 1024 * 1024) {
          uni.showToast({ title: `图片不能超过 ${sizeLimitMb}MB`, icon: "none" });
          reject(new Error("文件过大"));
          return;
        }
        try {
          const uploaded = await uploadFile(filePath, fileSize);
          resolve(uploaded);
        } catch (error) {
          reject(error);
        }
      },
      fail: () => resolve(null),
    });
  });
}

/**
 * 上传本地临时文件到后端 /common/upload，由服务端写入当前存储后端。
 * 响应中的 fileName/url 经 toStoredPath 后作为入库 path。
 */
export function uploadFile(filePath: string, size = 0): Promise<UploadResult> {
  const user = useUserStore();
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: "上传中", mask: true });
    uni.uploadFile({
      url: resolveUploadUrl(),
      filePath,
      name: "file",
      header: {
        ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
      },
      success: (res) => {
        uni.hideLoading();
        if (res.statusCode === API_UNAUTHORIZED) {
          reject(new Error("未登录或登录已过期"));
          return;
        }
        let body: UploadAjaxBody = {};
        try {
          body = typeof res.data === "string" ? JSON.parse(res.data) : (res.data as UploadAjaxBody);
        } catch {
          uni.showToast({ title: "上传响应异常", icon: "none" });
          reject(new Error("上传响应异常"));
          return;
        }
        if (body.code !== API_SUCCESS) {
          uni.showToast({ title: body.msg || "上传失败", icon: "none" });
          reject(new Error(body.msg || "上传失败"));
          return;
        }
        const path = toStoredPath(body.fileName || body.url || "");
        if (!path) {
          uni.showToast({ title: "上传结果为空", icon: "none" });
          reject(new Error("上传结果为空"));
          return;
        }
        resolve({
          path,
          originalName: body.originalFilename || body.newFileName || path.split("/").pop() || "file",
          size,
        });
      },
      fail: () => {
        uni.hideLoading();
        uni.showToast({ title: "上传失败", icon: "none" });
        reject(new Error("上传失败"));
      },
    });
  });
}

/** 资质附件项（json 数组中的单条：url / name / size / fileType） */
export interface LicenseFileItem {
  url: string;
  name: string;
  size: string | number;
  fileType: string;
}

export function parseLicenseFiles(raw?: string | null): LicenseFileItem[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        url: toStoredPath(item?.url || item?.fileUrl || ""),
        name: String(item?.name || item?.fileName || "资质").replace(/\.[^.]+$/, ""),
        size: item?.size || item?.fileSize || "",
        fileType: String(item?.fileType || "").replace(/^\./, ""),
      }))
      .filter((item) => item.url);
  } catch {
    return [];
  }
}

export function serializeLicenseFiles(list: LicenseFileItem[]): string {
  return JSON.stringify(
    list
      .map((item) => ({
        url: toStoredPath(item.url),
        name: item.name,
        size: item.size || "",
        fileType: item.fileType || "",
      }))
      .filter((item) => item.url),
  );
}

export function extOfName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > -1 ? name.slice(idx + 1).toLowerCase() : "";
}
