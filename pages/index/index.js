var app = getApp();
var amapFile = require('../../utils/amap-wx.js');

Page({
  data: {
    latitude: null,
    longitude: null,
    mapHeight: 300,
    markers: [],
    isLogin:false,
    currentUser:{},
  
    ip: app.globalData.url,
    
  },
  onLoad: function (options) {
    var that = this;
    //高度
    wx.getSystemInfo({
      success: function (res) {
        if((res.windowWidth/241)<(750/482)){//容器高度大于图片高度
        let imgHeight = res.windowWidth*482/750//实际显示图片高度
          that.setData({
            mapHeight: res.windowHeight - imgHeight - 85
          });
        }
        else {//容器高度小于图片高度
          that.setData({
            mapHeight: res.windowHeight - 241 - 85
          });
        }
      }
    });
  },
  onShow:function(){
    var that = this;
    // 检查用户是否登陆
    if (getApp().globalData.islogin) {//登陆
      that.setData({ isLogin: true, currentUser: getApp().globalData.currentUser})
    }

    //位置信息
    var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
    myAmapFun.getRegeo({
      success: function (data) {

        that.setData({
          latitude: data[0].latitude,
          longitude: data[0].longitude,

        })

        if (getApp().globalData.islogin) {//登陆
          mapAreas.call(that, that.data.latitude, that.data.longitude);//报修订单列表
        }
      }
    })
  },
  goMyOrder: function () {
    // 检查用户是否登陆
    if (getApp().globalData.islogin){//登陆
      wx.navigateTo({
        url: '../myOrder/myOrder',
      })
    }
    else{//未登录
      wx.showModal({
        title: '提示',
        content: '请先登陆账号',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login',
            })
          }
        }
      })
    }
  },
  goSearch:function(){
   
    // 检查用户是否登陆
    if (getApp().globalData.islogin) {//登陆
      wx.navigateTo({
        url: '../searchSb/searchSb',
      })
    }
    else {//未登录
      wx.showModal({
        title: '提示',
        content: '请先登陆账号',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login',
            })
          }
        }
      })
    }
  },
  goDetial: function (e) {
  
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
      url: '../orderDetail/orderDetail?id='+e.markerId,
    })
  },
  goLogin:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  logout:function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登陆吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: getApp().globalData.url + 'wx/weixiu/userLoginOut',
            header: {
              SESSION: getApp().globalData.token
            },
            data: {
              token: getApp().globalData.token
            },
            success: function (res) {
              console.log(res.data)
              if (res.data.code == 0 && res.data.msg == 'success') {
                that.setData({ isLogin: false, currentUser: {} });
                getApp().globalData.token = ''
                getApp().globalData.islogin = false
                getApp().globalData.currentUser = {}
                wx.showToast({
                  title: '已退出登陆',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail(data) {

            }
          })
        } else if (res.cancel) {
          
        }
      }
    })
  }
})
//获取地图上所有小区
function mapAreas(latitude, longitude) {
  var that = this;
  wx.request({
    url: getApp().globalData.url + "wx/weixiu/findOrders",
    data: {
      latitude: latitude,
      longitude: longitude,
    },
    header: {
      'SESSION': getApp().globalData.token
    },
    success: function (res) {
      if(res.data.code!=0)
      return;
  
      var list = res.data.data;
    
      var markers = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].latitude && list[i].longitude) {
          markers.push({
            iconPath: "/image/mapicon.png",
            id: list[i].id,
            latitude: list[i].latitude,
            longitude: list[i].longitude,
            width: 40,
            height: 40,
            alpha: 0.9,
            // callout: {
            //   content: '',//list[i].position
            //   color: '#FFFFFF',
            //   borderRadius: 3,
            //   padding: 5,
            //   display: 'ALWAYS',
            //   textAlign: 'center',
            //   bgColor: '#FCB4B4',
            //   // x:-30,
            //   // y:-55
            // },
          })
        }
      }
      that.setData({
        markers: markers
      })
      console.log(markers)
    }
  })
}