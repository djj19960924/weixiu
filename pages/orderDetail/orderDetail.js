const app = getApp()
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
Page({
  data: {
    order:null,
    imgUrlIp: getApp().globalData.fileUrl ,
    fixName:'开始维修',
    clicktimes:0,
    id:null,
  },
  onLoad: function (options) {
    getRepairListDetailById.call(this,options.id);
    this.setData({id:options.id})
  },
  intoMap:function(e){
    var item = e.currentTarget.dataset.id;
    getApp().intoMap(item);
  },
  startFix: function (e) {
    var order = this.data.order; 
    var id = e.currentTarget.dataset.id;
    var that = this;

    if(order.type == 0){//待维修
      wx.showModal({
        title: '提示',
        content: '确定去维修？',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: getApp().globalData.url + 'wx/completeFix',
              header: {
                'token': getApp().globalData.token
              },
              data: {
                id: id,
                type: 1,
              },
              success: function (res) {
                wx.hideLoading();
                wx.showToast({
                  title: '修改状态成功',
                  icon: 'none',
                  duration: 2000
                })
                getRepairListDetailById.call(that, that.data.id);
              },
              fail: function () {
                wx.hideLoading();

              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } 
    if (order.type == 1) {//维修中
      wx.showModal({
        title: '提示',
        content: '确定已经维修完成？',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: getApp().globalData.url + 'wx/completeFix',
              header: {
                // 'SESSION': getApp().globalData.token
                'token':getApp().globalData.token
              },
              data: {
                id: id,
                type: 2,
              },
              success: function (res) {
                wx.hideLoading();
                wx.showToast({
                  title: '修改状态成功',
                  icon: 'none',
                  duration: 2000
                })
                getRepairListDetailById.call(that, that.data.id);
              },
              fail: function () {
                wx.hideLoading();

              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }

  },
  //播放声音
  play: function (e) {
    console.log(e.currentTarget.dataset.voiceurl);
    innerAudioContext.autoplay = true;

    innerAudioContext.src = e.currentTarget.dataset.voiceurl,
      innerAudioContext.play(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

  },
  //预览
  previewImg: function (e) {
    let images = this.data.order.images;
    for (let i = 0; i < images.length; i++) {
      if (images[i].indexOf('http') > -1) {
        break;
      }
      images[i] = this.data.imgUrlIp + images[i]
    }
    wx.previewImage({
      current: e.currentTarget.dataset.imgurl,
      urls: images
    })
  }
})
function getRepairListDetailById(id) {
  var that = this;
  wx.showLoading({
    title: '加载中...',
  })
  wx.request({
    url: getApp().globalData.url + "wx/repairDetailWx",
    header: {
      'token': getApp().globalData.token
    },
    data: {
      id: id,
    },
    success: function (res) {

      var resdata = res.data.data;
       //console.log(resdata);
      wx.hideLoading();
      //console.log(mOrderList);
      that.setData({
        order: resdata,
      })
      // console.log(that.data.order);
    },
    fail: function () {
      wx.hideLoading();

    }
  })
}