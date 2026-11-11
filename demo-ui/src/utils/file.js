import { isExternal } from '@/utils/validate'

/** v-model 序列化格式 */
export const VALUE_TYPES = ['urlString', 'jsonArray', 'jsonString']

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tif', 'tiff', 'avif', 'apng']
const VIDEO_EXTS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'mpg', 'mpeg']

/**
 * 把库内路径转成页面可展示的地址。
 * - 空串、blob 预览地址：原样返回
 * - http(s) / mailto / tel 等外链：原样返回（含对象存储返回的完整 CDN 地址）
 * - 已带前端代理前缀的：不再重复拼接
 * - 其它相对路径：前面补上 VITE_APP_BASE_API
 */
export function resolveResourceUrl(path) {
  if (!path) {
    return ''
  }
  const trimmed = String(path).trim()
  if (!trimmed || trimmed.startsWith('blob:')) {
    return trimmed
  }
  if (isExternal(trimmed)) {
    return trimmed
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_API || ''
  if (baseUrl && trimmed.startsWith(baseUrl)) {
    return trimmed
  }
  return baseUrl + trimmed
}

/**
 * 把上传组件里的展示地址收成适合入库的值。
 * - blob 临时预览：丢弃（返回空串）
 * - 外链完整 URL：原样保留，方便对象存储 CDN 地址入库
 * - 带前端代理前缀的绝对地址：去掉前缀，只存相对路径
 * - 已经是相对路径：原样返回
 */
export function toStoredPath(url) {
  if (!url) {
    return ''
  }
  const trimmed = String(url).trim()
  if (!trimmed || trimmed.startsWith('blob:')) {
    return ''
  }
  if (isExternal(trimmed)) {
    return trimmed
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_API || ''
  if (baseUrl && trimmed.startsWith(baseUrl)) {
    return trimmed.slice(baseUrl.length)
  }
  return trimmed
}

/** 从文件名或 URL 取后缀（不含点，小写） */
export function getFileExt(nameOrUrl) {
  if (!nameOrUrl) {
    return ''
  }
  const clean = String(nameOrUrl).split('?')[0].split('#')[0]
  const slash = clean.lastIndexOf('/')
  const fileName = slash > -1 ? clean.slice(slash + 1) : clean
  const dot = fileName.lastIndexOf('.')
  if (dot < 0 || dot === fileName.length - 1) {
    return ''
  }
  return fileName.slice(dot + 1).toLowerCase()
}

export function isImageExt(extOrName) {
  const ext = extOrName && String(extOrName).includes('.') ? getFileExt(extOrName) : String(extOrName || '').toLowerCase()
  return IMAGE_EXTS.includes(ext)
}

export function isVideoExt(extOrName) {
  const ext = extOrName && String(extOrName).includes('.') ? getFileExt(extOrName) : String(extOrName || '').toLowerCase()
  return VIDEO_EXTS.includes(ext)
}

export function acceptFromFileTypes(fileTypes) {
  if (!fileTypes || !fileTypes.length) {
    return ''
  }
  return fileTypes.map((type) => {
    const trimmed = String(type).trim().replace(/^\./, '')
    return trimmed ? `.${trimmed}` : ''
  }).filter(Boolean).join(',')
}

export function formatFileSize(size) {
  if (size == null || size === '') {
    return ''
  }
  if (typeof size === 'string' && /[a-zA-Z]/.test(size)) {
    return size
  }
  const bytes = Number(size)
  if (!Number.isFinite(bytes) || bytes < 0) {
    return ''
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function fileNameFromUrl(url) {
  if (!url) {
    return ''
  }
  const clean = String(url).trim().split('?')[0].split('#')[0]
  const slash = clean.lastIndexOf('/')
  return slash > -1 ? clean.slice(slash + 1) : clean
}

export function stripExt(name) {
  if (!name) {
    return ''
  }
  const index = String(name).lastIndexOf('.')
  return index > 0 ? String(name).slice(0, index) : String(name)
}

/**
 * 解析 type / json 布尔为标准 ValueType。
 */
export function resolveValueType(type, json, defaultType = 'urlString') {
  if (json) {
    return 'jsonArray'
  }
  if (type === 'jsonString') {
    return 'jsonString'
  }
  if (type === 'jsonArray' || type === 'json') {
    return 'jsonArray'
  }
  if (type === 'urlString' || type === 'string') {
    return 'urlString'
  }
  return defaultType
}

function looksLikeJson(text) {
  const trimmed = String(text).trim()
  return trimmed.startsWith('[') || trimmed.startsWith('{')
}

function toRawList(value) {
  if (value == null || value === '') {
    return []
  }
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return []
    }
    if (looksLikeJson(trimmed)) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
      }
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }
  if (typeof value === 'object') {
    return [value]
  }
  return []
}

function nextUid(index) {
  return Date.now() + index
}

/** 统一解析为媒体/附件列表项 */
export function parseFileList(value) {
  return toRawList(value).map((item, index) => {
    if (typeof item === 'string') {
      const url = toStoredPath(item)
      const rawName = fileNameFromUrl(url)
      return {
        uid: nextUid(index),
        name: stripExt(rawName),
        url,
        fileType: getFileExt(rawName || url),
        size: ''
      }
    }
    const record = item || {}
    const url = toStoredPath(record.fileUrl || record.url || record.image || '')
    const rawName = record.fileName || record.name || fileNameFromUrl(url)
    const fileType = record.fileType || getFileExt(rawName || url)
    return {
      uid: record.uid || nextUid(index),
      name: stripExt(String(rawName || '')),
      url,
      fileType,
      size: record.fileSize || record.size || '',
      key: record.key || record.objectKey || ''
    }
  }).filter((item) => item.url)
}

function validStoredList(list) {
  return (list || []).filter((item) => item.url && !String(item.url).startsWith('blob:'))
}

/** 按 type 写出 v-model */
export function serializeFileList(list, type) {
  const validList = validStoredList(list).map((item) => ({
    ...item,
    url: toStoredPath(item.url)
  })).filter((item) => item.url)

  if (type === 'urlString') {
    return validList.map((item) => item.url).join(',')
  }

  const jsonList = validList.map((item) => {
    const fileType = item.fileType || getFileExt(item.url)
    const row = {
      url: item.url,
      name: stripExt(item.name || fileNameFromUrl(item.url)),
      size: item.size || '',
      fileType
    }
    if (item.key) {
      row.key = item.key
    }
    return row
  })

  if (type === 'jsonArray') {
    return jsonList
  }
  return JSON.stringify(jsonList)
}

export function isSameModelValue(left, right) {
  if (left === right) {
    return true
  }
  if (typeof left === 'string' && typeof right === 'string') {
    return left === right
  }
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}

/** 文档后缀对应的 Element Plus 图标名 */
export function fileTypeIconName(ext) {
  const type = String(ext || '').toLowerCase().replace(/^\./, '')
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
    return 'FolderOpened'
  }
  if (['doc', 'docx'].includes(type)) {
    return 'Document'
  }
  if (['xls', 'xlsx', 'csv'].includes(type)) {
    return 'Ticket'
  }
  if (['ppt', 'pptx'].includes(type)) {
    return 'DataBoard'
  }
  if (type === 'pdf') {
    return 'Notebook'
  }
  if (IMAGE_EXTS.includes(type)) {
    return 'Picture'
  }
  if (['mp3', 'wav', 'wma', 'flac', 'aac'].includes(type)) {
    return 'Headset'
  }
  if (VIDEO_EXTS.includes(type)) {
    return 'VideoPlay'
  }
  return 'Document'
}

/** 从 /common/upload 或 /api/file 响应提取入库项 */
/**
 * 解析通用上传接口响应，得到组件内部使用的文件项。
 * 优先取嵌套 data，其次取顶层 fileName/url；经 toStoredPath 后作为入库 url。
 */
export function mapUploadResponse(res, originalFile) {
  const data = res?.data && typeof res.data === 'object' ? res.data : null
  const stored = toStoredPath(
    data?.url || data?.objectKey || res?.fileName || res?.url || ''
  )
  const originalName = data?.originalFilename || res?.originalFilename || originalFile?.name || ''
  const fileType = getFileExt(originalName || stored)
  const size = data?.size != null ? data.size : (originalFile?.size || '')
  const key = data?.objectKey || data?.key || ''
  return {
    name: stripExt(originalName || fileNameFromUrl(stored)),
    url: stored,
    fileType,
    size,
    key
  }
}
