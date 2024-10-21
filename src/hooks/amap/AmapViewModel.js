import AMapLoader from '@amap/amap-jsapi-loader'

const mapOptions = {
  key: '6f01f6165ec14c3adc97981f9bad7252', // 申请好的Web端开发者Key，首次调用 load 时必填
  version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  plugins: [
    'AMap.ControlBar',
    'AMap.ToolBar',
    'AMap.LabelsLayer',
    'AMap.LabelMarker',
    'AMap.Geolocation',
    'AMap.Walking',
    'AMap.Driving',
    'AMap.PlaceSearch',
    'AMap.Geocoder'
  ] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
}

export default class AmapViewModel {
  constructor(target, isGetLocation = true, callback) {
    this.target = target || 'map'
    this.isGetLocation = isGetLocation
    this.locationPosition = []
    this.positionDetails = null
    this.callback = callback
    if (this.map) {
      this._taskID = new Date()
      // this.getMapInfo(this._taskID)
    } else {
      this._initWebMap()
    }
  }
  _initWebMap() {
    this.initWebMap()
  }
  initWebMap() {
    AMapLoader.load({
      ...mapOptions
    })
      .then((AMap) => {
        this.map = new AMap.Map(this.target, {
          resizeEnable: true, //是否监控地图容器尺寸变化
          expandZoomRange: true,
          rotateEnable: true,
          pitchEnable: true,
          //设置地图容器id
          viewMode: '3D', //是否为3D地图模式
          zoom: 12 //初始化地图级别
          // center: this.locationPosition //初始化地图中心点位置
        })
        this.map.on('complete', async () => {
          console.log(`地图加载完成！当前地图中心点为：${this.map.getCenter()}`)

          // 获取定位
          if (this.isGetLocation) {
            await this.getLocation()
          }
          this.callback && this.callback(this.map)
        })
      })
      .catch((e) => {
        console.log(e)
      })
  }
  /**
   * 定位
   */
  getLocation(options) {
    return new Promise((resolve, reject) => {
      this.map.plugin(['AMap.Geolocation'], () => {
        this.geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
          timeout: 10000, //超过10秒后停止定位，默认：5s
          position: 'RB', //定位按钮的停靠位置
          offset: [10, 20], //定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
          zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
          needAddress: true,
          extensions: 'base',
          ...options
        })
        this.map.addControl(this.geolocation)
        this.geolocation.getCurrentPosition((status, result) => {
          if (status == 'complete') {
            this.isGetLocationComplete = true
            this.locationPosition = [result.position.lng, result.position.lat]
            console.log(this.locationPosition)
            this.positionDetails = result
            resolve(result)
          } else {
            reject(result)
            uni.showModal({
              title: '获取定位失败',
              content: '请检查是否开启定位权限~',
              confirmText: '我知道了',
              showCancel: false
            })
          }
        })
      })
    })
  }
  locationToCoordinate(address) {
    return new Promise(function (resolve, reject) {
      var geocoder = new AMap.Geocoder({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
        // batch: true,
        extensions: 'base'
      })
      geocoder.getLocation(address, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
          // result中对应详细地理坐标信息
          resolve(result)
        } else {
          reject(result)
        }
      })
    })
  }
  /**
   * 经纬度转地址
   * @param {*} data
   * @returns
   */
  coordinateToLocation(data) {
    return new Promise(function (resolve, reject) {
      console.log(data)
      // data是具体的定位信息
      var geocoder = new AMap.Geocoder({
        // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
      })
      var lngLat = [data.position.lng, data.position.lat]
      geocoder.getAddress(lngLat, function (status, result) {
        console.log(status, result)
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          resolve(result.regeocode)
        } else {
          reject(result)
        }
      })
    })
  }

  /**
   * 搜索
   * @param {*} inputId
   */
  amapAutoComplete(inputId) {
    // 实例化AutoComplete
    var autoOptions = {
      // input 为绑定输入提示功能的input的DOM ID
      input: inputId
    }
    var autoComplete = new AMap.AutoComplete(autoOptions)
    console.log(autoComplete)
    // 无需再手动执行search方法，autoComplete会根据传入input对应的DOM动态触发search
  }

  amapPlaceSearch(keywords, distance = 10000) {
    return new Promise((resolve, reject) => {
      var autoOptions = {
        city: '', // 兴趣点城市
        pageSize: 50, //每页结果数,默认10
        pageIndex: 1, //请求页码，默认1
        extensions: 'base'
      }
      this.placeSearch = new AMap.PlaceSearch(autoOptions)
      this.placeSearch.searchNearBy(keywords, this.locationPosition, distance, (status, result) => {
        // 搜索成功时，result即是对应的匹配数据
        if (status === 'complete') {
          resolve(result.poiList)
        } else {
          // alert('搜索失败~')
          reject(result)
        }
      })
    })
  }

  amapPlaceSearchNearBy(keywords, distance = 1000) {
    return new Promise((resolve, reject) => {
      this.placeSearchNearBy = new AMap.PlaceSearch({
        type: '', // 兴趣点类别
        pageSize: 3, // 单页显示结果条数
        pageIndex: 1, // 页码
        city: '全国', // 兴趣点城市
        citylimit: true, //是否强制限制在设置的城市内搜索
        map: this.map, // 展现结果的地图实例
        panel: 'panel', // 结果列表将在此容器中进行展示。
        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
      })
      this.placeSearchNearBy.on('listElementClick', (element) => {
        this.clearNavigationRoute()
        this.navigationRoute(element.data.location)
      })
      this.placeSearchNearBy.searchNearBy(
        keywords,
        this.locationPosition,
        distance,
        (status, result) => {
          // 搜索成功时，result即是对应的匹配数据
          if (status === 'complete') {
            resolve(result.poiList)
          } else {
            // alert('搜索失败~')
            reject()
          }
        }
      )
    })
  }
  /**
   * 导航路线
   */
  navigationRoute(destination) {
    if (!this.isGetLocationComplete) {
      return uni.showModal({
        title: '获取路线失败',
        content: '请打开定位，获取更多服务权限~',
        confirmText: '我知道了',
        showCancel: false
      })
    }
    //步行导航
    this.driving = new AMap.Driving({
      map: this.map
    })
    //根据起终点坐标规划步行路线
    this.driving.search(this.locationPosition, destination, function (status, result) {
      // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
      if (status === 'complete') {
        console.log(result)
      } else {
        console.log(result)
      }
    })
  }

  clearNavigationRoute() {
    this.driving && this.driving.clear()
  }

  /**
   * 计算距离
   * @param {*} lat1
   * @param {*} lng1
   * @param {*} lat2
   * @param {*} lng2
   * @returns
   */
  countDistance([lat2, lng2]) {
    const [lat1, lng1] = this.locationPosition
    var radLat1 = (lat1 * Math.PI) / 180.0
    var radLat2 = (lat2 * Math.PI) / 180.0
    var a = radLat1 - radLat2
    var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
    var s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
        )
      )
    s = s * 6378.137 // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000
    s = s * 1000
    return s
  }
  // 墨卡托赚高德
  mercatorTolonlat(mercator) {
    var lonlat = { x: 0, y: 0 }
    var x = (mercator.x / 20037508.34) * 180
    var y = (mercator.y / 20037508.34) * 180
    y = (180 / Math.PI) * (2 * Math.atan(Math.exp((y * Math.PI) / 180)) - Math.PI / 2)
    lonlat.x = x
    lonlat.y = y
    return lonlat
  }
  /**
   * 判断定位是否在网格内
   */
  isPointInRing(pointArr) {
    var inRing = AMap.GeometryUtil.isPointInRing(this.locationPosition, pointArr)
    return inRing
  }

  cleanWebMap() {
    if (this.map) {
      this.map.destroy()
      this.map = null
    }
  }
}
