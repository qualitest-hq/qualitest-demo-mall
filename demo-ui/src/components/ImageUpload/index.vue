<template>
  <div class="component-upload-image" :class="{ 'named-upload': namedMode }">
    <el-upload
      multiple
      :disabled="disabled"
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :data="data"
      :limit="limit"
      :accept="accept"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <div class="upload-card-trigger">
        <el-icon class="upload-card-icon"><plus /></el-icon>
        <div v-if="showTip" class="upload-card-limits">
          <span v-if="limit">最多 <em>{{ limit }}</em> 张</span>
          <span v-if="fileSize">≤ <em>{{ fileSize }} MB</em></span>
          <span v-if="fileType && fileType.length" class="upload-card-formats">{{ fileType.join(" / ") }}</span>
        </div>
      </div>
      <template #file="{ file }">
        <div class="named-file">
          <div class="named-file-thumb">
            <img :src="previewSrc(file)" class="named-file-img" alt="" />
            <span class="named-file-actions">
              <span class="named-file-action" @click.stop="handlePictureCardPreview(file)">
                <el-icon><zoom-in /></el-icon>
              </span>
              <span v-if="!disabled" class="named-file-action" @click.stop="removeFile(file)">
                <el-icon><delete /></el-icon>
              </span>
            </span>
          </div>
          <el-input
            v-if="namedMode"
            :model-value="file.name"
            :disabled="disabled"
            maxlength="64"
            placeholder="请输入名称"
            @update:model-value="updateFileName(file, $event)"
          />
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth"
import Sortable from "sortablejs"
import {
  acceptFromFileTypes,
  isSameModelValue,
  mapUploadResponse,
  parseFileList,
  resolveResourceUrl,
  resolveValueType,
  serializeFileList,
  stripExt,
  toStoredPath
} from "@/utils/file"

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: ""
  },
  action: {
    type: String,
    default: "/common/upload"
  },
  data: {
    type: Object
  },
  limit: {
    type: Number,
    default: 5
  },
  fileSize: {
    type: Number,
    default: 5
  },
  fileType: {
    type: Array,
    default: () => ["png", "jpg", "jpeg"]
  },
  isShowTip: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  drag: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: "urlString"
  },
  json: {
    type: Boolean,
    default: false
  }
})

const { proxy } = getCurrentInstance()
const emit = defineEmits(["update:modelValue"])
const number = ref(0)
const uploadList = ref([])
const dialogImageUrl = ref("")
const dialogVisible = ref(false)
const skipModelSync = ref(false)
const uploadImgUrl = computed(() => import.meta.env.VITE_APP_BASE_API + props.action)
const headers = computed(() => ({ Authorization: "Bearer " + getToken() }))
const fileList = ref([])
const valueType = computed(() => resolveValueType(props.type, props.json, "urlString"))
const namedMode = computed(() => valueType.value === "jsonArray" || valueType.value === "jsonString" || props.json)
const accept = computed(() => acceptFromFileTypes(props.fileType))
const showTip = computed(() => !props.disabled && props.isShowTip && !!(props.limit || props.fileSize || props.fileType?.length))

function previewSrc(file) {
  return resolveResourceUrl(file.url)
}

function toUploadFile(item) {
  return {
    ...item,
    name: item.name,
    url: resolveResourceUrl(item.url),
    status: "success"
  }
}

function syncFromModel(val) {
  fileList.value = parseFileList(val).map(toUploadFile)
}

