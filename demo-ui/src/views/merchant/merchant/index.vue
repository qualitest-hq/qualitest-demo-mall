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
      <el-form-item label="联系人" prop="contactName">
        <el-input
          v-model="queryParams.contactName"
          placeholder="请输入联系人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input
          v-model="queryParams.contactPhone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="营业状态" prop="openStatus">
        <el-select v-model="queryParams.openStatus" placeholder="全部" clearable style="width: 120px">
          <el-option label="打烊" :value="0" />
          <el-option label="营业" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="商家状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="正常" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['merchant:merchant:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['merchant:merchant:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['merchant:merchant:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['merchant:merchant:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="merchantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商家ID" align="center" key="merchantId" prop="merchantId" v-if="columnVisible['merchantId']" />
      <el-table-column label="账号" align="center" key="accountNickName" min-width="140" show-overflow-tooltip v-if="columnVisible['accountNickName']">
        <template #default="scope">
          <span>{{ accountLabel(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号ID" align="center" key="accountId" prop="accountId" v-if="columnVisible['accountId']" />
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
      <el-table-column label="营业状态" align="center" key="openStatus" prop="openStatus" width="90" v-if="columnVisible['openStatus']">
        <template #default="scope">
          <el-tag :type="Number(scope.row.openStatus) === 1 ? 'success' : 'info'">{{ Number(scope.row.openStatus) === 1 ? '营业' : '打烊' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商家状态" align="center" key="status" prop="status" width="90" v-if="columnVisible['status']">
        <template #default="scope">
          <el-tag :type="Number(scope.row.status) === 0 ? 'success' : 'danger'">{{ Number(scope.row.status) === 0 ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" key="remark" prop="remark" show-overflow-tooltip v-if="columnVisible['remark']" />
      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['merchant:merchant:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['merchant:merchant:remove']">删除</el-button>
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
      <el-form ref="merchantRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="绑定账号" prop="accountId">
          <RemoteSelect v-model="form.accountId" :remote="accountRemote" placeholder="昵称/手机号搜索" />
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
        <el-form-item label="商家状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
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
  </div>
</template>

<script setup name="Merchant">
import { listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant } from "@/api/merchant/merchant"
import { getAccount } from "@/api/account/account"
import { listMerchantCategory } from "@/api/merchant/merchantCategory"
import RemoteSelect from "@/components/RemoteSelect/index.vue"
import { useAccountRemoteSelect } from "@/utils/useRemoteSelect"

const { proxy } = getCurrentInstance()
const accountRemote = useAccountRemoteSelect()

const merchantList = ref([])
const categoryOptions = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const columns = ref([
  { key: 'merchantId', label: '商家ID', visible: false },
  { key: 'accountNickName', label: '账号', visible: true },
  { key: 'accountId', label: '账号ID', visible: false },
  { key: 'merchantName', label: '店铺名称', visible: true },
  { key: 'categoryName', label: '经营类目', visible: true },
  { key: 'categoryId', label: '经营类目ID', visible: false },
  { key: 'logo', label: '商家图标', visible: true },
  { key: 'contactName', label: '联系人', visible: true },
  { key: 'contactPhone', label: '联系电话', visible: true },
  { key: 'openStatus', label: '营业状态', visible: true },
  { key: 'status', label: '商家状态', visible: true },
  { key: 'remark', label: '备注', visible: false },
])

const columnVisible = computed(() => {
  const result = {}
  columns.value.forEach(col => {
    result[col.key] = col.visible
  })
  return result
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantName: undefined,
    categoryId: undefined,
    contactName: undefined,
    contactPhone: undefined,
    openStatus: undefined,
    status: undefined,
  },
  rules: {
    accountId: [{ required: true, message: "请选择绑定账号", trigger: "change" }],
    merchantName: [{ required: true, message: "店铺名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "请选择经营类目", trigger: "change" }],
  }
})

const { queryParams, form, rules } = toRefs(data)

function accountLabel(row) {
  const parts = [row.accountNickName, row.accountMobile].filter(Boolean)
  return parts.length ? parts.join(' / ') : (row.accountId || '-')
}

function getList() {
  loading.value = true
  listMerchant(queryParams.value).then(response => {
    merchantList.value = response.rows
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
    merchantId: null,
    accountId: null,
    merchantName: null,
    categoryId: null,
    logo: null,
    contactName: null,
    contactPhone: null,
    licenseFiles: null,
    openStatus: 1,
    status: 0,
    remark: null
  }
  proxy.resetForm("merchantRef")
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
  ids.value = selection.map(item => item.merchantId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商家"
}

async function handleUpdate(row) {
  reset()
  const _merchantId = row.merchantId || ids.value
  const response = await getMerchant(_merchantId)
  form.value = response.data
  await accountRemote.ensureOption(form.value.accountId, getAccount, (r) => {
    const parts = [r.nickName, r.mobile].filter(Boolean)
    return parts.length ? parts.join(' / ') : `账号${r.accountId}`
  })
  open.value = true
  title.value = "修改商家"
}

function loadCategories() {
  listMerchantCategory({ pageNum: 1, pageSize: 200, status: 0 }).then(response => {
    categoryOptions.value = response.rows || []
  }).catch(() => {})
}

function submitForm() {
  proxy.$refs["merchantRef"].validate(valid => {
    if (!valid) return
    if (form.value.merchantId != null) {
      updateMerchant(form.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        open.value = false
        getList()
      })
    } else {
      addMerchant(form.value).then(() => {
        proxy.$modal.msgSuccess("新增成功")
        open.value = false
        getList()
      })
    }
  })
}

function handleDelete(row) {
  const _merchantIds = row.merchantId || ids.value
  proxy.$modal.confirm('是否确认删除商家编号为"' + _merchantIds + '"的数据项？').then(() => {
    return delMerchant(_merchantIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

function handleExport() {
  proxy.download('web/merchant/merchant/export', {
    ...queryParams.value
  }, `merchant_${new Date().getTime()}.xlsx`)
}

loadCategories()
getList()
</script>
