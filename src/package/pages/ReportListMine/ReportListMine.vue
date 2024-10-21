<template>
  <view class="pl-container">
    <!-- 空值占位 -->
    <view v-show="isShowEmpty" class="empty-tooltip">
      <van-empty image="search" description="查无结果" />
    </view>

    <view class="top-search">
      <view class="search-tabs">
        <van-tabs v-model:active="searchForm.evaluation" sticky @change="fabClick()">
          <van-tab title="处置中" :name="0" />
          <van-tab title="已办结" :name="2" />
        </van-tabs>
      </view>
      <view class="search-icon">
        <van-icon name="list-switch" dot size="25" @click="handleOpenSearch" />
      </view>
    </view>
    <van-pull-refresh
      v-show="!isShowEmpty"
      v-model="triggered"
      class="center-content"
      success-text="刷新成功"
      @refresh="onPullDownRefresh"
    >
      <van-list
        v-model:loading="isLoading"
        v-model:error="loadError"
        class="content-container"
        error-text="请求失败，点击重新加载"
        :finished="status"
        :loading-text="loadingText"
        :finished-text="noMoreText"
        @load="onReachBottom"
      >
        <template v-for="(taskInfo, index) in taskListInfo" :key="index">
          <view class="custom-card">
            <view class="card-content">
              <van-swipe indicator-color="white">
                <van-swipe-item v-for="(image, index) in taskInfo.registerMaterials" :key="index">
                  <van-image class="image-content" :src="image.filePath" />
                </van-swipe-item>
                <template #indicator="{ active, total }">
                  <div class="cover-content">{{ taskInfo.largeName }}</div>
                  <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
                </template>
              </van-swipe>

              <view>
                <van-cell-group>
                  <van-cell title="事件编号：" :value="taskInfo.caseNo" />
                  <van-cell title="事件地址：">
                    <template #value>
                      <van-text-ellipsis
                        rows="1"
                        :content="taskInfo.address"
                        expand-text="展开"
                        collapse-text="收起"
                      />
                    </template>
                  </van-cell>

                  <van-cell title="事件时间：" :value="taskInfo.startTime" />
                  <van-cell title="事件详情：">
                    <template #value>
                      <van-text-ellipsis
                        rows="1"
                        :content="taskInfo.question"
                        expand-text="展开"
                        collapse-text="收起"
                      />
                    </template>
                  </van-cell>
                  <van-cell>
                    <template #value>
                      <van-button
                        round
                        plain
                        size="mini"
                        type="primary"
                        icon="more-o"
                        @click="handleGoTo(taskInfo)"
                      >
                        详情
                      </van-button>
                    </template>
                  </van-cell>
                </van-cell-group>
              </view>
            </view>
          </view>
        </template>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model:show="popoverShow" class="search-pop" position="top">
      <!-- <van-dropdown-menu>
        <van-dropdown-item ref="dropdownRef" title="时间">

        </van-dropdown-item>
      </van-dropdown-menu> -->
      <van-calendar
        ref="calendarRef"
        title="时间选择"
        switch-mode="year-month"
        :poppable="false"
        type="range"
        :default-date="dataDefault"
        :show-confirm="false"
        :style="{ height: '1000rpx' }"
        @confirm="(e) => handleCalendar(e)"
      />
      <view class="pop-btn-list">
        <van-icon name="certificate" size="35" />
        <van-button class="pop-btn" @click="handleResetCalendar">重置</van-button>
        <van-button class="pop-btn" type="primary" @click="fabClick()">确定</van-button>
      </view>
    </van-popup>
    <van-toast />
  </view>
</template>

<script setup lang="ts">
import { CalendarInstance } from 'vant'
// import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { handleGetList } from '@/api/patrol/ReportListMine'

import moment from 'moment'

import { showLoadingToast, showFailToast, allowMultipleToast } from 'vant'
allowMultipleToast()
const router = useRouter()
/**
 * 选择菜单
 */
const popoverShow = ref<boolean>(false)
const calendarRef = ref<CalendarInstance>()

let isShowEmpty = ref(true)
let searchForm = reactive<any>({
  // evaluation: 0,
  startTime: '',
  endTime: ''
})
let currentPage = ref(1)
let currentSize = ref(3)
let total = ref(0)
let isLoading = ref(false)
let taskListInfo = ref<any[]>([])

//下拉刷新
const triggered = ref<boolean>(false)

let status = ref<boolean>(false)
let loadError = ref<boolean>(false)
let loadingText = '玩命加载中>.<'
let noMoreText = '-我是有底线的-'

