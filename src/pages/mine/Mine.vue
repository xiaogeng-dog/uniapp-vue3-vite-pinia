<template>
  <view>
    <view class="mine">
      <view class="tools">
        <!-- <van-icon name="scan" size="48rpx" color="#292C39" @click="doScan" />
        <van-icon name="setting" size="48rpx" color="#292C39" /> -->
      </view>
      <view class="header">
        <view class="header-user">
          <image src="/static/images/home/avatar.jpg" class="header-user-avatar" />
          <view class="header-user-nickname">
            <view class="nickname">{{ userInfo?.name || '未绑定' }}🧑‍💻</view>
            <view class="info">{{ phoneNum }}</view>
          </view>
          <view class="header-user-more">
            <van-icon name="note" size="48rpx" color="#BEC0C7" />
          </view>
        </view>
      </view>
      <view class="main">
        <van-cell-group :border="false">
          <!-- <van-cell title="主题切换" icon="translate-bold" is-link @click="handleGoTo" /> -->
          <van-cell title="账号绑定" icon="translate-bold" is-link @click="handleGoTo('register')">
            <template #icon>
              <image src="../../static/images/me/lvhang.png" class="png" mode="aspectFit" />
            </template>
          </van-cell>
          <van-cell title="工具" icon="translate-bold" is-link @click="handleGoTo('tools')">
            <template #icon>
              <image src="../../static/images/me/lvhang.png" class="png" mode="aspectFit" />
            </template>
          </van-cell>
          <!-- <van-cell title="退出当前账号" @click="doLogout" icon="translate-bold" is-link /> -->
        </van-cell-group>
      </view>
    </view>
    <van-toast id="van-toast" />
    <van-dialog id="van-dialog" />
  </view>
</template>

<script lang="ts" setup>
// #ifdef H5
import { showToast, showConfirmDialog } from 'vant'
// #endif

const safeHeight = ref<number>(44)

const { userInfo } = storeToRefs(useAuthStore()) // 解构pinia的store
const router = useRouter()

const phoneNum = computed<string>(() => {
  let result = useAuthStore().userInfo?.mobile || ''
  if (result) {
    let reg = /^(1[3-9][0-9])\d{4}(\d{4}$)/ // 定义手机号正则表达式
    result = result.replace(reg, '$1****$2')
  }
  return result
})

const pic = [
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg1.jpeg',
    name: '春天'
  },
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg2.jpeg',
    name: '夏天'
  },
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg3.jpeg',
    name: '秋天'
  },
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg4.jpeg',
    name: '冬天'
  },
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg5.jpeg',
    name: '幽静'
  },
  {
    link: 'https://cdn.zhoukaiwen.com/zjx_me_bg6.jpg',
    name: '天空'
  }
]

const inter = [
  {
    title: 'mimicry',
    name: '活力春天',
    color: ''
  },
  {
    title: 'theme',
    name: '清爽夏日',
    color: ''
  },
  {
    title: 'theme',
    name: '金秋之韵',
    color: ''
  },
  {
    title: 'theme',
    name: '冬日之阳',
    color: ''
  },
  {
    title: 'theme',
    name: '幽兰星空',
    color: ''
  },
  {
    title: 'theme',
    name: '流星之夜',
    color: ''
  }
]

onMounted(() => {})
/**
 * 扫码
 */
function doScan() {
  uni.scanCode({
    success: (res) => {
      // 扫码内容
      const code: string = res.result || ''
      // #ifdef H5
      showToast(`扫码内容：${code}`)
      // #endif
    },
    fail(result) {}
  })
}

/**
 * 登出
 */
function doLogout() {
  // #ifdef H5
  showConfirmDialog({ title: '提示', message: '确认退出当前登录账号吗？' })
    .then(() => {
      // 点击的确认按钮
      useAuthStore().logout()
      router.replaceAll({ name: 'login' })
    })
    .catch((error) => {
      console.log(error)
    })
  // #endif
}

function handleGoTo(name) {
  useAuthStore().isJudgeRegister(false)
  router.push({ name })
}
</script>

<style lang="scss" scoped>
.mine {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  width: 100vw;
  box-sizing: border-box;
  // background: #e7f0ff;
  padding: 10px 24rpx 24rpx;

  .png {
    width: 20px;
    height: 20px;
    margin-right: 20px;
  }
  .tools {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32rpx;
    box-sizing: border-box;
    padding: 0 12rpx;
  }
  .header {
    width: 100%;
    background: url('https://cdn.zhoukaiwen.com/zjx_me_bg6.jpg') no-repeat;
    background-size: 100% 100%;
    border-radius: 16rpx;
    padding: 32rpx;
    box-sizing: border-box;
    margin-bottom: 24rpx;
    &-user {
      display: flex;
      margin-bottom: 120rpx;
      &-avatar {
        flex: 0 0 auto;
        border-radius: 50%;
        width: 128rpx;
        height: 128rpx;
        overflow: hidden;
      }
      &-nickname {
        flex: 1 1 auto;
        margin-left: 32rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .nickname {
          color: #fff;
          font-weight: 550;
          font-size: 32rpx;
          margin-bottom: 12rpx;
        }
        .info {
          color: #fff;
          font-size: 26rpx;
        }
      }
      &-more {
        flex: 0 0 auto;
        width: 48rpx;
      }
    }

    &-target {
      display: flex;
      &-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        .label {
          color: #292c39;
          font-size: 32rpx;
          font-weight: 550;
          margin-bottom: 24rpx;
        }
        .value {
          color: #3c3f49;
          font-size: 28rpx;
        }
      }
    }
  }
  .main {
    width: 100%;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 12rpx 12rpx;
    box-sizing: border-box;
  }
}
</style>
