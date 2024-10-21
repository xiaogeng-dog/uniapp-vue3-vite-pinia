import http from '@/http/HttpClient'
import type BaseResponse from '@/model/BaseResponse'

/**
 * 获取工单
 */

export function handleGetList(data: any): Promise<BaseResponse<any>> {
  return http
    .server()
    .get('/openApi/getMyReport', { params: data })
    .then((res) => {
      return res.data
    })
}

// export function handleGetRecordDetail(id: string): Promise<BaseResponse<any>> {
//   return http
//     .server()
//     .get(`/api/inspection-record/detail/${id}`)
//     .then((res) => {
//       return res.data
//     })
// }

// // 转工单
// export function handleGetGenerateTask(data: string): Promise<BaseResponse<any>> {
//   return http
//     .server()
//     .post('/api/work-order/generate', data)
//     .then((res) => {
//       return res.data
//     })
// }
