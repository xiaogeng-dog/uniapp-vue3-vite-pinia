<template>
  <div class="report-container">
    <view id="amap-container" class="map" />
    <view class="w-full">
      <van-notice-bar color="#1989fa" background="#ecf9ff" left-icon="info-o">
        <van-swipe
          vertical
          style="height: 40px; line-height: 40px"
          :autoplay="3000"
          :touchable="false"
          :show-indicators="false"
        >
          <van-swipe-item>请根据以下问题类型进行随手拍</van-swipe-item>
          <van-swipe-item>更多类型陆续上线中</van-swipe-item>
        </van-swipe>
      </van-notice-bar>
    </view>
    <view class="center-content">
      <view class="custom-card p-1">
        <van-search
          v-model="checkForm.address"
          shape="round"
          readonly
          background="#fff"
          placeholder="请输入搜索关键词"
        />
      </view>
      <view class="custom-card">
        <van-radio-group v-model="checkForm.smallId" @change="handleChangeSmall">
          <van-swipe :loop="false" indicator-color="#00bae6">
            <van-swipe-item v-for="(submenuArr, index) in submenuCardList" :key="index">
              <view class="custom-card-swipe">
                <view v-for="submenu in submenuArr" :key="submenu.code" class="submenu-content">
                  <van-radio class="w-full h-full" :name="submenu.code">
                    <template #default="{ checked }">
                      <view
                        class="flex flex-col items-center gap-2"
                        :class="checked ? 'radio-click' : ''"
                      >
                        <van-image class="card-image-container2" :src="submenu.image" />
                        <view class="submenu-content-title">{{ submenu.title }}</view>
                      </view>
                    </template>
                    <template #icon />
                  </van-radio>
                </view>
              </view>
            </van-swipe-item>
          </van-swipe>
        </van-radio-group>
      </view>
      <view class="w-11/12">
        <van-button size="large" round type="primary" @click="handleGoTo">下一步</van-button>
      </view>
    </view>

    <van-toast />
    <van-notify />
  </div>
</template>

<script setup lang="ts">
import { handleFilingAndConditionApi } from '@/api/patrol/TaskReport'
import AmapViewMarker from '@/hooks/amap/AmapViewMarker'
const router = useRouter()
import { showFailToast, showLoadingToast, showDialog, allowMultipleToast } from 'vant'
allowMultipleToast()
import type MenuCard from '@/model/MenuCard.d.ts'

onMounted(() => {
  handleInitMap()
  let system = uni.getSystemInfoSync() // 获取系统信息
  console.log('🚀 ~ onMounted ~ system:', system, uni)
})

let amapInstance = ref()
let checkForm = reactive<any>({})

const submenuCardList = ref<MenuCard[][]>([
  [
    {
      title: '住宅小区',
      code: 2778,
      image: new URL('@/static/images/publicReport/icon5.png', import.meta.url).href
    },
    {
      title: '市容环境',
      code: 2779,
      image: new URL('@/static/images/publicReport/icon3.png', import.meta.url).href
    },
    {
      title: '菜市场',
      code: 2788,
      image: new URL('@/static/images/publicReport/icon8.png', import.meta.url).href
    },
    {
      title: '城中村',
      code: 2789,
      image: new URL('@/static/images/publicReport/icon10.png', import.meta.url).href
    },
    {
      title: '河道管理',
      code: 2790,
      image: new URL('@/static/images/publicReport/icon12.png', import.meta.url).href
    },
    {
      title: '垃圾分类',
      code: 2791,
      image: new URL('@/static/images/publicReport/icon14.png', import.meta.url).href
    },
    {
      title: '街面秩序',
      code: 2782,
      image: new URL('@/static/images/publicReport/icon9.png', import.meta.url).href
    },
    {
      title: '园林绿化',
      code: 2128,
      image: new URL('@/static/images/publicReport/icon11.png', import.meta.url).href
    }
  ],
  [
    {
      title: '交通秩序',
      code: 2780,
      image: new URL('@/static/images/publicReport/icon13.png', import.meta.url).href
    },
    {
      title: '施工管理',
      code: 2781,
      image: new URL('@/static/images/publicReport/icon15.png', import.meta.url).href
    },
    {
      title: '宣传广告',
      code: 2792,
      image: new URL('@/static/images/publicReport/icon16.png', import.meta.url).href
    }
  ]
])

watch(
  () => checkForm,
  (newVal) => {
    console.log(newVal)
  }
)

function handleInitMap() {
  if (!amapInstance.value) initMap()
}

