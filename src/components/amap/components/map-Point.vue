<template>
  <view class="map-min-box">
    <!-- 可视化地图 -->
    <view v-show="maptype == 1" class="map-min-1">
      <view v-if="longitude" class="map-box">
        <map
          id="myMap"
          :enable-poi="true"
          :show-location="true"
          style="height: 100%; width: 100%"
          :longitude="longitude"
          :latitude="latitude"
          scale="15"
          @regionchange="regionchangetab"
        >
          <cover-image
            :class="jump == 1 ? 'controls-play-img bounce-animation' : 'controls-play-img'"
            :src="orientationIco"
          />
          <cover-image
            v-if="showResetting"
            class="position-play-img"
            :src="resettingIco"
            @click="setposition"
          />
        </map>
      </view>
      <view class="sou-item-list">
        <view class="u-search-box" @click="opensea">
          <view class="search-min-box">
            <image
              src="https://lbs.gtimg.com/visual/miniprogram-plugin/location-picker/assets/s_search@2x.png"
              mode=""
            />
            搜索地点
          </view>
        </view>
        <view class="list-item-name-box">
          <view class="category-scroll-view">
            <scroll-view scroll-y="true" class="scroll-Y" @scrolltolower="lower">
              <view
                v-for="(item, index) in list"
                :key="index"
                class="scroll-view-item"
                @click="setpoi(item, index)"
              >
                <view class="poi-item-name">
                  <image :src="listIco" mode="" />
                  {{ item.name }}
                </view>
                <view class="poi-address">{{ item.address }}</view>
                <view v-if="locinx == index" class="right-icon" />
              </view>
              <view v-if="list.length == 0" class="loading-box">
                <view v-if="loading" class="load-animation">
                  <view class="spinner" />
                  <view class="txt-item">加载中</view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        <view class="but-box">
          <view class="btn-location" @click="fixAddress">确认选点</view>
        </view>
      </view>
    </view>
    <view v-show="maptype == 2" class="map-min-2">
      <view class="map-min-2-search-box">
        <input
          v-model="keyword"
          placeholder="搜索地点"
          class="locationpicker-search-content-ipt"
          @input="changeword"
          @confirm="changeword"
        />
        <view class="locationpicker-search-clear" @click="onClearInput">
          <image
            src="https://lbs.gtimg.com/visual/miniprogram-plugin/location-picker/assets/btn_close@2x.png"
            class="locationpicker-search-clear-ipt"
            mode=""
          />
        </view>
        <view class="locationpicker-search--content-btn-line" />
        <view class="locationpicker-search-content-btn" @click="changeword">搜索</view>
        <!-- <u-search placeholder="搜索地点" shape="square" bgColor="#ebebeb" v-model="keyword" @search='' @custom='changeword' @change="changeword"></u-search> -->
      </view>
      <u-line />
      <scroll-view scroll-y="true" class="scroll-Y">
        <view
          v-for="(item, index) in seolist"
          :key="index"
          class="scroll-view-item"
          @click="seopoi(item, index)"
        >
          <view class="poi-item-name">
            <image :src="listIco" mode="" />
            {{ item.name }}
          </view>
          <view class="poi-address">{{ item.address }}</view>
        </view>

        <view v-if="seolist.length == 0 && keyword != ''" class="loading-box">
          <view v-if="loading" class="load-animation">
            <view class="spinner" />
            <view class="txt-item">加载中</view>
          </view>
          <view v-if="!loading && seolist.length == 0" class="empty-box">
            <view class="value-txt-box-2">没有搜索到数据</view>
          </view>
        </view>
        <!-- 历史搜索记录 -->
        <view v-if="history.length == 0 && keyword == ''" class="history-item-box">
          <view class="empty-box">
            <view class="value-txt-box-1">还没有历史记录</view>
            <view class="value-txt-box-2">快来体验世界吧</view>
          </view>
        </view>
        <view v-if="history.length > 0 && keyword == ''" class="history-item-box">
          <view
            v-for="(item, index) in history"
            :key="index"
            class="scroll-view-item"
            @click="seopoi(item, index)"
          >
            <view class="poi-item-name">
              <image src="/static/Invite/item-inx.png" mode="" />
              {{ item.name }}
            </view>
            <view class="poi-address">{{ item.address }}</view>
          </view>
          <view v-if="history.length > 0" class="item-but-box">
            <view class="locationpicker-clear-history-btn" @click="Clearhistory">清空历史记录</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { useAuthStore } from '@/store/index'
