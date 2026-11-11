import request from '@/utils/request'

// 查询商家申请列表
export function listMerchantApply(query) {
  return request({
    url: '/web/merchant/merchantApply/list',
    method: 'get',
    params: query
  })
}

// 查询商家申请详细
export function getMerchantApply(applyId) {
  return request({
    url: '/web/merchant/merchantApply/' + applyId,
    method: 'get'
  })
}

// 新增商家申请
export function addMerchantApply(data) {
  return request({
    url: '/web/merchant/merchantApply',
    method: 'post',
    data: data
  })
}

// 修改商家申请
export function updateMerchantApply(data) {
  return request({
    url: '/web/merchant/merchantApply',
    method: 'put',
    data: data
  })
}

// 删除商家申请
export function delMerchantApply(applyId) {
  return request({
    url: '/web/merchant/merchantApply/' + applyId,
    method: 'delete'
  })
}

// 通过商家申请
export function approveMerchantApply(applyId) {
  return request({
    url: '/web/merchant/merchantApply/' + applyId + '/approve',
    method: 'put'
  })
}

// 驳回商家申请
export function rejectMerchantApply(data) {
  return request({
    url: '/web/merchant/merchantApply/reject',
    method: 'put',
    data: data
  })
}
