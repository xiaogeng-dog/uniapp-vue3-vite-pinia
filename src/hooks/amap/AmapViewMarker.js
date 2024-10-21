import AmapViewModel from './AmapViewModel'

export default class AmapViewMarker extends AmapViewModel {
  constructor(target, isGetLocation = true, callback) {
    super(target, isGetLocation, callback)
    this.textStyle = {
      fontSize: 12,
      fontWeight: 'normal',
      fillColor: '#22886f',
      strokeColor: '#fff',
      strokeWidth: 2,
      fold: true,
      padding: '2, 5'
    }
    this.imageName = 'point'
    this.imageKey = []
  }

  /**
   * 初始化
   */
  initLabelsLayer(options) {
    if (!this.labelsLayer) {
      this._initLabelsLayer(options)
    }
  }

  _initLabelsLayer(options) {
    this.labelsLayer = new AMap.LabelsLayer({
      zooms: [3, 20],
      zIndex: 1000,
      // 开启标注避让，默认为开启，v1.4.15 新增属性
      collision: true,
      // 开启标注淡入动画，默认为开启，v1.4.15 新增属性
      animation: true,
      // allowCollision: false,
      ...options
    })
  }

  renderMarkerAMap(pointList) {
    console.log('渲染marker', pointList)
    if (!pointList) {
      throw new Error(' (renderMarkerAMap:) 点位缺失~')
    }
    let markers = []
    pointList.forEach((point, index) => {
      let labelData = {
        name: point.name,
        position: point.coordinates,
        zooms: [5, 20],
        opacity: 1,
        zIndex: 10,
        fold: true,
        icon: this.loadImages(
          require(`./assets/images/marker/${point.imageName || this.imageName}.png`)
        ),
        text: {
          // 要展示的文字内容
          content: point.name,
          // 文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
          direction: 'right',
          // 在 direction 基础上的偏移量
          offset: [0, -2],
          // 文字样式
          style: this.textStyle
        },
        extData: {
          index
        }
      }
      markers.push(new AMap.LabelMarker(labelData))
    })
    this.labelsLayer.add(markers)
    this.map.add(this.labelsLayer)
    this.map.setFitView(null, false, [100, 150, 10, 10])
  }

  loadImages(imagesMap, options) {
    return {
      // 图标类型，现阶段只支持 image 类型
      type: 'image',
      // 图片 url
      image: imagesMap,
      // 图片尺寸
      size: [25, 25],
      // 图片相对 position 的锚点，默认为 bottom-center
      anchor: 'center',
      ...options
    }
  }

  clearMapMarker() {
    this.labelsLayer.clear()
  }
}
