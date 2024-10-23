import type UserInfo from '@/model/UserInfo'
import { defineStore } from 'pinia'

import encryptPassword from '@/utils/premission'
import commonApi from '@/api/commonApi'

import { showDialog } from 'vant'
import wxAuthorize from '@/utils/wechat/wxauth'

interface AuthStore {
  // 鉴权令牌
  userInfo: UserInfo | null
  wechatCode: string | null | undefined
  openId: string | null
  token: any
  appid: string
  isRegister: boolean
  configData: Partial<WeixinJsSdk.ConfigOptions>
}

// defineStore 调用后返回一个函数，调用该函数获得 Store 实体
export const useAuthStore = defineStore('authState', {
  // state: 返回对象的函数
  state: (): AuthStore => ({
    userInfo: {
      loginId: '嘻嘻嘻',
      nickName: '小星星',
      school: '阳逻停水停电职业技术学院',
      uuid: '65465465465465465465'
    },
    token: null,
    appid: import.meta.env.VITE_APP_APPID,
    wechatCode: null,
    openId: null,
    isRegister: false,
    // 微信公众号jsSdk配置
    configData: {
      debug: import.meta.env.VITE_APP_DEBUG, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: import.meta.env.VITE_APP_APPID, // 必填，公众号的唯一标识
      timestamp: import.meta.env.VITE_APP_TIMESTAMP, // 必填，生成签名的时间戳
      nonceStr: import.meta.env.VITE_APP_NONCESTR, // 必填，生成签名的随机串
      signature: import.meta.env.VITE_APP_SIGNATURE // 必填，签名
    }
  }),
  getters: {},
  actions: {
    async getOpenIdAction() {
      const code = wxAuthorize({
        appid: this.appid
      })
      const params = {
        code: code,
        moduleCode: 'czwcg'
      }
      console.log(this.openId, this.token)
      if (uni.getStorageSync('token')) {
        this.token = uni.getStorageSync('token')
      }
      if (!this.token) {
        const res = await commonApi.handleGetOpenId(params)
        if (res.code == 0 && res.data.openid) {
          this.openId = res.data.openid
          this.token = encryptPassword.encrypt(res.data.openid)
          uni.setStorageSync('token', this.token)
          this.isJudgeRegister()
          // this.getJSApiTicketAction(res.data.access_token)
        } else {
          // 获取失败的话重新获取code
          this.wechatCode = code
          wxAuthorize({
            appid: this.appid
          })
        }
      }
    },
    async getJSApiTicketAction(accessToken) {
      let params = {
        access_token: accessToken,
        type: 'jsapi'
      }
      const res = await commonApi.handleGetJSApiTicket(params)
      console.log('🚀 ~ getJSApiTicketAction ~ res:', res)
    },
    async isJudgeRegister(key = true) {
      if (this.token && !this.isRegister) {
        const res = await commonApi.handleUserInfo()
        console.log('🚀 ~ isJudgeRegister ~ res:', res)
        if (res.code != 0) {
          if (key) {
            showDialog({
              title: '提示',
              message: '您当前账号未绑定，请前往绑定！',
              theme: 'round-button'
            }).then(() => {
              // on close
              uni.redirectTo({
                url: '/pages/register/Register'
              })
            })
          }
        } else {
          this.userInfo = {
            ...this.userInfo,
            ...res.data
          }
        }
      }
    },
    async register(value) {
      return new Promise<any>(async (resolve, reject) => {
        try {
          let params = {
            ...value
          }
          const res = await commonApi.handleSaveUser(params)
          resolve(res)
          if (res.code == 0) {
            this.userInfo = {
              ...this.userInfo,
              ...res.data
            }
            this.isRegister = true
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    async getCode(value) {
      return new Promise<any>(async (resolve, reject) => {
        try {
          let params = {
            ...value
          }
          const res = await commonApi.handleVerifyCode(params)
          resolve(res)
        } catch (e) {
          reject(e)
        }
      })
    },
    logout() {
      this.openId = ''
      this.token = null
      this.isRegister = false
      this.userInfo = {
        loginId: '嘻嘻嘻',
        nickName: '小星星',
        school: '阳逻停水停电职业技术学院',
        uuid: '65465465465465465465'
      }
      uni.clearStorageSync()
    }
  }
})
