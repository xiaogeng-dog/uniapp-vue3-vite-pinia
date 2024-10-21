<template>
  <div class="upload-oss">
    <van-uploader
      v-model="fileList"
      :accept="fileType"
      multiple
      image-fit="fill"
      :after-read="onRead"
      :before-read="beforeRead"
      :disabled="disabled"
      :max-count="maxCount"
      :max-size="maxSize"
      :before-delete="deleteUploadImg"
      @oversize="onOversize"
    />
  </div>
</template>

<script lang="ts" setup>
// import { showNotify } from 'vant'
import { handleUploadFilePic } from '@/api/common'
const emits = defineEmits<{
  (e: 'update:modelValue', value)
}>()
const props = defineProps({
  maxCount: {
    // 图片张数
    type: Number,
    default: 5
  },
  maxSize: {
    // 图片大小
    type: Number,
    default: 1000 * 1024 * 1024
  },
  fileType: {
    // 文件类型
    type: String,
    default: 'image/*'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // 上传api路径
  actionUrl: {
    type: String,
    default: ''
  },
  modelValue: {
    //已上传的文件列表
    type: Array,
    default: () => {
      return []
    }
  }
})

const fileList = ref<any>()

onMounted(() => {
  fileList.value = props.modelValue
})

// watch(
//   () => props.modelValue,
//   (newV, oldV) => {
//     if (newV) {
//       fileList.value = props.modelValue
//     }
//   },
//   { deep: true }
// )

// 文件大小超过限制时触发
function onOversize(file) {
  showNotify({ type: 'warning', message: '请上传小于10M的图片' })
}

// 上传前置处理
function beforeRead(file) {
  if (Array.isArray(file)) {
    file.forEach((item) => {
      if (!item.type.includes('image')) {
        showNotify({ type: 'warning', message: '请上传图片' })
        return false
      }
    })
  } else {
    if (!file.type.includes('image')) {
      showNotify({ type: 'warning', message: '请上传图片' })
      return false
    }
  }
  return true
}
function onRead(file) {
  if (!props.actionUrl) return showNotify({ type: 'warning', message: '上传地址缺失' })
  if (Array.isArray(file)) {
    file.forEach((item) => {
      upLoadFile(item)
    })
  } else {
    upLoadFile(file)
  }
  emits('update:modelValue', fileList.value)
}

const deleteUploadImg = () => {
  console.log(fileList)
  emits('update:modelValue', fileList.value)
  return true
}

const upLoadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file.file)
  file.status = 'uploading'
  file.message = '上传中...'
  const response = await handleUploadFilePic(props.actionUrl, formData)
  if (response.code != 200) {
    showNotify({ type: 'warning', message: '上传失败' })
    file.status = 'failed'
    file.message = '上传失败'
    return false
  } else {
    file.status = 'done'
    file.message = ''
    file.response = response
  }
}
</script>

<style lang="less" scoped></style>
