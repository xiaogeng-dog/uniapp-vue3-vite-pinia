import http from '@/http/HttpClient'
import type BaseResponse from '@/model/BaseResponse'
// 这里将API方法统一管理
export default class CommonApi {
  /**
   * code获取openId
   */
  static handleGetOpenId(params): Promise<BaseResponse<any>> {
    return http
      .server()
      .post('/yaoTangWeChat/app/getOpenidByCode', params, {})
      .then((res) => {
        return res.data
      })
  }
  static handleGetJSApiTicket(params): Promise<BaseResponse<any>> {
    return http
      .server('none', 'https://api.weixin.qq.com')
      .get('/cgi-bin/ticket/getticket', { params })
      .then((res) => {
        return res.data
      })
  }

  /**
   * 公用（上传图片）
   */
  static handlePublicUrlAction(url, data): Promise<BaseResponse<any>> {
    return http
      .server()
      .post(url, data)
      .then((res) => {
        return res.data
      })
  }
  /**
   * 获取用户信息
   */
  static handleUserInfo(): Promise<BaseResponse<any>> {
    return http
      .server()
      .post('/yaoTangWeChat/app/getCustomer', {}, {})
      .then((res) => {
        return res.data
      })
  }
  /**
   * 发送验证码
   */
  static handleVerifyCode(data): Promise<BaseResponse<any>> {
    return http
      .server()
      .post('/yaoTangWeChat/app/getVerifyCode', data, {})
      .then((res) => {
        return res.data
      })
  }
  /**
   * 绑定用户
   */
  static handleSaveUser(data): Promise<BaseResponse<any>> {
    return http
      .server()
      .post('/yaoTangWeChat/app/saveOrUpdateCustomer', data, {})
      .then((res) => {
        return res.data
      })
  }
}
