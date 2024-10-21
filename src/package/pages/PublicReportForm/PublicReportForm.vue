<template>
  <div class="report-container">
    <van-form ref="formRef" required="auto">
      <van-cell-group inset title="信息填报" border>
        <van-field v-model="checkForm.address" readonly label="事件地址" />
        <van-field v-model="checkForm.district" readonly label="所属区域" />
        <van-field
          v-model="streetName"
          is-link
          readonly
          name="picker"
          label="所在街道"
          placeholder="请选择街道"
          @click="showPicker = true"
        />
        <van-field
          v-model="checkForm.question"
          type="textarea"
          maxlength="500"
          show-word-limit
          autosize
          label="事件描述"
          placeholder="请输入"
          :rules="[{ required: true, message: '请填写事件描述' }]"
        />
        <van-field label="文件上传">
          <template #input>
            <cus-uploader
              v-model="checkForm.imgList"
              :options="{ fileType: '现场照片', eventNode: '受理', userId: 14248, caseNo: '' }"
              :limit="5"
              :actionUrl="MAIN_BASE_URL + 'openApi/upload'"
            />
          </template>
        </van-field>
      </van-cell-group>
      <view style="margin: 16px" class="w-11/12">
        <van-button
          size="large"
          :loading="btnLoading"
          loading-text="提交中..."
          round
          type="primary"
          @click="handleReport"
        >
          提交
        </van-button>
      </view>
    </van-form>

    <van-toast />
    <van-notify />
    <van-popup
      v-model:show="showPicker"
      round
      position="bottom"
      style="padding: 4px 0; padding-bottom: 20px"
    >
      <van-search v-model="filterKey" show-action clearable shape="round" placeholder="输入街道">
        <template #action>
          <view style="color: #0089f9" @click="handleFilter">搜索</view>
        </template>
      </van-search>
      <!-- <van-search
        style="width: 100%; display: block"
        value="{{ UserNameIndexes }}"
        placeholder="请输入用户名"
        use-action-slot
        bind:change="setUserNameIndexes"
        bind:search="UserVague"
      >
        <view slot="action" bind:tap="UserVague" style="color: #1296db">搜索</view>
      </van-search>
      <van-empty description="无数据" v-if="streetList.length" /> -->
      <van-picker
        v-model="checkForm.street"
        :columns-field-names="{ text: 'name', value: 'id', children: 'children' }"
        :columns="streetList"
        :show-toolbar="true"
        toolbar-position="bottom"
        @confirm="onConfirmPicker"
        @cancel="showPicker = false"
      >
        <template #toolbar>
          <view style="margin: 0 auto" class="w-11/12">
            <van-button size="large" round type="primary" @click="onConfirmPicker">
              确 定
            </van-button>
          </view>
        </template>
      </van-picker>
    </van-popup>
  </div>
</template>

<script setup lang="ts" name="PublicReportForm">
import { handleSubmit, handleGetList } from '@/api/patrol/TaskReport'
import cusUploader from '@/hooks/components/CusUploader/CusUploader.vue'

import { MAIN_BASE_URL } from '@/http/config'
const router = useRouter()
const route = useRoute()

import {
  showDialog,
  showNotify,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  allowMultipleToast
} from 'vant'
allowMultipleToast()
onMounted(async () => {
  const { params } = route
  console.log('🚀 ~ onMounted ~ route:', route, decodeURIComponent(params?.formatData))
  const originData = JSON.parse(decodeURIComponent(params?.formatData))
  Object.assign(checkForm, originData)
  if (originData && originData.district) {
    handleStreetList(originData.district)
  } else {
    return showDialog({
      title: '提示',
      message: `请选择您的上报地址`,
      theme: 'round-button',
      confirmButtonText: '返回'
    }).then(() => {
      // on close
      handleClickLeft()
    })
  }
})

// 表单实例
const formRef = ref()
const showPicker = ref(false)
const btnLoading = ref(false)
let streetName = ref('')
let filterKey = ref('')

