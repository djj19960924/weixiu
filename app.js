
//app.js
const app = getApp();
var amapFile = require('utils/amap-wx.js');
App({

  globalData: {
    map_key: '850cbda2ea15e9990baecfab7cf19d21',
    userInfo_wx: null,
    url: 'http://222.135.77.34:8081/rms/',
    // url: 'https://binhu.paobapaoba.cn/',
    fileUrl: 'http://jiangda.paobapaoba.cn/',
    islogin:false,
    token:'',
    currentUser:{},
    markers:[],
    latitude:null,
    longitude: null,
    citySign: 2,//使用范围标识 0 省 1 市 2区 县
  },

  
  onLaunch: function () {
    var that=this;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      
     
      }
      
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo_wx = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
   
  },
  //开始导航
  intoMap: function (item) {
    
    var that = this;
    if (item.latitude == null || item.latitude == '') {
      wx.showModal({
        title: '提示',
        content: '尚未获取位置信息',
        showCancel: false
      })
      return
    }
    wx.openLocation({
      latitude: (item.latitude) * 1,
      longitude: (item.longitude) * 1,
      //name: item.name,
      address: item.position
    })
  },
})
