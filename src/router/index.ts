import pagesJson from '../pages.json'
import pagesJsonToRoutes from 'uni-parse-pages'
import NProgress from '@/utils/progress'
const router = createRouter({
  routes: [...pagesJsonToRoutes(pagesJson)]
})
router.beforeEach((to, from, next) => {
  NProgress.start()
  const authStore = useAuthStore()

  // 路由缓存
  useCachedViewStore().addCachedView(to)

  if (to.name !== 'register') {
    authStore.isJudgeRegister()
  }

  if (!authStore.$state.userInfo && to && to.name !== 'login') {
    // 如果没有登录信息且目标路由不是登录页面则跳转到登录页面
    next({ name: 'login', navType: 'replaceAll' })
  } else if (authStore.$state.userInfo && to && to.name === 'login') {
    // 如果已经登录且目标页面是登录页面则跳转至首页
    next({ name: 'home', navType: 'replaceAll' })
  } else {
    next()
  }
})
router.afterEach((to) => {
  NProgress.done()
  const authStore = useAuthStore()

  if (!authStore.$state.userInfo && to.name !== 'login') {
    // 如果没有登录信息且目标路由不是登录页面则跳转到登录页面
    router.replaceAll({ name: 'login' })
  } else if (authStore.$state.userInfo && to.name === 'login') {
    // 如果已经登录且目标页面是登录页面则跳转至首页
    router.replaceAll({ name: 'home' })
  }
})

export default router
