import type { PiniaPluginContext } from 'pinia'
import { cloneDeep } from 'lodash'
export function persist({ store }: PiniaPluginContext) {
  // 暂存State
  let persistState = cloneDeep(store.$state)
  // 从缓存中读取
  const storageState = uni.getStorageSync(store.$id)
  if (storageState) {
    persistState = storageState
  }
  store.$state = persistState
  store.$subscribe(() => {
    // 在存储变化的时候将store缓存
    uni.setStorageSync(store.$id, cloneDeep(store.$state))
  })
}
