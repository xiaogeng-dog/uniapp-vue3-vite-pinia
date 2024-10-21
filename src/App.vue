<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
// #ifdef H5
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'
// #endif

onLaunch(async (ctx) => {
  useAuthStore().getOpenIdAction()
  // useAuthStore().getJSApiTicketAction(
  //   '85_97ynbvbnGvxvfXgSvOZPEFZbrOH3pKAph3EejJksGOAWAavcpHlg7efWscr6_nFCSqDsDe0L8Pho_iLb57EQp9SioU_VyuymLMJEgdsDXHM'
  // )
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
