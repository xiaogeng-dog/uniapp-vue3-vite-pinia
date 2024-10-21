<template>
  <view class="map-box">
    <MapPoint
      :key="randomKey"
      :mapKey="mapKey"
      :Radius="Radius"
      :showResetting="showResetting"
      :listIco="listIco"
      :orientationIco="orientationIco"
      :resettingIco="resettingIco"
      :configData="configData"
      @commitCheck="commitCheck"
    />
  </view>
</template>

<script lang="ts" setup>
import mapPoint from './components/map-Point.vue'
const { configData } = storeToRefs(useAuthStore()) // 解构pinia的store
import { onShow } from '@dcloudio/uni-app'
const mapKey = '8b4fc4deb8de5c15a296415440cf43ae'
const address = ''
const latitude = ''
const longitude = ''
const listIco = new URL('./components/static/item-inx.png', import.meta.url).href
const orientationIco = new URL('./components/static/map-inx.png', import.meta.url).href
const resettingIco = new URL('./components/static/position.png', import.meta.url).href
const showResetting = true
const Radius = ''

const randomKey = ref(Math.random())

const router = useRouter()

onShow(() => {
  console.log(randomKey.value)
  randomKey.value = Math.random()
})

const commitCheck = (e) => {
  console.log(e, 565)
  uni.$emit('commitCheck', e)
  router.back()
  // uni.navigateBack({
  //   delta: 1
  // })
}
</script>

<style lang="less" scoped>
.map-box {
  height: calc(100% - 88rpx);
  width: 100vw;
}
</style>