function syncModelValue() {
  const stored = fileList.value.map((item) => ({
    ...item,
    url: toStoredPath(item.url),
    name: stripExt(item.name)
  }))
  const next = serializeFileList(stored, valueType.value)
  if (isSameModelValue(next, props.modelValue)) {
    return
  }
  skipModelSync.value = true
  emit("update:modelValue", next)
  nextTick(() => {
    skipModelSync.value = false
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (skipModelSync.value || number.value > 0) {
      return
    }
    syncFromModel(val)
  },
  { deep: true, immediate: true }
)

function handleBeforeUpload(file) {
  let isImg = false
  if (props.fileType.length) {
    let fileExtension = ""
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1)
    }
    isImg = props.fileType.some((type) => {
      if (file.type.indexOf(type) > -1) return true
      if (fileExtension && fileExtension.indexOf(type) > -1) return true
      return false
    })
  } else {
    isImg = file.type.indexOf("image") > -1
  }
  if (!isImg) {
    proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join("/")}图片格式文件!`)
    return false
  }
  if (valueType.value === "urlString" && file.name.includes(",")) {
    proxy.$modal.msgError("文件名不正确，不能包含英文逗号!")
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传图片大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  proxy.$modal.loading("正在上传图片，请稍候...")
  number.value++
}

function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    const mapped = mapUploadResponse(res, file?.raw || file)
    uploadList.value.push(toUploadFile(mapped))
    uploadedSuccessfully()
  } else {
    number.value--
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(res.msg)
    proxy.$refs.imageUpload.handleRemove(file)
    uploadedSuccessfully()
  }
}

function handleDelete(file) {
  const findex = fileList.value.findIndex(
    (f) => f.uid === file.uid || f.url === file.url || f.name === file.name
  )
  if (findex > -1 && uploadList.value.length === number.value) {
    fileList.value.splice(findex, 1)
    syncModelValue()
    return false
  }
}

function removeFile(file) {
  const findex = fileList.value.findIndex(
    (f) => f.uid === file.uid || f.url === file.url || f.name === file.name
  )
  if (findex > -1) {
    fileList.value.splice(findex, 1)
    syncModelValue()
  }
}

function updateFileName(file, name) {
  file.name = stripExt(name)
  syncModelValue()
}

function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    syncModelValue()
    proxy.$modal.closeLoading()
  }
}

function handleUploadError() {
  number.value = Math.max(0, number.value - 1)
  proxy.$modal.msgError("上传图片失败")
  proxy.$modal.closeLoading()
}

function handlePictureCardPreview(file) {
  dialogImageUrl.value = resolveResourceUrl(file.url)
  dialogVisible.value = true
}

onMounted(() => {
  if (props.drag && !props.disabled) {
    nextTick(() => {
      const element = proxy.$refs.imageUpload?.$el?.querySelector(".el-upload-list")
      if (!element) return
      Sortable.create(element, {
        onEnd: (evt) => {
          const movedItem = fileList.value.splice(evt.oldIndex, 1)[0]
          fileList.value.splice(evt.newIndex, 0, movedItem)
          syncModelValue()
        }
      })
    })
  }
})
</script>

<style scoped lang="scss">
:deep(.hide .el-upload--picture-card) {
  display: none;
}

:deep(.el-upload.el-upload--picture-card.is-disabled) {
  display: none !important;
}

:deep(.el-upload--picture-card) {
  width: 160px;
  height: 160px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 160px;
  height: 160px;
}

.upload-card-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px 8px;
  box-sizing: border-box;
  gap: 8px;
}

.upload-card-icon {
  font-size: 24px;
  color: var(--el-text-color-secondary);
}

.upload-card-limits {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  word-break: break-all;
  text-align: center;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--el-color-danger);
  }
}

.upload-card-formats {
  color: var(--el-color-primary);
}

.named-upload {
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 160px;
    height: auto;
    overflow: visible;
    border: none;
    margin: 0 8px 8px 0;
    background: transparent;
  }
}

.named-file {
  width: 100%;
}

.named-file-thumb {
  position: relative;
  width: 160px;
  height: 160px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.named-file-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.named-file-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.named-file-thumb:hover .named-file-actions {
  opacity: 1;
}

.named-file-action {
  cursor: pointer;
}

.named-file :deep(.el-input) {
  margin-top: 6px;
}
</style>
