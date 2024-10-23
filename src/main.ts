import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import { persist } from './store/persist'
// normalize.css
import 'normalize.css/normalize.css'
// 全局样式
import './static/styles/index.less'
// tailwindcss
import './static/styles/tailwind.css'
// #ifdef H5
window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_APP_AMAP_SECURITY_KEY
}
// #endif

const pinia = createPinia()
pinia.use(persist)
export function createApp() {
  const app = createSSRApp(App)
  app.config.warnHandler = () => null
  app.use(router)
  app.use(pinia)
  return {
    app,
    pinia
  }
}
