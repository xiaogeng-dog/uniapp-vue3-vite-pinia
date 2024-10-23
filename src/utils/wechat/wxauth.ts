import jweixin from 'weixin-js-sdk'

interface authOptions {
  appid: string
  scope?: string
  state?: string
}

/**
 * 判断是不是微信浏览器
 * @returns Boolean
 */
export function isWxBrowser() {
  // #ifdef H5
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.match(/micromessenger/i)) {
    const system = {
      win: false,
      mac: false
    }
    // 检测平台
    const p = window.navigator.platform
    system.win = p.indexOf('Win') === 0
    system.mac = p.indexOf('Mac') === 0
    if (system.win || system.mac) {
      console.log('在微信PC端上打开内置浏览器')
    } else {
      console.log('非微信PC端上打开内置浏览器')
    }
    return true
  } else {
    console.log('非微信PC端上打开内置浏览器')
    return false
  }
  // #endif
  return false
}

/**
 * 微信公众号登录, 推荐除底栏等自定义跳转地址，不需要填写redirect_uri
 * 可用history.length查看当前页授权过程
 * @param options authOptions
 * @returns string
 */
export default function wxAuthorize(options: authOptions) {
  if (isWxBrowser()) {
    // 非静默授权，第一次有弹框
    let local = window.location.href // 获取页面url
    const appid = options.appid // 公众号appid
    const scope = options.scope || 'snsapi_userinfo' //
    const state = options.state || '123'

    let code = getParameterByName('code') // 截取code
    // 获取之前的code
    const { wechatCode } = useAuthStore()
    if (code == null || code === '' || code == 'undefined' || code == wechatCode) {
      // 如果没有code，就去请求获取code
      let uri = import.meta.env.PROD
        ? encodeURIComponent(local)
        : encodeURIComponent(import.meta.env.VITE_REDIRECT_URL)
      // 设置旧的code为0，避免死循环
      // uni.setStorageSync('wechatCode', 0)
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    } else {
      // 保存最新code
      return code
    }
  }
}

/**
 * 微信jsSdk
 * @param wxConfig // https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#1
 */
export function initWxConfig(wxConfig: WeixinJsSdk.ConfigOptions) {
  if (isWxBrowser()) {
    jweixin.config({
      debug: wxConfig.debug || false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: wxConfig.appId, // 必填，公众号的唯一标识
      timestamp: wxConfig.timestamp, // 必填，生成签名的时间戳
      nonceStr: wxConfig.nonceStr, // 必填，生成签名的随机串
      signature: wxConfig.signature, // 必填，签名
      jsApiList: wxConfig.jsApiList || [
        // 'checkJsApi', // 判断当前客户端版本是否支持指定JS接口
        'updateAppMessageShareData', // 分享给朋友，需放在ready中
        'updateTimelineShareData', // 分享到朋友圈，需放在ready中
        // 'getLocation', // 获取位置
        // 'openLocation', // 打开位置
        // 'scanQRCode', // 扫一扫接口
        'chooseWXPay' // 微信支付
        // 'hideAllNonBaseMenuItem', // 隐藏所有非基础按钮接口: https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#64
        // 'showAllNonBaseMenuItem',
        // 'hideMenuItems', // 只能隐藏“传播类”和“保护类”按钮
        // 'showMenuItems'
      ], // 必填，需要使用的JS接口列表
      openTagList: wxConfig.openTagList || [
        'wx-open-subscribe' // 服务号订阅通知 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_Open_Tag.html#23
      ] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
    })
  }
}

/**
 * 微信分享
 * @param data
 * @param callback function
 * @param destroyed boolean
 */
export function updateAppMessageShareData(data, callback, destroyed) {
  if (isWxBrowser() && !destroyed) {
    jweixin.ready(function () {
      // 需在用户可能点击分享按钮前就先调用
      jweixin.onMenuShareAppMessage({
        // 分享给朋友： https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#10
        title: data.title, // 分享标题
        desc: data.desc, // 分享描述
        link: data.link || document.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.imgUrl, // 分享图标
        success: function () {
          callback()
        }
      })
      jweixin.onMenuShareTimeline({
        // 分享到朋友圈
        title: data.title, // 分享标题
        link: data.link || document.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.imgUrl, // 分享图标
        success: function () {}
      })
    })
  }
  // onHide：跳转下一页，onUnload：返回上一页。方法中必须传入destroyed销毁分享链接
  if (destroyed) {
  }
}

/**
 * 微信支付：
 * 前端：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#58
 * 后端：https://pay.weixin.qq.com/wiki/doc/apiv3/open/pay/chapter1_1_1.shtml
 */
export function chooseWXPay(data, success, cancel, fail) {
  if (isWxBrowser()) {
    jweixin.chooseWXPay({
      timestamp: data.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
      nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
      package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
      signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
      paySign: data.paySign, // 支付签名
      success: function (res) {
        // 支付成功后的回调函数
        success(res)
      },
      // 支付取消回调函数
      cancel: function (res) {
        cancel(res)
      },
      // 支付失败回调函数
      fail: function (res) {
        fail(res)
      }
    })
  }
}

/**
 *  隐藏所有非基础按钮接口：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#47
 */
export function hideAllNonBaseMenuItem() {
  if (isWxBrowser()) {
    jweixin.ready(function () {
      // 需在用户可能点击分享按钮前就先调用
      jweixin.hideAllNonBaseMenuItem()
    })
  }
}
export function closeWindow() {
  if (isWxBrowser()) {
    jweixin.closeWindow()
  }
}

function getParameterByName(name: string, url?: string) {
  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  //匹配所有符合条件的，并取最后一个
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'g')
  var results = url.match(regex)
  var tempResults =
    results != null && results[results.length - 1] != undefined ? results[results.length - 1] : ''

  var finalResults = regex.exec(tempResults)
  if (!finalResults) return ''
  if (!finalResults[2]) return ''
  return decodeURIComponent(finalResults[2].replace(/\+/g, ' '))
}
