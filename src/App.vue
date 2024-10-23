<template>
  <div class="app-wrapper">
    <van-config-provider :theme="useDarkMode() ? 'dark' : 'light'">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </van-config-provider>
  </div>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useDarkMode } from '@/hooks/useToggleDarkMode'
// #ifdef H5
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'
// #endif

const cachedViews = computed(() => {
  return useCachedViewStore().cachedViewList
})

onLaunch(async (ctx) => {
  useAuthStore().getOpenIdAction()
  // useAuthStore().getJSApiTicketAction(
  //   '85_97ynbvbnGvxvfXgSvOZPEFZbrOH3pKAph3EejJksGOAWAavcpHlg7efWscr6_nFCSqDsDe0L8Pho_iLb57EQp9SioU_VyuymLMJEgdsDXHM'
  // )
  // if ( == 'micromessenger') {
  // }

  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style>
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