let checkForm = reactive<any>({})

const localDistrictCodeList = ref([
  { key: 3824, name: '天宁区' },
  { key: 3824, name: '秦淮区' },
  { key: 3824, name: '鼓楼区' },
  { key: 3824, name: '建邺区' },
  { key: 4015, name: '钟楼区' },
  { key: 4115, name: '新北区' },
  { key: 4355, name: '武进区' },
  { key: 4758, name: '经开区' },
  { key: 4906, name: '金坛区' },
  { key: 5196, name: '溧阳市' }
])
let streetListOrigin = ref([])
let streetList = ref([])

const onConfirmPicker = () => {
  const selectData: any = streetListOrigin.value.find((ele: any) => ele.id == checkForm.street[0])
  streetName.value = selectData?.name || ''
  showPicker.value = false
}

const handleFilter = () => {
  streetList.value = streetListOrigin.value.filter((ele: any) =>
    ele.name.toLowerCase().includes(filterKey.value)
  )
}

const handleReport = async () => {
  formRef.value
    .validate()
    .then(async () => {
      let params = {
        ...checkForm,
        street: Array.isArray(checkForm.street) ? checkForm.street[0] : checkForm.street,
        userCheck: false,
        userId: 14248,
        problemOrigin: 201,
        largeId: 2125
      }
      if (!params.imgList || !params.imgList.length) {
        return showNotify({
          type: 'warning',
          message: '请上传现场图片',
          zIndex: 999
        })
      }

      console.log(params)
      if (params.imgList && params.imgList.length) {
        params.fileIds = params.imgList
          .map((ele: any) => {
            if (ele.id) {
              return ele.id
            }
          })
          .join()
      }
      delete params.imgList

      const loadingToast = showLoadingToast({
        message: '加载中...',
        duration: 0,
        forbidClick: true
      })
      btnLoading.value = true
      try {
        const res = await handleSubmit(params)
        if (res.code == 200) {
          return showDialog({
            title: '提交成功',
            message: `感谢您的反馈~`,
            theme: 'round-button',
            confirmButtonText: '返回上一级'
          }).then(() => {
            // on close
            handleClickLeft()
          })
        } else {
          showFailToast(res.msg || '操作失败')
        }
      } catch {
        showFailToast('操作失败')
      } finally {
        btnLoading.value = false
        loadingToast.close()
      }
    })
    .catch((error: any) => {
      console.log(error)
      showNotify({
        type: 'warning',
        message: '信息填写不全',
        zIndex: 999
      })
    })
}

async function handleStreetList(district: string) {
  const localDistrictCode = localDistrictCodeList.value.find((ele) => ele.name == district)
  if (!localDistrictCode) {
    return showDialog({
      title: '提示',
      message: `您所在的区域不在本次随手拍范围内\n敬请谅解~`,
      theme: 'round-button',
      confirmButtonText: '返回'
    }).then(() => {
      // on close
      handleClickLeft()
    })
  }
  Object.assign(checkForm, {
    area: localDistrictCode?.key,
    assessmentUnit: localDistrictCode?.key
  })

  const res = await handleGetList({
    parentDeptId: localDistrictCode?.key || 1
  })
  if (res.code == 200) {
    streetList.value = res.data || []
  } else {
    showFailToast({
      message: '街道获取异常~',
      duration: 2000
    })
    streetList.value = []
  }
  streetListOrigin.value = streetList.value
}

function handleClickLeft() {
  router.back()
}
</script>

<style lang="less" scoped>
:deep(.van-picker__toolbar) {
  height: auto;
}
.report-container {
  width: 100%;
  height: 100vh;
}
.main-box {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  .main-label {
    width: 440rpx;
    white-space: nowrap;
    font-size: 28px;
    .icon {
      color: red;
      margin-right: 10px;
    }
  }
}
.divider {
  margin-left: 30px;
  border-top: 1px solid #f3f3f3;
}
</style>