onMounted(() => {
  handleGetDataList()
  // isShowEmpty.value = false
})

const dataDefault = computed<Date | Date[] | null>(() => {
  if (searchForm.startTime && searchForm.endTime) {
    return [moment(searchForm.startTime).toDate(), moment(searchForm.endTime).toDate()]
  } else {
    return null
  }
})

/**
 * 接口
 */
// 获取列表数据
const handleGetDataList = async (callBack?: () => any) => {
  popoverShow.value = false
  let params = {
    pageNo: currentPage.value,
    pageSize: currentSize.value,
    problemOrigin: 201,
    ...searchForm
  }
  const loadingToast = showLoadingToast({ message: '加载中...' })

  try {
    const res = await handleGetList(params)
    // 只要数据请求完毕，就立即按需调用 cb 回调函数
    callBack && callBack()
    if (res.code == 200) {
      if (res.data.records.length > 0) {
        total.value = res.data.total
        if (total.value == 0) {
          isShowEmpty.value = true
        } else {
          isShowEmpty.value = false
        }
        taskListInfo.value = [...taskListInfo.value, ...res.data.records]
      }
    } else {
      loadError.value = true
      showFailToast({ duration: 2000, message: '获取失败~' })
    }
  } catch {
    loadError.value = true
    showFailToast({ duration: 2000, message: '获取失败~' })
  } finally {
    isLoading.value = false
    triggered.value = false
    loadingToast.close()
    callBack && callBack()
  }
}
/**
 *  业务
 */
// 跳转详情
const actionsClick = (id: string) => {
  router.push({ name: 'PatrolDetail', params: { id } })
}

const fabClick = () => {
  currentPage.value = 1
  total.value = 0
  taskListInfo.value = []

  handleGetDataList()
  isShowEmpty.value = true
}

// 触底的事件
const onReachBottom = () => {
  console.log(1111111111)
  // 判断是否还有下一页数据
  if (currentPage.value * currentSize.value >= total.value) return (status.value = true)
  // 判断是否正在请求其它数据，如果是，则不发起额外的请求
  // 让页码值自增 +1
  currentPage.value += 1
  // 重新获取列表数据
  handleGetDataList()
}

// 下拉刷新的事件
const onPullDownRefresh = () => {
  // 1. 重置关键数据
  currentPage.value = 1
  total.value = 0
  // isLoading.value = true
  taskListInfo.value = []
  status.value = false
  // 2. 重新发起请求
  // handleGetDataList(() => uni.stopPullDownRefresh())
  handleGetDataList()
}

const handleOpenSearch = () => {
  popoverShow.value = true
}

const handleCalendar = (value?: any[]) => {
  console.log('🚀 ~ handleCalendar ~ value:', value)
  if (value && value.length) {
    searchForm.startTime = moment(value[0]).format('YYYY-MM-DD HH:mm:ss')
    searchForm.endTime = moment(value[1]).format('YYYY-MM-DD HH:mm:ss')
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
}
const handleResetCalendar = () => {
  calendarRef.value?.reset()
  handleCalendar()
}

function handleGoTo(checkForm) {
  router.push({
    name: 'TaskDetail',
    params: {
      formatData: JSON.stringify(checkForm)
    }
  })
}

function handleClickLeft() {
  router.back()
}
</script>

<style lang="less" scoped>
:deep(.van-cell__value) {
  // width: 60%;
  // flex: auto;
}
.custom-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  margin: 0px auto 15px;
  // padding: 15px;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.02);

  .card-content {
    .image-content {
      width: 100%;
      height: 150px;
    }
  }
  .custom-indicator {
    position: absolute;
    right: 5px;
    bottom: 5px;
    padding: 2px 5px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
  }
  .cover-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;

    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 15px;
    font-size: 14px;
    color: #4476fb;

    /* 设置一个半透明的背景色，可选 */
    background-color: rgba(255, 255, 255, 0.1);

    /* 应用模糊效果 */
    backdrop-filter: blur(10px);
  }
}
.pl-container {
  width: 100%;
  height: 100vh;

  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #f7f8fa;

  display: flex;
  flex-direction: column;

  .empty-tooltip {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .top-search {
    width: 100%;
    background-color: #ffffff;

    display: flex;
    align-items: center;

    .search-tabs {
      flex: 1;
    }
    .search-icon {
      width: 40px;
    }
  }
  .center-content {
    flex: 1;
    overflow-y: auto;

    box-sizing: border-box;
    padding: 15px;
  }
  .search-pop {
    padding: 15px 10px;

    .pop-btn-list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      .pop-btn {
        flex: 1;
      }
    }
  }
}
</style>