function initMap() {
  amapInstance.value = new AmapViewMarker('amap-container', false, async () => {
    uni.getLocation({
      type: 'gcj02',
      geocode: true,
      success: (res) => {
        console.log('当前位置的经度：' + res.longitude)
        console.log('当前位置的纬度：' + res.latitude)
        handleLocation()
        // var amap = require('../../utils/amap-wx.130.js')
        // var amapPlugin = new amap.AMapWX({
        //   key: 'b1e92b7823f3c346a1354ed2b2e07b2e'
        // })
        // amapPlugin.getRegeo({
        //   location: '' + res.longitude + ',' + res.latitude + '', //location的格式为'经度,纬度'
        //   success: (data) => {
        //     console.log('data', data)
        //     this.formData = {
        //       ...this.formData,
        //       address: data[0].name,
        //       latitude: res.latitude,
        //       longitude: res.longitude
        //     }
        //     this.handleStreetList(data[0]?.regeocodeData?.addressComponent?.district)
        //   },
        //   fail: function (info) {
        //     console.log('获取详细地址', info)
        //   }
        // })
      },
      fail: (res) => {
        console.log('fail', res)
        getSetting()
      }
    })
  })
}

async function handleLocation() {
  const addressObj = await amapInstance.value.getLocation()
  if (addressObj.formattedAddress) {
    Object.assign(checkForm, {
      address: addressObj.formattedAddress,
      longitude: addressObj.position.lng,
      latitude: addressObj.position.lat,
      district: addressObj.addressComponent.district
    })
  }
}

const handleChangeSmall = async (name) => {
  const loadingTost = showLoadingToast({ message: '加载中...' })
  let params = {
    bigId: 2125,
    smallId: name,
    filingName: '其他'
  }
  try {
    const res = await handleFilingAndConditionApi(params)
    if (res.code == 200) {
      Object.assign(checkForm, {
        ...res.data,
        timeType: res.data?.type,
        filingId: res.data?.filingNameId
      })
    } else {
      showFailToast({
        message: '立案条件获取异常~',
        duration: 2000
      })
    }
  } finally {
    loadingTost.close()
  }
}

//用户拒绝开启定位后-引导用户手动开启定位
// 1.获取设置信息-用户权限列表
function getSetting() {
  uni.getSetting({
    success: (res) => {
      console.log('用户权限列表:', res.authSetting)
      if (res.authSetting['scope.userLocation']) {
        console.log('已授权userLocation')
        handleLocation()
        // 选择位置信息
      } else {
        console.log('用户未授权userLocation')
        //2.用户第一次进来发起授权
        uni.showModal({
          title: '提示',
          content: '当前定位未开启，请点击确定手动开启定位',
          duration: 3000,
          success: (res) => {
            if (res.confirm) {
              openSetting() //点击确定引导客户开启定位
            } else if (res.cancel) {
              uni.showToast({
                title: '你拒绝了授权，无法获取定位信息',
                duration: 2000,
                icon: 'none'
              })
            }
          }
        })
      }
    }
  })
}
// 4.打开设置
function openSetting() {
  uni.openSetting({
    success: (res) => {
      if (res.authSetting['scope.userLocation']) {
        // 5.用户在设置中点击了允许，调用选择位置信息函数
        handleLocation()
      } else {
        // 5.用户在设置中点击了不允许，展示拒绝授权信息
        uni.showToast({
          title: '你拒绝了授权，无法操作内容',
          icon: 'none',
          duration: 3000
        })
      }
    },
    fail: (err) => {
      console.log('打开设置失败', err)
    }
  })
}
function handleGoTo() {
  if (!(checkForm.smallId && checkForm.filingId)) {
    return showDialog({
      title: '提示',
      message: `请选择大小类！`,
      theme: 'round-button',
      confirmButtonText: '我知道了'
    })
  }
  router.push({
    name: 'PublicReportForm',
    params: {
      formatData: JSON.stringify(checkForm)
    }
  })
}
</script>

<style lang="less" scoped>
.radio-click {
  box-shadow: inset 0px 0px 20px 0px rgba(100, 170, 246, 0.5);
  border-radius: 6px;
  border-image: linear-gradient(180deg, rgba(115, 174, 255, 0), rgba(86, 129, 255, 1)) 1 1;
}
:deep(.van-field__control) {
  font-size: 15px;
}
:deep(.van-radio__label) {
  width: 100%;
  height: 100%;
}

.report-container {
  --van-search-content-background: #fff;
  --van-search-label-font-size: 50px;
  --van-cell-font-size: 50px;

  --van-radio-label-margin: 0;
  width: 100%;
  height: 100vh;

  display: flex;
  flex-direction: column;

  #amap-container {
    flex: 1;
  }
  .center-content {
    height: 370px;

    width: 100vw;

    overflow-y: auto;

    display: flex;
    align-items: center;
    gap: 20px;
    flex-direction: column;

    box-sizing: border-box;
    padding-bottom: 10px;

    z-index: 999;

    .custom-card {
      width: 345px;
      // min-height: 110px;
      background: #fff;
      border-radius: 16px;

      .custom-card-swipe {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        // grid-gap: 18px;
        // grid-column-gap: 18px;
        grid-row-gap: 25px;
        justify-items: center;
        box-sizing: border-box;
        padding: 15px 8px 25px;
      }

      .submenu-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        width: 100%;
        height: 100%;
        .card-image-container2 {
          width: 36px;
          height: 33px;
        }
        .submenu-content-title {
          font-family: 'PingFang';
          font-weight: 500;
          font-weight: 600;
          font-size: 26rpx;
          color: #333333;
        }
      }
    }
  }
}
</style>
