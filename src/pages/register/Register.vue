<template>
  <div class="r-container">
    <van-form :model="postData" :rules="rules" validate-trigger="onSubmit" @submit="register">
      <van-cell-group inset>
        <van-field
          v-model.trim="postData.mobile"
          :rules="rules.mobile"
          name="mobile"
          type="tel"
          label="手机号"
          placeholder="手机号"
        />

        <van-field
          v-model.trim="postData.verifyCode"
          :rules="rules.verifyCode"
          name="verifyCode"
          type="digit"
          label="验证码"
          placeholder="验证码"
        >
          <template #button>
            <van-button
              v-if="mobileCodeTimer <= 0"
              size="small"
              type="primary"
              plain
              loading-text="获取中..."
              :loading="isGettingCode"
              @click="getCode"
            >
              获取验证码
            </van-button>
            <span v-if="mobileCodeTimer > 0" class="getMobileCode" style="cursor: pointer">
              {{ mobileCodeTimer }}s
            </span>
          </template>
        </van-field>

        <van-field
          v-model.trim="postData.name"
          :rules="rules.name"
          name="name"
          label="用户名"
          placeholder="用户名"
        />
      </van-cell-group>
      <view style="margin: 20px auto" class="w-11/12">
        <van-button :loading="loading" size="large" native-type="submit" round block type="primary">
          确认
        </van-button>
      </view>
    </van-form>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const userStore = useAuthStore()
const loading = ref(false)
const mobileCodeTimer = ref(0)
const isGettingCode = ref(false)

import { showNotify } from 'vant'

const postData = reactive({
  mobile: useAuthStore().userInfo?.mobile || '',
  verifyCode: '',
  name: useAuthStore().userInfo?.name || ''
})

const rules = reactive({
  mobile: [
    { required: true, message: '请输入手机号' },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: '请输入正确的手机号码'
    }
  ],
  verifyCode: [{ required: true, message: '请输入验证码' }],
  name: [{ required: true, message: '请输入用户名' }]
})

async function register() {
  try {
    loading.value = true
    let params = {
      id: useAuthStore().userInfo?.id || null,
      gender: 0,
      ...postData
    }
    const res = await userStore.register(params)

    if (res.code === 0) {
      showNotify({ type: 'success', message: '注册成功' })
      setTimeout(() => {
        router.replaceAll({ name: 'home' })
      }, 1000)
    } else {
      showNotify({ type: 'warning', message: res.msg || '注册失败' })
    }
  } finally {
    loading.value = false
  }
}

async function getCode() {
  if (!postData.mobile) {
    showNotify({ type: 'warning', message: '请输入手机号' })
    return
  }

  if (!postData.mobile.match(/^1[3456789]\d{9}$/)) {
    showNotify({ type: 'warning', message: '请输入正确的手机号码' })
    return
  }
  let params = {
    phone: postData.mobile
  }
  isGettingCode.value = true
  const res = await userStore.getCode(params)
  if (res.code === 0) {
    showNotify({ type: 'success', message: `短信发送成功` })
    // 设置倒计时
    mobileCodeTimer.value = 60
    let msgTimer = setInterval(() => {
      mobileCodeTimer.value = mobileCodeTimer.value - 1
      if (mobileCodeTimer.value <= 0) {
        clearInterval(msgTimer)
      }
    }, 1000)
  } else {
    showNotify({ type: 'danger', message: `短信发送失败` })
  }

  isGettingCode.value = false
}
</script>

<style lang="less" scoped>
.r-container {
  width: 100vw;
  height: 100vh;

  padding-top: 20px

  // display: flex;
  // flex-direction: column;
  // align-items: center;
}
</style>
