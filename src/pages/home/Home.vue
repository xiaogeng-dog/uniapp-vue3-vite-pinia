<template>
  <view class="home-container">
    <!-- <van-nav-bar safe-area-inset-top /> -->
    <view class="top-content">
      <view class="flex items-center justify-center gap-5 mt-5">
        <van-image class="image-container" :src="logo" />
        <view class="">共建 共治 共享</view>
        <view class="image-container" />
      </view>

      <view class="top-content-title">
        <view>随手拍 邀您参与城市治理</view>
      </view>
      <view class="top-content-subtitle">
        <view>美丽常州 | 你我共创</view>
      </view>
    </view>
    <view class="center-content">
      <view v-for="menuCard in menuCardList" :key="menuCard.title" class="custom-card">
        <view class="card-left-content">
          <view class="card-title">{{ menuCard.title }}</view>
          <view class="card-subtitle">{{ menuCard.subtitle }}</view>
          <view v-if="menuCard.btnList && menuCard.btnList.length">
            <van-button color="#d0ddfa" round size="small" @click="handleGoTo(menuCard)">
              <van-swipe
                vertical
                class="notice-swipe"
                :autoplay="4000"
                :touchable="false"
                :show-indicators="false"
              >
                <van-swipe-item v-for="(btn, index) in menuCard.btnList" :key="index">
                  {{ btn }}
                </van-swipe-item>
              </van-swipe>
            </van-button>
          </view>
        </view>
        <van-image class="card-image-container" :src="menuCard.image" />
      </view>
      <view class="custom-card">
        <view v-for="submenu in submenuCardList" :key="submenu.title" class="submenu-content">
          <van-image class="card-image-container2" :src="submenu.image" />
          <view class="submenu-content-title">{{ submenu.title }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type MenuCard from '@/model/MenuCard.d.ts'

const router = useRouter()

const menuCardList = ref<MenuCard[]>([
  {
    title: '公众上报',
    subtitle: '随手拍邀请你参与公众上报',
    router: 'PublicReport',
    btnList: ['立即上报', '拍一拍'],
    image: new URL('@/static/images/home/logo1.png', import.meta.url).href
  },
  {
    title: '我的上报',
    subtitle: '查看我的上报',
    router: 'ReportListMine',
    btnList: ['立即查看'],
    image: new URL('@/static/images/home/logo2.png', import.meta.url).href
  }
])

const submenuCardList = ref<MenuCard[]>([
  {
    title: '有事随手办',
    router: '',
    image: new URL('@/static/images/home/Group 102.png', import.meta.url).href
  },
  {
    title: '有事议一议',
    router: '',
    image: new URL('@/static/images/home/Group 104.png', import.meta.url).href
  },
  {
    title: '有事查一查',
    router: '',
    image: new URL('@/static/images/home/Group 107.png', import.meta.url).href
  },
  {
    title: '有事催一催',
    router: '',
    image: new URL('@/static/images/home/Group 109.png', import.meta.url).href
  }
])

const logo = new URL('@/static/images/home/ai.png', import.meta.url).href

/**
 * 跳转至路由演示页面
 */
function handleGoTo(doNavi) {
  console.log(doNavi)
  router.push({ name: doNavi.router })
}
</script>

<style lang="less" scoped>
.home-container {
  /* px-to-viewport-ignore */
  /* px-to-viewport-ignore */
  position: relative;

  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  width: 100vw;
  box-sizing: border-box;
  background: #f0f3fe;

  .top-content {
    position: fixed;
    top: 0px;
    width: 100vw;
    height: 370px;
    background: url('~@/static/images/home/top-bg.png') no-repeat;
    background-size: 100% 100%;

    color: #f9f9f9;
    font-weight: bold;
    font-size: 39rpx;

    .top-content-title,
    .top-content-subtitle {
      display: flex;
      justify-content: center;

      margin-top: 35px;

      font-family: 'REEJI';
      font-size: 45rpx;
    }
    .top-content-subtitle {
      margin-top: 5px;

      color: #ffffff;
      font-family: 'PingFang';
      font-weight: normal;
      font-size: 34rpx;
    }

    .image-container {
      width: 100rpx;
      height: 140rpx;
    }
  }
  .center-content {
    position: absolute;
    top: 220px;

    width: 100vw;
    height: calc(100% - 220px);
    overflow-y: auto;

    display: flex;
    align-items: center;
    gap: 12px;
    flex-direction: column;

    .custom-card {
      width: 345px;
      min-height: 110px;
      background: #f9f9f9;
      border-radius: 16px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding-left: 25px;
      .card-left-content {
        --van-button-round-radius: 13px;
        --van-button-small-height: 26px;
        .card-title {
          font-family: 'SourceHanSansSC';
          color: #333;
          font-size: 38rpx;
          font-weight: bold;
        }
        .card-subtitle {
          margin-top: 8px;
          font-family: 'PingFang';
          color: #43506288;
          font-size: 28rpx;
          font-weight: 400;
        }

        .notice-swipe {
          height: 26px;
          line-height: 26px;
          color: #396fff;
        }
      }

      .card-image-container {
        width: 119px;
        height: 98px;
      }

      .submenu-content {
        display: grid;
        grid-template-columns: repeat(1fr);
        grid-gap: 10px;
        justify-items: center;

        .card-image-container2 {
          width: 36px;
          height: 33px;
        }
        .submenu-content-title {
          // font-family: 'PingFang';
          // font-weight: 500;
          // font-family: 'PingFang';
          font-size: 26rpx;
          // color: #333333;
        }
      }
    }
  }
  .custom-card:last-child {
    padding: 0 8px;
  }
}
</style>
