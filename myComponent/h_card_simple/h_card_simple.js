// component/h_card_simple/h_card_simple.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "imgW": { // 左边图片宽度
      type: Number,
      value: 100
    },
    "imgH": { // 左边图片高度
      type: Number,
      value: 80
    },
    "imgUrl": { // 左边图片url
      type: String,
      value: '/images/rc.png'
    },
    "lineA": { // 右边第一行标题
      type: String,
      value: ''
    },
    "lineB": { // 右边第二行次要信息
      type: String,
      value: ''
    },
    "lineC": { // 右边第三行次要信息
      type: String,
      value: ''
    },
    "lineD": { // 右边第四行页脚
      type: String,
      value: ''
    },
    "lineDImg": { // 右边第四行页脚左边icon图的url
      type: String,
      value: ''
    },
    "line_tabs": { // 右边按钮行
      type: Array,
      value: []
    },
    "rightPadding": { // 整个item右侧内边距
      type: Number,
      value: 12
    },
    "zIndex": { // 整个item右侧内边距
      type: String,
      value: '-100'
    },
    defaultImgSrc: {
      type: String,
      value: '/images/rc.png'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: 0,
    height: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    finishLoad: function (e) {
      this.setData({
        imgFinish: true,
        width: '100%',
        height: '100%'
      })
    }
  }
})
