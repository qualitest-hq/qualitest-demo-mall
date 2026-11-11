<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="店铺名称" prop="merchantName">
        <el-input
          v-model="queryParams.merchantName"
          placeholder="请输入店铺名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="经营类目" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="item in categoryOptions" :key="item.categoryId" :label="item.categoryName" :value="item.categoryId" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请类型" prop="applyType">
        <el-select v-model="queryParams.applyType" placeholder="全部" clearable style="width: 140px">
          <el-option label="入驻" :value="1" />
          <el-option label="资料变更" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="待审" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
          <el-option label="已撤销" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['merchant:merchantApply:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['merchant:merchantApply:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['merchant:merchantApply:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['merchant:merchantApply:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="merchantApplyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="申请ID" align="center" key="applyId" prop="applyId" width="100" v-if="columnVisible['applyId']" />
      <el-table-column label="账号" align="center" key="accountNickName" min-width="140" show-overflow-tooltip v-if="columnVisible['accountNickName']">
        <template #default="scope">
          <span>{{ accountLabel(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号ID" align="center" key="accountId" prop="accountId" v-if="columnVisible['accountId']" />
      <el-table-column label="关联商家" align="center" key="linkedMerchantName" min-width="120" show-overflow-tooltip v-if="columnVisible['linkedMerchantName']">
        <template #default="scope">
          <span>{{ scope.row.linkedMerchantName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商家ID" align="center" key="merchantId" prop="merchantId" v-if="columnVisible['merchantId']" />
      <el-table-column label="申请类型" align="center" key="applyType" prop="applyType" width="100" v-if="columnVisible['applyType']">
        <template #default="scope">
          <span>{{ applyTypeLabel(scope.row.applyType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" align="center" key="merchantName" prop="merchantName" min-width="140" show-overflow-tooltip v-if="columnVisible['merchantName']" />
      <el-table-column label="经营类目" align="center" key="categoryName" prop="categoryName" width="120" v-if="columnVisible['categoryName']" />
      <el-table-column label="经营类目ID" align="center" key="categoryId" prop="categoryId" v-if="columnVisible['categoryId']" />
      <el-table-column label="商家图标" align="center" key="logo" prop="logo" width="90" v-if="columnVisible['logo']">
        <template #default="scope">
          <image-preview :src="scope.row.logo" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" key="contactName" prop="contactName" width="100" v-if="columnVisible['contactName']" />
      <el-table-column label="联系电话" align="center" key="contactPhone" prop="contactPhone" width="120" v-if="columnVisible['contactPhone']" />
      <el-table-column label="申请状态" align="center" key="status" prop="status" width="100" v-if="columnVisible['status']">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="驳回原因" align="center" key="rejectReason" prop="rejectReason" min-width="120" show-overflow-tooltip v-if="columnVisible['rejectReason']" />
      <el-table-column label="审核时间" align="center" key="auditTime" prop="auditTime" width="160" v-if="columnVisible['auditTime']">
        <template #default="scope">
          <span>{{ parseTime(scope.row.auditTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleAudit(scope.row)"
            v-hasPermi="['merchant:merchantApply:query']"
          >{{ Number(scope.row.status) === 0 ? '审核' : '详情' }}</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['merchant:merchantApply:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['merchant:merchantApply:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="560px" append-to-body>
      <el-form ref="merchantApplyRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="绑定账号" prop="accountId">
          <RemoteSelect v-model="form.accountId" :remote="accountRemote" placeholder="昵称/手机号搜索" />
        </el-form-item>
        <el-form-item label="申请类型" prop="applyType">
          <el-select v-model="form.applyType" placeholder="请选择申请类型" style="width: 100%">
            <el-option label="入驻" :value="1" />
            <el-option label="资料变更" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联商家" prop="merchantId">
          <RemoteSelect v-model="form.merchantId" :remote="merchantRemote" placeholder="店铺名称搜索（资料变更）" />
        </el-form-item>
        <el-form-item label="店铺名称" prop="merchantName">
          <el-input v-model="form.merchantName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="经营类目" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择经营类目" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.categoryId" :label="item.categoryName" :value="item.categoryId" />
          </el-select>
        </el-form-item>
        <el-form-item label="商家图标" prop="logo">
          <image-upload v-model="form.logo" :limit="1" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="营业状态" prop="openStatus">
          <el-radio-group v-model="form.openStatus">
            <el-radio :value="1">营业</el-radio>
            <el-radio :value="0">打烊</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="资质文件" prop="licenseFiles">
          <file-upload v-model="form.licenseFiles" type="jsonString" :limit="5" :file-type="['png','jpg','jpeg','pdf']" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="auditTitle" v-model="auditOpen" width="640px" append-to-body destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请类型">{{ applyTypeLabel(auditDetail.applyType) }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="statusTagType(auditDetail.status)">{{ statusLabel(auditDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账号" :span="2">{{ accountLabel(auditDetail) }}</el-descriptions-item>
        <el-descriptions-item label="关联商家" :span="2">{{ auditDetail.linkedMerchantName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="店铺名称" :span="2">{{ auditDetail.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="经营类目">{{ auditDetail.categoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="营业状态">{{ openStatusLabel(auditDetail.openStatus) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ auditDetail.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ auditDetail.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="商家图标" :span="2">
          <image-preview v-if="auditDetail.logo" :src="auditDetail.logo" :width="80" :height="80" />
          <span v-else>未上传</span>
        </el-descriptions-item>
        <el-descriptions-item label="资质文件" :span="2">
          <file-upload
            v-if="auditDetail.licenseFiles"
            v-model="auditDetail.licenseFiles"
            type="jsonString"
            :limit="5"
            disabled
            :is-show-tip="false"
          />
          <span v-else>未上传</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="auditDetail.rejectReason" label="驳回原因" :span="2">{{ auditDetail.rejectReason }}</el-descriptions-item>
        <el-descriptions-item v-if="auditDetail.auditTime" label="审核时间" :span="2">{{ parseTime(auditDetail.auditTime) }}</el-descriptions-item>
        <el-descriptions-item v-if="auditDetail.remark" label="备注" :span="2">{{ auditDetail.remark }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <template v-if="Number(auditDetail.status) === 0">
            <el-button
              type="success"
              :loading="auditSubmitting"
              @click="confirmApprove"
              v-hasPermi="['merchant:merchantApply:edit']"
            >通过</el-button>
            <el-button
              type="warning"
              :disabled="auditSubmitting"
              @click="openRejectFromAudit"
              v-hasPermi="['merchant:merchantApply:edit']"
            >驳回</el-button>
          </template>
          <el-button @click="auditOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="驳回申请" v-model="rejectOpen" width="480px" append-to-body>
      <el-form ref="rejectRef" :model="rejectForm" :rules="rejectRules" label-width="90px">
        <el-form-item label="驳回原因" prop="rejectReason">
          <el-input v-model="rejectForm.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="auditSubmitting" @click="submitReject">确 定</el-button>
          <el-button @click="rejectOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MerchantApply">
import { listMerchantApply, getMerchantApply, delMerchantApply, addMerchantApply, updateMerchantApply, approveMerchantApply, rejectMerchantApply } from "@/api/merchant/merchantApply"
import { getAccount } from "@/api/account/account"
import { getMerchant } from "@/api/merchant/merchant"
import { listMerchantCategory } from "@/api/merchant/merchantCategory"
import RemoteSelect from "@/components/RemoteSelect/index.vue"
import { useAccountRemoteSelect, useMerchantRemoteSelect } from "@/utils/useRemoteSelect"

const { proxy } = getCurrentInstance()
const accountRemote = useAccountRemoteSelect()
const merchantRemote = useMerchantRemoteSelect()

const merchantApplyList = ref([])
const categoryOptions = ref([])
const open = ref(false)
const auditOpen = ref(false)
const rejectOpen = ref(false)
const auditSubmitting = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const auditDetail = ref({})
const rejectForm = ref({ applyId: null, rejectReason: "" })
const rejectRules = {
  rejectReason: [{ required: true, message: "请填写驳回原因", trigger: "blur" }]
}

const columns = ref([
  { key: 'applyId', label: '申请ID', visible: false },
  { key: 'accountNickName', label: '账号', visible: true },
  { key: 'accountId', label: '账号ID', visible: false },
  { key: 'linkedMerchantName', label: '关联商家', visible: true },
  { key: 'merchantId', label: '商家ID', visible: false },
  { key: 'applyType', label: '申请类型', visible: true },
  { key: 'merchantName', label: '店铺名称', visible: true },
  { key: 'categoryName', label: '经营类目', visible: true },
  { key: 'categoryId', label: '经营类目ID', visible: false },
  { key: 'logo', label: '商家图标', visible: true },
  { key: 'contactName', label: '联系人', visible: true },
  { key: 'contactPhone', label: '联系电话', visible: true },
  { key: 'status', label: '申请状态', visible: true },
  { key: 'rejectReason', label: '驳回原因', visible: false },
  { key: 'auditTime', label: '审核时间', visible: true },
])

const columnVisible = computed(() => {
  const result = {}
  columns.value.forEach(col => {
    result[col.key] = col.visible
  })
  return result
})

const auditTitle = computed(() => {
  const pending = Number(auditDetail.value?.status) === 0
  const typeText = applyTypeLabel(auditDetail.value?.applyType)
  return pending ? `审核申请（${typeText}）` : `申请详情（${typeText}）`
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantName: undefined,
    categoryId: undefined,
    applyType: undefined,
    status: undefined,
  },
  rules: {
    accountId: [{ required: true, message: "请选择绑定账号", trigger: "change" }],
    applyType: [{ required: true, message: "请选择申请类型", trigger: "change" }],
    merchantName: [{ required: true, message: "店铺名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "请选择经营类目", trigger: "change" }],
  }
})

const { queryParams, form, rules } = toRefs(data)

function accountLabel(row) {
  const parts = [row?.accountNickName, row?.accountMobile].filter(Boolean)
  return parts.length ? parts.join(' / ') : (row?.accountId || '-')
}

function applyTypeLabel(type) {
  const value = Number(type)
  if (value === 1) return "入驻"
  if (value === 2) return "资料变更"
  return type ?? "-"
}

function statusLabel(status) {
  const map = { 0: "待审", 1: "已通过", 2: "已驳回", 3: "已撤销" }
  return map[Number(status)] ?? status ?? "-"
}

function statusTagType(status) {
  const map = { 0: "warning", 1: "success", 2: "danger", 3: "info" }
  return map[Number(status)] || "info"
}

function openStatusLabel(status) {
  return Number(status) === 0 ? "打烊" : "营业中"
}

function getList() {
  loading.value = true
  listMerchantApply(queryParams.value).then(response => {
    merchantApplyList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    applyId: null,
    accountId: null,
    merchantId: null,
    applyType: 1,
    merchantName: null,
    categoryId: null,
    logo: null,
    contactName: null,
    contactPhone: null,
    licenseFiles: null,
    openStatus: 1,
    status: null,
    rejectReason: null,
    auditTime: null,
    remark: null
  }
  proxy.resetForm("merchantApplyRef")
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.applyId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商家申请"
}

async function handleUpdate(row) {
  reset()
  const _applyId = row.applyId || ids.value
  const response = await getMerchantApply(_applyId)
  form.value = response.data
  await Promise.all([
    accountRemote.ensureOption(form.value.accountId, getAccount, (r) => {
      const parts = [r.nickName, r.mobile].filter(Boolean)
      return parts.length ? parts.join(' / ') : `账号${r.accountId}`
    }),
    merchantRemote.ensureOption(form.value.merchantId, getMerchant, (r) => r.merchantName || `商家${r.merchantId}`)
  ])
  open.value = true
  title.value = "修改商家申请"
}

function loadCategories() {
  listMerchantCategory({ pageNum: 1, pageSize: 200, status: 0 }).then(response => {
    categoryOptions.value = response.rows || []
  }).catch(() => {})
}

function handleAudit(row) {
  getMerchantApply(row.applyId).then(response => {
    auditDetail.value = { ...(response.data || {}) }
    auditOpen.value = true
  })
}

function confirmApprove() {
  const applyId = auditDetail.value.applyId
  proxy.$modal.confirm("确认通过该申请？入驻将创建店铺，资料变更将写回商家。").then(() => {
    auditSubmitting.value = true
    return approveMerchantApply(applyId)
  }).then(() => {
    proxy.$modal.msgSuccess("已通过")
    auditOpen.value = false
    getList()
  }).catch(() => {}).finally(() => {
    auditSubmitting.value = false
  })
}

function openRejectFromAudit() {
  rejectForm.value = { applyId: auditDetail.value.applyId, rejectReason: "" }
  rejectOpen.value = true
}

function submitReject() {
  proxy.$refs["rejectRef"].validate(valid => {
    if (!valid) return
    auditSubmitting.value = true
    rejectMerchantApply(rejectForm.value).then(() => {
      proxy.$modal.msgSuccess("已驳回")
      rejectOpen.value = false
      auditOpen.value = false
      getList()
    }).finally(() => {
      auditSubmitting.value = false
    })
  })
}

function submitForm() {
  proxy.$refs["merchantApplyRef"].validate(valid => {
    if (!valid) return
    if (form.value.applyId != null) {
      updateMerchantApply(form.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        open.value = false
        getList()
      })
    } else {
      addMerchantApply(form.value).then(() => {
        proxy.$modal.msgSuccess("新增成功")
        open.value = false
        getList()
      })
    }
  })
}

function handleDelete(row) {
  const _applyIds = row.applyId || ids.value
  proxy.$modal.confirm('是否确认删除商家申请编号为"' + _applyIds + '"的数据项？').then(() => {
    return delMerchantApply(_applyIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

function handleExport() {
  proxy.download('web/merchant/merchantApply/export', {
    ...queryParams.value
  }, `merchantApply_${new Date().getTime()}.xlsx`)
}

loadCategories()
getList()
</script>
