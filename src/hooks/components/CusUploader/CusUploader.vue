<template>
  <div class="upload-oss">
    <van-uploader
      v-model="fileList"
      :multiple="multiple"
      :disabled="disabled"
      :max-count="limit"
      :accept="fileType"
      :show-limit-num="showLimitNum"
      :max-size="maxSize"
      :name="name || options.fileName"
      :before-read="beforeChoose"
      :after-read="beforeUpload"
      :upload-text="uploadText"
      @delete="onDelete"
      @oversize="onOversize"
    />
    <van-notify />
    <view class="watermark-canvas">
      <canvas
        id="watermark-canvas"
        :style="{ width: waterOptions.canvasWidth, height: waterOptions.canvasHeight }"
        canvas-id="watermark-canvas"
      />
    </view>
  </div>
</template>

<script lang="ts" setup name="cusUploader">
import moment from 'moment'
import { type UploaderFileListItem, showNotify } from 'vant'

import { getCurrentInstance } from 'vue'

type UploadParamsType = {
  limit: number
  showLimitNum: boolean
  maxSize: number
  sourceType: string
  name: string
  fileType: string
  disabled: boolean
  actionUrl: string
  token: string
  options: any
  multiple: boolean
  uploadText: string
  modelValue: []
  watermark: boolean
  watermarkOptions: any
}

const emits = defineEmits<{
  (e: 'update:modelValue', value)
}>()

const props = withDefaults(defineProps<Partial<UploadParamsType>>(), {
  // 图片张数
  limit: 5,
  showLimitNum: false,
  maxSize: 20 * 1024 * 1024,
  sourceType: '',
  // name
  name: 'file',
  fileType: 'image/*',
  disabled: false,
  // 上传api路径
  actionUrl: '',
  // token
  token: '',
  // 配置项
  options: {
    fileName: 'file'
  },
  multiple: false,
  //已上传的文件列表
  modelValue: () => [],
  // 水印
  watermark: false,
  watermarkOptions: () => {}
})

const waterOptions = reactive({
  imageValue: [],
  canvasWidth: '1080px',
  canvasHeight: '2160px'
})

const fileList = ref<any>()
const instance = getCurrentInstance()
onMounted(() => {})

watch(
  () => props.modelValue,
  (newV, oldV) => {
    if (newV) {
      fileList.value = props.modelValue
    }
  },
  { deep: true }
)

// 文件大小超过限制时触发
function onOversize(file) {
  showNotify({ type: 'warning', message: '请上传小于20M的图片' })
}
const onDelete = (file) => {
  console.log('onDelete', file)
  emits('update:modelValue', fileList.value)
}

// 上传前置处理
const beforeChoose = (file, detail) => {
  console.log('before-read', file, detail)
  if (!file.type.includes('image')) {
    showNotify({ type: 'warning', message: '请上传图片' })
    return false
  }
  return true
}

const beforeUpload = async (file, { name, index }) => {
  console.log('after-read', file, name, index)
  file.status = 'uploading'
  file.message = '上传中...'
  uni.uploadFile({
    url: props.actionUrl,
    filePath: file.content,
    name: 'file',
    // header: {
    // 	"Content-Type": "multipart/form-data"
    // },
    formData: {
      ...props.options
    },
    success: (res) => {
      let fileDataList = JSON.parse(res.data)
      if (fileDataList.code == 200) {
        // emits('update:modelValue', fileList.value)c
        file.status = 'done'
        file.message = ''
      } else {
        file.status = 'failed'
        file.message = '上传失败'
      }
      Object.assign(file, {
        ...fileDataList.data,
        url: fileDataList.data.filePath ? fileDataList.data.filePath : fileDataList.data.url
      })
    },
    fail(result) {
      file.status = 'failed'
      file.message = '上传失败'
    }
  })
  if (props.watermark) {
    const path = await watermarkProcess(file)
    // file.file = path
  }
  emits('update:modelValue', fileList.value)
}

const watermarkProcess = (tempFile) => {
  return new Promise((resolve, reject) => {
    console.log('tempFile', tempFile)
    // 添加水印

    addWatermark(tempFile.path)
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        reject()
      })
  })
}
const addWatermark = async (tempFilePath) => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: tempFilePath,
      success: async (res) => {
        // 设置画布高度和宽度
        waterOptions.canvasWidth = `${res.width}px`
        waterOptions.canvasHeight = `${res.height}px`
        await sleep(200) // 某些平台 canvas 渲染慢，需要等待

        const ctx = uni.createCanvasContext('watermark-canvas', instance)
        ctx.clearRect(0, 0, res.width, res.height)
        ctx.beginPath()
        ctx.drawImage(tempFilePath, 0, 0, res.width, res.height)

        // 水印 字体大小，颜色，内容，位置
        ctx.beginPath()
        ctx.setFontSize(50)
        ctx.setFillStyle('rgba(147, 181, 207,0.8)')
        if (props.watermarkOptions && Object.keys(props.watermarkOptions).length) {
          Object.values(props.watermarkOptions).forEach((val, index) => {
            ctx.fillText(val as string, 10, res.height - 80 * (index + 2))
          })
        }
        // ctx.fillText('我是水印1', 10, res.height - 25)
        ctx.fillText(moment().format('YYYY年MM月DD日 HH:mm:ss'), 10, res.height - 70)

        // 开始绘制 (canvas -> 临时文件路径)
        ctx.draw(false, async () => {
          await sleep(500) // 某些平台 canvas 渲染慢，需要等待

          uni.canvasToTempFilePath(
            {
              canvasId: 'watermark-canvas',
              destWidth: res.width,
              destHeight: res.height,
              fileType: 'jpg',
              quality: 0.8,
              success: (fileRes) => {
                resolve(fileRes.tempFilePath)
              },
              fail: (err) => {
                console.log('[Error draw]', err)
                uni.showToast({ title: err.errMsg, icon: 'none' })
                reject()
              },
              complete: () => {
                waterOptions.canvasWidth = '0px'
                waterOptions.canvasHeight = '0px'
              }
            },
            instance
          )
        })
      },
      fail: (err) => {
        console.log('[Error getImageInfo]', err)
        uni.showToast({ title: err.errMsg, icon: 'none' })
        reject()
      }
    })
  })
}

const sleep = (millisecond) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecond)
  })
}
</script>

<style lang="less" scoped>
.watermark-canvas {
  position: absolute;
  top: -500000px;
  left: -500000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  // z-index: -100;
}
</style>
