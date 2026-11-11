<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :data="data"
      :limit="limit"
      :accept="accept"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
      v-if="!disabled"
    >
      <el-button type="primary">选取文件</el-button>
    </el-upload>
    <div v-if="showTip" class="upload-file-limits">
      <span v-if="limit">最多 <em>{{ limit }}</em> 个</span>
      <span v-if="fileSize">≤ <em>{{ fileSize }} MB</em></span>
      <span v-if="fileType && fileType.length" class="upload-file-formats">{{ fileType.join(" / ") }}</span>
    </div>
    <transition-group
      ref="uploadFileList"
      class="upload-file-list el-upload-list el-upload-list--text"
      name="el-fade-in-linear"
      tag="ul"
    >
      <li
        :key="file.uid"
        class="el-upload-list__item ele-upload-list__item-content"
        v-for="(file, index) in fileList"
      >
        <el-link :href="resolveResourceUrl(file.url)" underline="never" target="_blank">
          <span class="file-item-main">
            <el-icon class="file-item-icon"><component :is="fileTypeIconName(file.fileType)" /></el-icon>
            <span>
              <template v-if="namedMode">
                <el-input
                  :model-value="file.name"
                  :disabled="disabled"
                  maxlength="64"
                  size="small"
                  class="file-name-input"
                  @update:model-value="updateFileName(file, $event)"
                  @click.stop
                />
              </template>
              <span v-else class="el-icon-document">{{ displayName(file) }}</span>
              <span v-if="file.size" class="file-item-size">{{ formatFileSize(file.size) }}</span>
            </span>
          </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link underline="never" @click="handleDelete(index)" type="danger" v-if="!disabled">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth"
import Sortable from "sortablejs"
import {
  acceptFromFileTypes,
  fileTypeIconName,
  formatFileSize,
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
    default: () => ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "pdf", "png", "jpg", "jpeg"]
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
const skipModelSync = ref(false)
const uploadFileUrl = computed(() => import.meta.env.VITE_APP_BASE_API + props.action)
const headers = computed(() => ({ Authorization: "Bearer " + getToken() }))
const fileList = ref([])
const valueType = computed(() => resolveValueType(props.type, props.json, "urlString"))
const namedMode = computed(() => valueType.value === "jsonArray" || valueType.value === "jsonString" || props.json)
const accept = computed(() => acceptFromFileTypes(props.fileType))
const showTip = computed(() => !props.disabled && props.isShowTip && !!(props.limit || props.fileSize || props.fileType?.length))

function displayName(file) {
  if (!file?.name) {
    return ""
  }
  return file.fileType ? `${file.name}.${file.fileType}` : file.name
}

function syncFromModel(val) {
  fileList.value = parseFileList(val)
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
  if (props.fileType.length) {
    const fileName = file.name.split(".")
    const fileExt = fileName[fileName.length - 1]
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join("/")}格式文件!`)
      return false
    }
  }
  if (valueType.value === "urlString" && file.name.includes(",")) {
    proxy.$modal.msgError("文件名不正确，不能包含英文逗号!")
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  proxy.$modal.loading("正在上传文件，请稍候...")
  number.value++
  return true
}

function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadError() {
  number.value = Math.max(0, number.value - 1)
  proxy.$modal.msgError("上传文件失败")
  proxy.$modal.closeLoading()
}

function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push(mapUploadResponse(res, file?.raw || file))
    uploadedSuccessfully()
  } else {
    number.value--
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(res.msg)
    proxy.$refs.fileUpload.handleRemove(file)
    uploadedSuccessfully()
  }
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  syncModelValue()
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

onMounted(() => {
  if (props.drag && !props.disabled) {
    nextTick(() => {
      const element = proxy.$refs.uploadFileList?.$el || proxy.$refs.uploadFileList
      if (!element) return
      Sortable.create(element, {
        ghostClass: "file-upload-darg",
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
.file-upload-darg {
  opacity: 0.5;
  background: #c8ebfb;
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-limits {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--el-color-danger);
  }
}
.upload-file-formats {
  color: var(--el-color-primary);
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
  transition: none !important;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.file-item-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.file-item-icon {
  font-size: 16px;
}
.file-item-size {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.file-name-input {
  width: 180px;
}
</style>
