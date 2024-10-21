<template>
  <view class="pl-container">
    <van-tabs swipeable animated sticky>
      <van-tab title="事件详情">
        <van-cell-group title="基础信息" border inset>
          <van-cell title="事件编号" :value="detailInfo.caseNo" />
          <van-cell title="所属大类" :value="detailInfo.largeName" />
          <van-cell title="事件状态" :value="detailInfo.status">
            <template #value>
              <van-tag size="medium" :type="detailInfo.status == 0 ? 'primary' : 'success'">
                {{ detailInfo.status == 0 ? '处置中' : '已办结' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="事件地址" :value="detailInfo.address">
            <template #value>
              <van-text-ellipsis
                rows="1"
                :content="detailInfo.address"
                expand-text="展开"
                collapse-text="收起"
              />
            </template>
          </van-cell>
          <van-cell title="事件详情" :value="detailInfo.question">
            <template #value>
              <van-text-ellipsis
                rows="1"
                :content="detailInfo.question"
                expand-text="展开"
                collapse-text="收起"
              />
            </template>
          </van-cell>
        </van-cell-group>
        <van-cell-group v-if="spotImage && spotImage.length" title="现场照片" border inset>
          <van-cell
            v-for="(img, index) in spotImage"
            :key="index"
            :label="img.createTime"
            :title="img.uploadName"
          >
            <template #value>
              <van-image
                class="image-content"
                :src="img.filePath"
                @click="handleOpenCurtain(img.filePath)"
              />
            </template>
          </van-cell>
        </van-cell-group>
        <van-cell-group v-if="disposalImage && disposalImage.length" title="处置照片" border inset>
          <van-cell
            v-for="(img, index) in disposalImage"
            :key="index"
            :label="img.createTime"
            :title="img.uploadName"
          >
            <template #value>
              <van-image
                class="image-content"
                :src="img.filePath"
                @click="handleOpenCurtain(img.filePath)"
              />
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab title="处理流程">
        <van-cell-group title="受理进度" border inset>
          <van-cell>
            <template #title>
              <van-steps direction="vertical" :active="currentSteps.length - 1">
                <van-step v-for="(step, index) in currentSteps" :key="index">
                  <view class="step-header">
                    <view class="step-title">{{ step.createTime }}</view>
                    <van-tag color="#6276f411" size="large " text-color="#6276F4">
                      <view class="step-subtitle">{{ step.eventNode }}</view>
                    </van-tag>
                  </view>

                  <view class="step-cell-cus">
                    <view class="step-cell-content">处置时间： {{ step.startTime }}</view>
                    <view class="step-cell-content">处置结束时间： {{ step.endTime }}</view>
                    <view class="step-cell-content">操作： {{ step.operate }}</view>
                    <view class="step-cell-content">执行人员： {{ step.disposerName }}</view>
                    <view class="step-cell-content">处理意见： {{ step.processOpinion }}</view>
                    <view
                      v-if="step.pictureList && step.pictureList.length"
                      class="step-cell-content"
                    >
                      <van-image
                        v-for="(img, index) in step.pictureList"
                        :key="index"
                        class="image-content"
                        :src="img.filePath"
                        @click="handleOpenCurtain(img.filePath)"
                      />
                    </view>
                  </view>
                </van-step>
              </van-steps>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
    </van-tabs>

    <van-toast />
    <van-notify />
  </view>
</template>

<script setup lang="ts">
import { showImagePreview } from 'vant'
const router = useRouter()
const route = useRoute()

const detailInfo = reactive<any>({})

const spotImage = computed<any[]>(() => {
  return detailInfo.registerMaterials.filter((item) => {
    return !item.processId
  })
})

const disposalImage = computed<any[]>(() => {
  return detailInfo.registerMaterials.filter((item) => {
    return item.processId
  })
})

const currentSteps = computed<any[]>(() => {
  let filterProcess =
    detailInfo.eventProcessList.filter((item) => {
      return item.eventNode == '受理' || item.eventNode.includes('处置单位')
    }) || []
  if (filterProcess.length > 1) {
    filterProcess = [filterProcess.shift(), filterProcess.pop()]
  }
  filterProcess.forEach((element) => {
    element.pictureList =
      detailInfo?.registerMaterials?.filter((mItem) => mItem.processId == element.id) || []
  })
  return filterProcess
})

const handleOpenCurtain = (url: string) => {
  showImagePreview({
    images: [url],
    closeable: true
  })
}

onMounted(async () => {
  const { params } = route
  const originData = JSON.parse(decodeURIComponent(params?.formatData))
  Object.assign(detailInfo, originData)
})

function handleClickLeft(isRefresh = false) {
  router.back()
  console.log('关闭页面')
  if (isRefresh) {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    if (pages[pages.length - 2].route == 'package/pages/TaskList/TaskList') {
      //确定要返回到相应页面，在触发
      prevPage.$vm.fabClick()
    }
  }
}
</script>

<style lang="less" scoped>
.pl-container {
  width: 100%;
  height: 100%;
  .image-content {
    width: 50px;
    height: 50px;
  }
  .step-header {
    // display: flex;
    // flex-direction: column;
    // justify-content: space-between;
    margin-bottom: 10px;

    .step-title {
      font-family: DINAlternate, DINAlternate;
      font-weight: bold;
      font-size: 15px;
      color: #6276f4;

      text-align: left;
      font-style: normal;

      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      margin-bottom: 5px;
    }
    .step-subtitle {
      // font-size: 12px;
    }
  }

  .step-cell-cus {
    background: rgba(98, 118, 244, 0.07);
    border-radius: 8px;

    .step-cell-content {
      padding: 10px 15px;

      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 13px;
      color: #333333;

      text-align: left;
      font-style: normal;
    }

    & > div {
      background: none;
    }
  }
}
</style>
