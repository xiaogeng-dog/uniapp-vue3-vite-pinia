import http from '@/http/HttpClient'
import type BaseResponse from '@/model/BaseResponse'

/**
 * 上报
 */
export function handleSubmit(data: any): Promise<BaseResponse<any>> {
  return http
    .server()
    .post('/openApi/commonReport', data, {})
    .then((res) => {
      return res.data
    })
}
/**获取街道 */
export function handleGetList(data: any): Promise<BaseResponse<any>> {
  return http
    .server()
    .get('/openApi/queryChildren', { params: data })
    .then((res) => {
      return res.data
    })
}

/**获取立案条件 */
export function handleFilingAndConditionApi(data: any): Promise<BaseResponse<any>> {
  return http
    .server()
    .get('/openApi/findFilingAndCondition', { params: data })
    .then((res) => {
      return res.data
    })
}
