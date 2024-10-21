interface authOptions {
  appid: string
  scope?: string
  state?: string
}

// 微信公众号授权
export default function wxAuthorize(options: authOptions) {
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
