const app = getApp()
Page({

  data: {
        pn:1,
        ps:10,
        list:[],
        hasContent:true,
        isbottom:false
  },
  onShow: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          pageHeight: res.windowHeight - 42
        });
      }
    });
    myorders.call(this);
  },
  goDetial:function(e){
   
    if (getApp().globalData.token == '') {
    
      wx.showToast({
        title: '请先登录后再尝试',
        icon: 'none',
        duration: 2000
      })
      wx.navigateBack({
        delta: 1
      })
      return;
    } else
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + e.currentTarget.dataset.id,
    })
  },
  //上拉加载
  getOrderLower: function () {
    var that = this;
    if (!that.data.isbottom) {
      var pn = this.data.pn + 1;
      this.setData({
        pn: pn
      })
      //根据openid获取报修列表
      myorders.call(this);
    }
  }
})
//维修订单列表
function myorders(){
  var that = this;
    wx.showLoading({
      title: '加载中...',
    })
  wx.request({
    url: getApp().globalData.url + 'wx/weixiu/listByAdminId',
    data: {
      pn: that.data.pn,
      ps: that.data.ps,
      adminId: getApp().globalData.currentUser.id
    },
    header: {
      'token': getApp().globalData.token
    },
    success: function (res) {
      wx.hideLoading();
      //console.log(res.data);
      var resdata = res.data.data
      if (resdata.content.length == 0 && parseInt(that.data.pn) == 1){
        that.setData({
          hasContent: false
        });
      }
      //
    
      if (resdata.content.length>0&&parseInt(that.data.pn) == 1) {
        that.setData({
          list: resdata.content,
        });
      } else if (resdata.content.length > 0&&parseInt(that.data.pn) > 1) {
        that.setData({
          list: that.data.list.concat(resdata.content),
        });
    
      } else if (resdata.content == null || resdata.content.length == 0) {
        if (parseInt(that.data.pn) > 1) {
          var pn = that.data.pn - 1;
          that.setData({
            pn: pn,
            isbottom: true
          })
          setTimeout(function () {
            wx.showToast({
              title: '全部加载完成',
              icon: 'none',
              duration: 1000
            })
          }, 200)
        }
      }
     


    }, fail(info) {

    }
  })
}