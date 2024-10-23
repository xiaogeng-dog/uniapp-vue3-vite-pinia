import http from '@/http/HttpClient'
import type BaseResponse from '@/model/BaseResponse'

export function getListApi(params?: object): Promise<BaseResponse<any>> {
  return http.server().get('/list/get', params)
}

export function getListApiError(data?: object): Promise<BaseResponse<any>> {
  return http.server().post('/list/error', data)
}
