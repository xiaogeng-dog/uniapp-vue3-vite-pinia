import { defineStore } from 'pinia'
import type { Route } from 'uni-mini-router'

export const useCachedViewStore = defineStore('useCachedView', {
  state: () => ({
    // 缓存页面 keepAlive
    cachedViewList: [] as string[]
  }),
  actions: {
    addCachedView(view: Route) {
      // 不重复添加
      if (this.cachedViewList.includes(view.name as string)) return
    },
    delCachedView(view: Route) {
      const index = this.cachedViewList.indexOf(view.name as string)
      if (index > -1) {
        this.cachedViewList.splice(index, 1)
      }
    },
    delAllCachedViews() {
      this.cachedViewList = [] as string[]
    }
  }
})
