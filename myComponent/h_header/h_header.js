Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    platform: {
      type: String,
      value: getApp().globalData.platform
    },
    pulltext: {
      type: String,
      value: '啊 ~ 难受 ~ 别再拉我啦 ~'
    },
    top:{ // header跟页面顶部的距离
      type:String,
      value:0
    },
    back: {
      type: Boolean,
      value: true,
    },
  },
  data: {

  },
  methods: {
    back:() => {
      wx.navigateBack({
        delta:1
      })
    }
  }
})