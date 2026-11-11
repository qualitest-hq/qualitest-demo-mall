import request from '@/utils/request'

// 查询商家列表
export function listMerchant(query) {
  return request({
    url: '/web/merchant/merchant/list',
    method: 'get',
    params: query
  })
}

// 查询商家详细
export function getMerchant(merchantId) {
  return request({
    url: '/web/merchant/merchant/' + merchantId,
    method: 'get'
  })
}

// 新增商家
export function addMerchant(data) {
  return request({
    url: '/web/merchant/merchant',
    method: 'post',
    data: data
  })
}

// 修改商家
export function updateMerchant(data) {
  return request({
    url: '/web/merchant/merchant',
    method: 'put',
    data: data
  })
}

// 删除商家
export function delMerchant(merchantId) {
  return request({
    url: '/web/merchant/merchant/' + merchantId,
    method: 'delete'
  })
}
