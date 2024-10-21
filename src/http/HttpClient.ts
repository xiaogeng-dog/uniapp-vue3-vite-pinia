import axios from 'axios'
import { uniAdapter } from 'fant-axios-adapter'
import AxiosCancelToken from './AxiosCancelToken'
import NProgress from '@/utils/progress'
const axiosCancelToken = new AxiosCancelToken()
import { TIME_OUT, MAIN_BASE_URL } from './config'

export default class ApiClient {
  /**
   * 创建axios
   * @param abortRequest 取消请求配置，可选值：same(取消相同请求)、all(取消所有请求)、none(不取消请求)
   * @returns
   */
  public static server(abortRequest: 'same' | 'all' | 'none' = 'none', url?: string) {
    // 可以在这里拦截
    const baseURL = url || MAIN_BASE_URL
    return ApiClient.create(baseURL, abortRequest)
  }

  private static create(baseURL: string, abortRequest: 'same' | 'all' | 'none' = 'none') {
    const instance = axios.create({
      withCredentials: true,
      baseURL: baseURL,
      timeout: TIME_OUT,
      adapter: uniAdapter // 指定适配器
    })
    instance.interceptors.request.use(
      (request) => {
        NProgress.start()
        console.log('🚀 ~ ApiClient ~ create ~ request:', request)
        // 设置conten-type
        // request.headers ? (request.headers['Content-Type'] = 'application/json') : (request.headers = { 'Content-Type': 'application/json' })
        // 设置请求唯一标识（便于查询请求日志）
        // request.headers.trace_id = new Date().getTime()
        const token = useAuthStore().token
        if (request.headers && token) {
          // 类型缩小
          switch (request.method) {
            case 'get':
              request.params['openId'] = encodeURIComponent(token)
              break
            case 'post':
              if (request.data instanceof Object) {
                request.data['openid'] = token
              }
              break
            default:
              break
          }
          // if (!(request.headers && request.headers.Authorization)) {
          //   request.headers.Authorization = token
          // }
        }
        switch (abortRequest) {
          case 'all':
            axiosCancelToken.removeAllRequest()
            break
          case 'same':
            axiosCancelToken.removeRequest(request)
            break
          default:
            break
        }
        axiosCancelToken.addRequest(request)
        return request
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use(
      (response) => {
        NProgress.done()
        // 此处为前后端约定的接口成功的字段，旨在处理状态码为200的错误响应，开发者可自行调整
        if (response.status === 200) {
          if (response?.data?.code == 400) {
            useAuthStore().getOpenIdAction()
          }
          return response
        } else {
          const error: Record<string, any> = {}
          if (response.data.code) {
            error.code = response.data.code
          }
          if (response.data.msg) {
            error.message = response.data.msg
          } else {
            error.message = response.status + '服务器内部异常'
          }
          error.response = response.data
          return Promise.reject(error)
        }
      },
      (error) => {
        NProgress.done()
        if (error.status !== 0 && !error.status) {
          const newError = error as any
          newError.msg = newError.errMsg || '请检查网络设置'
          return Promise.reject(newError)
        }
        const pages = getCurrentPages() as any[]
        const oauthStore = useAuthStore()
        switch (error.status) {
          // 小程序切换页面会导致正在处理中的请求返回状态码为0 这里还没有什么比较好的处理方案
          // case 0:
          //   error.msg = '请检查网络设置'
          //   break
          case 1:
            error.msg = '网络超时!'
            break
          case 401:
            oauthStore.logout()
            setTimeout(() => {
              uni.showToast({ title: '登录已过期,请重新登录!', icon: 'none' })
            }, 300)
            // 如果当前页面不是登录页面则跳转至登录页面
            if (
              !pages[pages.length - 1].$page ||
              (pages[pages.length - 1].$page &&
                pages[pages.length - 1].$page.fullPath !== '/pages/login/Login')
            ) {
              uni.reLaunch({ url: '/pagesOther/login/Login' })
            }
            break

          case 403:
            error.msg = `${error.status} 禁止访问!`
            break
          case 500:
            error.msg = `${error.status} 服务内部异常!`
            break
          case 502:
            error.msg = `${error.status} 服务器暂不可用!`
            break
          case 503:
            error.msg = `${error.status} 服务器升级中!`
            break
          case 404:
            error.msg = `${error.status} 服务器无回应!`
            break
          default:
            error.msg = `${error.status} 未知错误!`
        }
        return Promise.reject(error)
      }
    )
    return instance
  }
}
