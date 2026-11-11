import request from '@/utils/request'

// 查询商家经营类目列表
export function listMerchantCategory(query) {
  return request({
    url: '/web/merchant/merchantCategory/list',
    method: 'get',
    params: query
  })
}

// 查询商家经营类目详细
export function getMerchantCategory(categoryId) {
  return request({
    url: '/web/merchant/merchantCategory/' + categoryId,
    method: 'get'
  })
}

// 新增商家经营类目
export function addMerchantCategory(data) {
  return request({
    url: '/web/merchant/merchantCategory',
    method: 'post',
    data: data
  })
}

// 修改商家经营类目
export function updateMerchantCategory(data) {
  return request({
    url: '/web/merchant/merchantCategory',
    method: 'put',
    data: data
  })
}

// 删除商家经营类目
export function delMerchantCategory(categoryId) {
  return request({
    url: '/web/merchant/merchantCategory/' + categoryId,
    method: 'delete'
  })
}