// const router = useRouter()
import AMapWX from './amap-wx.js'
// #ifdef WEB
import jweixin from 'weixin-js-sdk'
// #endif
export default {
  name: 'gaode-map',
  props: {
    // 高德Web服务Key
    mapKey: {
      type: String,
      default: ''
    },
    // 定位复位图标
    resettingIco: {
      type: String,
      default: new URL('./static/position.png', import.meta.url).hre
    },
    // 定位图标
    orientationIco: {
      type: String,
      default: new URL('./static/map-inx.png', import.meta.url).href
    },
    // 列表图标
    listIco: {
      type: String,
      default: new URL('./static/item-inx.png', import.meta.url).href
    },
    // 搜索范围
    Radius: {
      type: String,
      default: ''
    },
    //定位功能显示
    showResetting: {
      type: Boolean,
      default: true
    },
    // 微信公众号jsSdk配置
    configData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      maptype: 1,
      latitude: '',
      longitude: '',
      markers: [],
      list: [],
      history: [],
      seolist: [],
      myAmapFun: '',
      location: '',
      jump: 1,
      keyword: '',
      mapObj: '',
      loading: true,
      page: 1,
      count: 0,
      locinx: 0,
      changel: 1,
      authState: useAuthStore()
    }
  },
  beforeUnmount() {},
  mounted() {
    this.$nextTick(() => {
      this.handleInitMap()
    })
  },
  methods: {
    handleInitMap() {
      var that = this
      // if (options.locinx) {
      // 	that.locinx = options.locinx;
      // }
      that.mapObj = uni.createMapContext('myMap', this)
      that.myAmapFun = new AMapWX({
        key: this.mapKey
      })
      // #ifndef WEB
      uni.getLocation({
        type: 'gcj02',
        altitude: true,
        geocode: true,
        isHighAccuracy: true,
        success: function (res) {
          try {
            that.latitude = res.latitude
            that.longitude = res.longitude
            that.location = `${that.latitude},${that.longitude}`
            that.attachments()
          } catch (e) {
            console.log(e)
          }
        },
        fail: function (info) {
          //失败回调
          console.log(info, 2)
        }
      })
      // #endif
      // #ifdef WEB
      var ua = window.navigator.userAgent.toLowerCase()
      if (ua.match(/micromessenger/i) == 'micromessenger') {
        // if (ua.match(/micromessenger/i) == 'wqqeqwe') {
        // // 配置sdksj
        console.log('🚀 ~ that.configData:', that.configData)
        if (that.isEmpty(that.configData)) {
          console.log('请配置wxJSsdk配置参数！')
          return
        } else {
          jweixin.config({
            ...that.configData,
            jsApiList: ['openLocation', 'getLocation'] // 必填，需要使用的JS接口列表
          })
          // sdk加载完成后执行
          jweixin.ready(() => {
            jweixin.checkJsApi({
              jsApiList: ['getLocation'],
              success: (res) => {
                console.log('jweixin.ready', res)
                if (res.checkResult.getLocation == false) {
                  console.log('微信版本低')
                  return
                }
              }
            })
            jweixin.error((err) => {
              console.error('接口调取失败', err)
              if (err.errMsg == 'config:fail,invalid signature') {
                this.authState.handleWexinJSSDKTicket()
              }
            })
            // 获取位置
            jweixin.getLocation({
              type: 'gcj02',
              success: (res) => {
                console.log('jssdk获取的位置:', res.longitude, res.latitude)
                that.latitude = res.latitude
                that.longitude = res.longitude
                that.location = `${that.latitude},${that.longitude}`
                that.attachments()
              },
              cancel: (res) => {
                console.error('您已禁止获取位置信息')
              }
            })
          })
        }
      } else {
        console.log('不是微信客户端')

        uni.getLocation({
          type: 'gcj02',
          altitude: true,
          geocode: true,
          isHighAccuracy: true,
          success: function (res) {
            try {
              that.latitude = res.latitude
              that.longitude = res.longitude
              that.location = `${that.latitude},${that.longitude}`
              that.attachments()
            } catch (e) {
              console.log(e)
            }
          },
          fail: function (info) {
            //失败回调
            console.log(info, 2)
          }
        })
      }
      // #endif
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0
    },
    Clearhistory() {
      let _this = this
      uni.showModal({
        title: '提示',
        content: '确定清空全部历史记录？',
        success: function (res) {
          if (res.confirm) {
            uni.removeStorage({
              key: 'locationHistory',
              success: function (res) {
                console.log('success')
                _this.history = []
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    // 返回
    getbacktrack() {
      if (this.maptype == 2) {
        var that = this
        this.page = 1
        that.attachments()
        this.maptype = 1
        this.keyword = ''
      } else {
        // router.back()
        uni.navigateBack({})
      }
    },
    // 确定地址
    fixAddress() {
      let location = this.list[this.locinx]
      this.$emit('commitCheck', location)
    },
    // 搜索选择
    seopoi(e) {
      var that = this
      this.changel = 2
      let lon = e.location.split(',')
      this.latitude = lon[1]
      this.longitude = lon[0]
      this.page = 1
      this.list.push(e)
      const val = this.history.find((k) => k.id == e.id)
      if (!val) {
        this.history.unshift(e)
        uni.setStorage({
          key: 'locationHistory',
          data: this.history,
          success: function () {
            console.log('success')
          }
        })
      }
      that.location = e.location
      that.attachments()
      setTimeout(() => {
        that.changel = 1
      }, 1000)
      this.maptype = 1
      this.keyword = ''
    },
    // 搜索
    changeword() {
      var that = this
      that.loading = true
      that.seolist = []
      let formData = {}
      if (that.Radius) {
        formData = {
          location: that.location,
          keywords: that.keyword,
          city: that.Radius,
          citylimit: true
        }
      } else {
        formData = {
          location: that.location,
          keywords: that.keyword
        }
      }
      that.myAmapFun.getInputtips({
        ...formData,
        success: function (data) {
          console.log(data, '--1--')
          data.tips.forEach((item, index) => {
            console.log(item)
            //成功回调
            if (item.location != '' && item.district != '') {
              let province = ''
              if (item.district.match(/^(.*?省|.*?自治区)/)) {
                province = item.district.match(/^(.*?省|.*?自治区)/)[0]
              }
              let city = ''
              if (item.district.replace(province, '').match(/^(.*?市|.*?地区)/)) {
                city = item.district.replace(province, '').match(/^(.*?市|.*?地区)/)[0]
              }
              let district = ''
              if ((district = item.district.replace(province + city, '').match(/^.*?(区|县|镇)/))) {
                district = item.district.replace(province + city, '').match(/^.*?(区|县|镇)/)[0]
              }
              that.seolist.push({
                id: item.id,
                name: item.name,
                address: item.address,
                location: item.location,
                province: province,
                city: city,
                district: district,
                adcode: item.adcode
              })
            }
          })
          that.count = data.count
          that.loading = false
          uni.hideLoading()
        },
        fail: function (info) {
          //失败回调
          console.log(info, 2)
        }
      })
    },
    // 选择定位坐标地址
    setpoi(e, inx) {
      var that = this
      this.locinx = inx
      this.changel = 2
      let lon = e.location.split(',')
      this.latitude = lon[1]
      this.longitude = lon[0]
    },
    // 下拉加载
    lower() {
      if (this.list.length != this.count) {
        this.page++
        uni.showLoading({
          title: '加载中...'
        })
        this.attachments()
      }
    },
    // 复原定位
    setposition() {
      var that = this
      this.changel = 2
      this.locinx = 0
      this.page = 1
      uni.getLocation({
        type: 'gcj02',
        altitude: true,
        geocode: true,
        isHighAccuracy: true,
        success: function (res) {
          console.log(res, 5656)
          try {
            that.location = `${res.latitude},${res.longitude}`
            setTimeout(() => {
              console.log(that.mapObj, 'mod--1')
              that.mapObj.moveToLocation({
                latitude: res.latitude,
                longitude: res.longitude,
                scale: 15, // 可选，缩放比例
                animation: true, // 开启平滑移动动画
                complete(res) {
                  console.log(res, '6633')
                }
              })
            }, 400)
            that.list = []
            that.loading = true
            that.attachments()
            setTimeout(() => {
              that.changel = 1
            }, 1000)
          } catch (e) {
            console.log(e)
          }
        },
        fail: function (info) {
          //失败回调
          console.log(info, 2)
        }
      })
    },
    // 搜索跳转
    opensea() {
      this.list = []
      this.seolist = []
      this.maptype = 2
      let _this = this
      uni.getStorage({
        key: 'locationHistory',
        success: function (res) {
          _this.history = res.data
          console.log(_this.history, 5656)
        }
      })
    },
    // 发生变化定位
    regionchangetab(e) {
      let _this = this
      // #ifdef APP
      setTimeout(() => {
        let mapForm = _this.mapObj.$getAppMap()
        mapForm.onstatuschanged = function (eve) {
          _this.location = `${eve.center.latitude},${eve.center.longitude}`
          if (_this.changel == 1) {
            _this.loading = true
            _this.page = 1
            _this.list = []
            _this.attachments()
          } else {
            _this.changel = 1
          }
        }
      }, 400)
      // #endif
      // #ifdef H5 || MP
      if (this.changel == 1) {
        if (e.type == 'end') {
          _this.loading = true
          this.page = 1
          this.jump = 0
          this.location = `${e.detail.centerLocation.latitude},${e.detail.centerLocation.longitude}`
          this.list = []
          this.attachments()
          setTimeout(() => {
            this.jump = 1
          }, 400)
        }
      }
      // #endif
    },
    // 获取附近poi
    attachments() {
      var that = this
      that.myAmapFun.getPoiAround({
        location: that.location,
        page: that.page,
        success: function (data) {
          console.log(data, '--1--', that.location)
          if (data) {
            data.poisData.forEach((item, index) => {
              //成功回调
              that.list.push({
                id: item.id,
                name: item.name,
                address: item.address,
                location: item.location,
                province: item.pname,
                city: item.cityname,
                district: item.adname,
                pcode: item.pcode,
                citycode: item.citycode,
                adcode: item.adcode
              })
            })
            if (!that.list[0].pcode) {
              that.list[0].pcode = that.list[1].pcode
              that.list[0].citycode = that.list[1].citycode
            }
            that.count = data.count
          }
          that.loading = false
          uni.hideLoading()
        },
        fail: function (info) {
          //失败回调
          console.log(info, 2)
        }
      })
    },
    onClearInput() {
      this.keyword = ''
      this.seolist = []
    }
    // // 点击定位
    // makertap(e) {
    // 	this.jump = 0;
    // 	this.location = `${e.detail.latitude},${e.detail.longitude}`;
    // 	this.mapObj.moveToLocation({
    // 		latitude: e.detail.latitude,
    // 		longitude: e.detail.longitude,
    // 		scale: 15, // 可选，缩放比例
    // 		animation: true // 开启平滑移动动画
    // 	});
    // 	this.changel=1
    // 	// setTimeout(() => {
    // 	// this.latitude = e.detail.latitude;
    // 	// this.longitude = e.detail.longitude;
    // 	// }, 1200);
    // }
  }
}
</script>

<style lang="less" scoped>
.map-min-box {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .load-animation {
    height: 100rpx;
    margin: auto;
  }

  .txt-item {
    height: 50rpx;
    line-height: 50rpx;
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.3);
    text-align: center;
  }

  .spinner {
    width: 50rpx;
    margin: auto;
    height: 50rpx;
    border: 6rpx solid rgba(0, 0, 0, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .top-box {
    background-color: #fff;

    .block_1 {
      position: relative;

      .Title-top {
        text-align: center;
        font-size: 34rpx;
        font-weight: 500;
        color: #000000;
      }

      .ioc-box {
        position: absolute;
        z-index: 999;
        left: 18rpx;
        top: 0rpx;
        height: 100%;
        display: flex;

        /deep/ .u-icon {
          .u-icon__icon {
            font-size: 45rpx !important;
            font-weight: bold !important;
          }
        }
      }
    }
  }

  // 可视化地图选点
  .map-min-1 {
    width: 100%;
    height: 100%;

    .map-box {
      width: 100%;
      height: 50%;

      #myMap {
        width: 100%;
        height: 100%;
        position: relative;
      }

      @keyframes bounce {
        0% {
          top: 50%;
          animation-timing-function: ease-in;
        }

        /* 动画开始时图片位于原始位置 */
        50% {
          top: 40%;
        }

        /* 动画进行到一半时，图片向上移动10像素 */
        100% {
          top: 50%;
          animation-timing-function: ease-out;
        }

        /* 动画结束时回到原始位置 */
      }

      .bounce-animation {
        animation: bounce 0.6s alternate;
        /* 动画名称、持续时间、重复次数和交替方向 */
      }

      .controls-play-img {
        height: 88rpx;
        left: 50%;
        margin-left: -40rpx;
        margin-top: -88rpx;
        top: 50%;
        width: 80rpx;
        z-index: 9999;
        position: absolute;
      }

      .position-play-img {
        bottom: 32rpx;
        height: 66rpx;
        right: 16rpx;
        width: 66rpx;
        border-radius: 50%;
        background-color: #fff;
        overflow: hidden;
        z-index: 9999;
        position: absolute;
      }
    }

    .sou-item-list {
      width: 100%;
      height: 50%;

      .u-search-box {
        padding: 28rpx 32rpx 20rpx;

        .search-min-box {
          background: #f2f2f2;
          border-radius: 14rpx;
          box-sizing: border-box;
          color: #999;
          font-size: 28rpx;
          height: 68rpx;
          line-height: 40rpx;
          padding: 14rpx 22rpx;

          image {
            display: inline-block;
            height: 32rpx;
            vertical-align: middle;
            width: 32rpx;
          }
        }
      }

      .list-item-name-box {
        height: calc(100% - 108rpx - 160rpx);
        width: calc(100% - 60rpx);
        padding: 0 20rpx 0 40rpx;

        .category-scroll-view {
          width: 100%;
          height: 100%;

          .scroll-Y {
            width: 100%;
            height: 100%;

            .scroll-view-item {
              border-bottom: 2rpx solid #e5e5e5;
              margin-right: 20rpx;
              padding: 32rpx 0 30rpx;
              position: relative;

              .poi-item-name {
                color: #333;
                font-size: 32rpx;
                line-height: 44rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 90%;

                image {
                  display: inline-block;
                  height: 36rpx;
                  margin-right: 8rpx;
                  margin-top: -8rpx;
                  vertical-align: middle;
                  width: 36rpx;
                }
              }

              .poi-address {
                color: #666;
                font-size: 26rpx;
                line-height: 36rpx;
                margin-left: 44rpx;
                margin-top: 10rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 80%;
              }

              .right-icon {
                border-bottom: 4rpx solid #427cff;
                border-left: 4rpx solid #427cff;
                height: 8rpx;
                margin-top: -2rpx;
                position: absolute;
                right: 0;
                top: 50%;
                -webkit-transform: rotate(-45deg);
                transform: rotate(-45deg);
                width: 20rpx;
              }
            }

            .loading-box {
              height: 100%;
              width: 100%;
              display: flex;
            }
          }
        }
      }

      .but-box {
        padding: 20rpx 40rpx 22rpx;
        border-top: 2rpx solid #e5e5e5;
        padding-bottom: calc(22rpx + 30rpx);

        .btn-location {
          background: #427cff;
          border-radius: 200rpx;
          color: #fff;
          font-size: 32rpx;
          height: 68rpx;
          line-height: 68rpx;
          text-align: center;
        }
      }
    }

    .loading-box {
      height: 100%;
      width: 100%;
      display: flex;

      .empty-box {
        padding: 200rpx 0;
        text-align: center;
        width: 100%;

        .value-txt-box-1 {
          margin: 10rpx auto;
        }

        .value-txt-box-2 {
          color: #666;
          font-size: 26rpx;
          margin: 0 auto;
        }
      }
    }
  }

  // 可视化地图选点结束
  .map-min-2 {
    width: 100vw;
    height: 100vh;
    background-color: #fff;

    .loading-box {
      height: 100%;
      width: 100%;
      display: flex;

      .empty-box {
        padding: 200rpx 0;
        text-align: center;
        width: 100%;

        .value-txt-box-1 {
          margin: 10rpx auto;
        }

        .value-txt-box-2 {
          color: #666;
          font-size: 26rpx;
          margin: 0 auto;
        }
      }
    }

    .map-min-2-search-box {
      height: 84rpx;
      background: #efefef;
      border-radius: 7px;
      height: 42px;
      margin: 0 14px 10px;
      display: -webkit-flex;
      display: flex;
      -webkit-justify-content: space-around;
      justify-content: space-around;

      input {
        cursor: auto;
        display: block;
        font-family: UICTFontTextStyleBody;
        height: 1.4rem;
        min-height: 1.4rem;
        overflow: hidden;
        text-overflow: clip;
        white-space: nowrap;
      }

      .locationpicker-search-content-ipt {
        height: 42px;
        padding-left: 10px;
        width: 70%;
      }

      .locationpicker-search-clear {
        height: 43px;
        text-align: center;
        width: 33px;

        .locationpicker-search-clear-ipt {
          height: 16px;
          margin-top: 13px;
          width: 16px;
        }
      }

      .locationpicker-search--content-btn-line {
        background: #c7c7c7;
        height: 16px;
        margin: 13px -10px 0 0;
        width: 1px;
      }

      .locationpicker-search-content-btn {
        color: #427cff;
        height: 42px;
        line-height: 42px;
        padding: 0 10px 0 20px;
      }
    }

    .scroll-Y {
      height: calc(100vh - 87px - 150rpx);
      width: 100vw;

      .scroll-view-item {
        border-bottom: 2rpx solid #e5e5e5;
        padding: 30rpx 40rpx 30rpx 40rpx;
        position: relative;

        .poi-item-name {
          color: #333;
          font-size: 32rpx;
          line-height: 44rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 90%;

          image {
            display: inline-block;
            height: 36rpx;
            margin-right: 8rpx;
            margin-top: -8rpx;
            vertical-align: middle;
            width: 36rpx;
          }
        }

        .poi-address {
          color: #666;
          font-size: 26rpx;
          line-height: 36rpx;
          margin-left: 44rpx;
          margin-top: 10rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 80%;
        }
      }

      // 历史
      .history-item-box {
        width: 100vw;
        height: 100%;

        .empty-box {
          padding: 200rpx 0;
          text-align: center;
          width: 100%;

          .value-txt-box-1 {
            margin: 10rpx auto;
          }

          .value-txt-box-2 {
            color: #666;
            font-size: 26rpx;
            margin: 0 auto;
          }
        }

        .item-but-box {
          height: 160rpx;
          padding-top: 20rpx;

          .locationpicker-clear-history-btn {
            border: 2rpx solid #c7c7c7;
            border-radius: 32rpx;
            color: #666;
            font-size: 26rpx;
            height: 60rpx;
            line-height: 60rpx;
            margin: 0 auto;
            text-align: center;
            width: 268rpx;
          }
        }

        .scroll-view-item {
          border-bottom: 2rpx solid #e5e5e5;
          padding: 30rpx 40rpx 30rpx 40rpx;
          position: relative;

          .poi-item-name {
            color: #333;
            font-size: 32rpx;
            line-height: 44rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 90%;

            image {
              display: inline-block;
              height: 36rpx;
              margin-right: 8rpx;
              margin-top: -8rpx;
              vertical-align: middle;
              width: 36rpx;
            }
          }

          .poi-address {
            color: #666;
            font-size: 26rpx;
            line-height: 36rpx;
            margin-left: 44rpx;
            margin-top: 10rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 80%;
          }
        }
      }
    }
  }
}
</style>
