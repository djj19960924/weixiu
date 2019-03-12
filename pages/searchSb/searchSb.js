var app = getApp();
var amapFile = require('../../utils/amap-wx.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight:561,
    current: 'tab1',
    latitude: null,
    longitude: null,
    markers: [],
    streetList: [],
    communityList: [],
    objectMultiArray: [],
    multiIndex: [0, 0, 0],
    villageList:[],
    imgUrl: getApp().globalData.fileUrl
  },

  onLoad:function(){
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          pageHeight: res.windowHeight - 42
        });
      }
    });
    var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
    myAmapFun.getRegeo({
      success: function (data) {
        that.setData({
          latitude: data[0].latitude,
          longitude: data[0].longitude
        })
      },
      fail: function (info) {
        console.log(info)
      }
    });

    ///location.call(this);
    //获取用户当前位置
    mapAreas.call(this);
  },

  handleChangeTab({ detail }) {
    if (detail.key == 'tab2' && this.data.villageList.length==0) {
      getAllArea.call(this);
    }
  
    this.setData({
      // sliderOffset: e.currentTarget.offsetLeft,
      // activeIndex: e.currentTarget.id,
      markers: this.data.markers,
      current: detail.key
    });
  },
  //开始导航
  intoMap: function (e) {
    var item=e.currentTarget.dataset.id;
    var that = this;
    if (item.latitude == null || item.latitude=='' ) {
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
      name: item.name,
      address: item.position
    })
  },
  goseesb:function(e){
    var id = e.markerId;
    if(id == undefined)
      id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../sb_xq/sb_xq?id=' +id,
    })
  },
  goDaohang:function(){
    console.log("导航")
  },
  //三级联动
  bindMultiPickerColumnChange: function (e) {
    var that = this;
    var newStreetList = [], newCommunityList = [];
    var index = e.detail.value;
    var areaList = that.data.objectMultiArray[0];
    var streetList = that.data.streetList;
    var communityList = that.data.communityList;
    switch (e.detail.column) {
      //第一列改变
      case 0:
        newStreetList = [];
        for (var i = 0; i < streetList.length; i++) {
          if (streetList[i].areaId == areaList[index].id) {
            newStreetList.push(streetList[i])
          }
        }
        newCommunityList = [];
        for (var j = 0; j < communityList.length; j++) {
          if (newStreetList.length > 0) {
            if (communityList[j].streetId == newStreetList[0].id) {
              newCommunityList.push(communityList[j])
            }
          }
        }
        that.setData({
          objectMultiArray: [areaList, newStreetList, newCommunityList]
        })
        break;
      //第二列改变
      case 1:
        newStreetList = that.data.objectMultiArray[1]
        for (var i = 0; i < communityList.length; i++) {
          if (communityList[i].streetId == newStreetList[index].id) {
            newCommunityList.push(communityList[i])
          }
        }
        that.setData({
          objectMultiArray: [areaList, newStreetList, newCommunityList]
        })
        break;
    }
  },
  //picker确定最终值改变
  bindMultiPickerChange: function (e) {
    //console.log(e.detail.value);
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      multiIndex: e.detail.value
    })
    //如果没有选到第三级社区
    if (!that.data.objectMultiArray[2][e.detail.value[2]]) {
      wx.hideLoading();
      that.setData({
        villageList: []
      })
      return;
    }

    //获取小区列表
    wx.request({
      url: getApp().globalData.url + "wx/address/village",
      data: {
        communityId: that.data.objectMultiArray[2][e.detail.value[2]].id,
        organizeId: getApp().globalData.currentUser.organizeId
      },
      success: function (res) {
        var resdata=res.data.data;
        var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
        wx.getLocation({
          type: "gcj02",
          success: function (aa) {
            if(resdata ==undefined)
              resdata=[];
            var villageList = [];
            if (resdata.length > 0) {
              recurve(resdata.length - 1, res, villageList, aa)
            }
            else {
              wx.hideLoading();
              that.setData({
                villageList: []
              })
            }
            //递归计算路径距离时间
            function recurve(b, res, villageList, aa) {
             // console.log(villageList);
              if (b == 0) {
                var arr = res.data.data[b].img_urls.split(',');
                res.data.data[b].img_urls = arr[0];
                if (res.data.data[b].longitude) {//有位置信息
                  myAmapFun.getDrivingRoute({
                    origin: aa.longitude + ',' + aa.latitude,
                    destination: res.data.data[b].longitude + ',' + res.data.data[b].latitude,
                    success: function (response) {
                      if (response.paths[0].distance >= 100) {
                        res.data.data[b].distance = response.paths[0].distance / 1000 + "km";
                      }
                      else {
                        res.data.data[b].distance = " <100m";
                      }
                      res.data.data[b].duration = (response.paths[0].duration / 60).toFixed(0);
                      villageList.unshift(res.data.data[b])
                     
                      that.setData({
                        villageList: villageList
                      })
                      wx.hideLoading();
                     
                      return;
                    }
                  })
                }
                else {//没有位置信息
                  res.data.data[b].distance = " -- km";
                  res.data.data[b].duration = " -- ";
                  villageList.unshift(res.data.data[b])
                  that.setData({
                    villageList: villageList
                  })
                  wx.hideLoading();
                  return;
                }
              }
              else {
              
                if (res.data.data[b].img_urls != null && res.data.data[b].img_urls.length>0){
                  var arr = res.data.data[b].img_urls.split(',');
                  res.data.data[b].img_urls = arr[0];
                }
                
                if (res.data.data[b].longitude) {//有位置信息
                  myAmapFun.getDrivingRoute({
                    origin: aa.longitude + ',' + aa.latitude,
                    destination: res.data.data[b].longitude + ',' + res.data.data[b].latitude,
                    success: function (response) {
                     
                      if (response.paths[0].distance >= 100) {
                        res.data.data[b].distance = response.paths[0].distance / 1000 + "km";
                      }
                      else {
                        res.data.data[b].distance = " <100m";
                      }
                     
                      res.data.data[b].duration = (response.paths[0].duration / 60).toFixed(0);
                      villageList.unshift(res.data.data[b])
                
                      recurve(b - 1, res, villageList, aa)
                    }
                  })
                }
                else {//没有位置信息
                  res.data.data[b].distance = " -- km";
                  res.data.data[b].duration = " -- ";
                  villageList.unshift(res.data.data[b]);
                  recurve(b - 1, res, villageList, aa)
                }
              }
            }
          },
        })
      }
    })
  },
  //上拉加载
  getEquipmentLower: function () {
    console.log(11111);
    var that = this;
    if (!that.data.isBottom) {
      var pageNo = this.data.pageNo + 1;
      this.setData({
        pageNo: pageNo
      })
      myjifen.call(this);
    }
  },
})
 //获取用户当前位置
function location(){
  var that=this;
  wx.getLocation({
    type: "gcj02",
    success: function (res) {
      that.setData({
        longitude: res.longitude,
        latitude: res.latitude
      })
    },
  })
}
//获取地图上所有小区
function mapAreas(){
 var that=this;
  wx.request({
    url: getApp().globalData.url+ "wx/address/villageList",
    data:{
      citySign: getApp().globalData.citySign,
      organizeId: getApp().globalData.currentUser.organizeId,
    },
    success: function (res) {
      var list = res.data.data;
      //console.log(list);
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
            //   content: list[i].name,
            //   color: '#FFFFFF',
            //   borderRadius: 3,
            //   padding: 5,
            //   display: 'ALWAYS',
            //   textAlign: 'center',
            //   bgColor: '#F5DB55',
            //   // x:-30,
            //   // y:-55
            // },
          })
        }
      }
      that.setData({
        markers: markers
      })
    }
  })
}

function getAllArea() {
  wx.showLoading({
    title: '加载中...',
  })
  var that = this;
  wx.request({
    url: getApp().globalData.url + "wx/xmList",
    data: {
      citySign: getApp().globalData.citySign,
      organize_id: getApp().globalData.currentUser.organizeId,
    },
    success: function (res) {
      var retdata = res.data.data;
    // console.log(retdata);
      var areaList = retdata.area;
      var streetList = retdata.street;
      var communityList = retdata.community;
      var streetList_1 = [];
      var communityList_1 = [];
     // console.log(streetList);
      // for (var i = 0; i < streetList.length; i++) {
      //   if (streetList[i].areaId == areaList[0].id) {
      //     streetList_1.push(streetList[i])
      //   }
      // }
      // for (var j = 0; j < communityList.length; j++) {
      //   if (communityList[j].streetId == streetList_1[0].id) {
      //     communityList_1.push(communityList[j])
      //   }
      // }
      that.setData({
        objectMultiArray: [areaList, streetList, communityList],
        // objectMultiArray: [areaList, streetList_1, communityList_1],
        streetList: streetList,
        communityList: communityList,
      })

      //如果没有选到第三级社区
      if (!that.data.objectMultiArray[2][0]) {
        wx.hideLoading();
        that.setData({
          villageList: []
        })
        return;
      }
    
      //获取第一个小区列表
      wx.request({
        url: getApp().globalData.url + "wx/address/village",
        data: {
          communityId: that.data.objectMultiArray[2][0].id,
          organizeId: getApp().globalData.currentUser.organizeId
        },
        success: function (res) {
         var retdata=res.data;
         //console.log(retdata);
          var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
          wx.getLocation({
            type: "gcj02",
            success: function (aa) {
             
              var villageList = [];
              if (retdata.code == 0 && retdata.data.length > 0) {
               
                recurve(retdata.data.length - 1, res, villageList, aa)
              }
              else {
                wx.hideLoading();
                that.setData({
                  villageList: []
                })
              }
              //递归计算路径距离时间
              function recurve(b, res, villageList, aa) {
               
                if (b == 0) {
                  if (res.data.data[b].img_urls != null && res.data.data[b].img_urls.length > 0) {
                   
                  var arr = res.data.data[b].img_urls.split(',');
                  res.data.data[b].img_urls = arr[0];
                  }
                  if (res.data.data[b].longitude) {//有位置信息
                    myAmapFun.getDrivingRoute({
                      origin: aa.longitude + ',' + aa.latitude,
                      destination: res.data.data[b].longitude + ',' + res.data.data[b].latitude,
                      success: function (response) {
                        if (response.paths[0].distance >= 100) {
                          res.data.data[b].distance = response.paths[0].distance / 1000 + "km";
                        }
                        else {
                          res.data.data[b].distance = " <100m";
                        }
                        res.data.data[b].duration = (response.paths[0].duration / 60).toFixed(0);
                        villageList.unshift(res.data.data[b])
                        that.setData({
                          villageList: villageList
                        })
                        wx.hideLoading();
                        return;
                      }
                    })
                  }
                  else {//没有位置信息
                    res.data.data[b].distance = " -- km";
                    res.data.data[b].duration = " -- ";
                    villageList.unshift(res.data.data[b])
                    that.setData({
                      villageList: villageList
                    })
                    wx.hideLoading();
                    return;
                  }
                }
                else {
                  if (res.data.data[b].img_urls != null && res.data.data[b].img_urls.length > 0) {
                   
                    var arr = res.data.data[b].img_urls.split(',');
                    res.data.data[b].img_urls = arr[0];
                  }
                  if (res.data.data[b].longitude) {//有位置信息
                    myAmapFun.getDrivingRoute({
                      origin: aa.longitude + ',' + aa.latitude,
                      destination: res.data.data[b].longitude + ',' + res.data.data[b].latitude,
                      success: function (response) {
                        if (response.paths[0].distance >= 100) {
                          res.data.data[b].distance = response.paths[0].distance / 1000 + "km";
                        }
                        else {
                          res.data.data[b].distance = " <100m";
                        }
                        res.data.data[b].duration = (response.paths[0].duration / 60).toFixed(0);
                        villageList.unshift(res.data.data[b])
                        console.log("递归++")
                        recurve(b - 1, res, villageList, aa)
                      }
                    })
                  }
                  else {//没有位置信息
                    res.data.data[b].distance = " -- km";
                    res.data.data[b].duration = " -- ";
                    villageList.unshift(res.data.data[b])
                    console.log("递归++")
                    recurve(b - 1, res, villageList, aa)
                  }
                }
              }
            },
          })
        }
      })
    }
  })
}
