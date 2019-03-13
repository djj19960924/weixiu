var amapFile = require('../../utils/amap-wx.js');
var app = getApp();

Page({
  data: {
    objectMultiArray: [],
    streetList: [],
    communityList: [],
    multiIndex: [0, 0, 0],
    villageList: [],
    latitude: null,
    longitude: null,
    imgUrl: getApp().globalData.imgFileUrl
  },

  onLoad: function (options) {
    // 获取滚动区域高度
    let query = wx.createSelectorQuery()
    wx.getSystemInfo({
      success: res => {
        query.selectAll('.box_top').boundingClientRect(rect => {
          let heightAll = 0;
          rect.map((currentValue, index, arr) => {
            heightAll = heightAll + currentValue.height
          })
          this.setData({
            scrollheight: res.windowHeight - heightAll
          })
        }).exec();
      }
    })
    getAreas.call(this);
    getAllArea.call(this);
  },

  onShareAppMessage: function () {

  },
  goDetail: function (e) {

    var id = e.currentTarget.dataset.item.id
    console.log('id1:', id)
    wx.navigateTo({
      url: '../pointDetail/pointDetail?id=' + id,
    })
  },

  daohang: function (e) {
    wx.openLocation({
      longitude: Number(e.target.dataset.longitude),
      latitude: Number(e.target.dataset.latitude),
    })
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
        organizeId: getApp().globalData.organize_id
      },
      success: function (res) {
        console.log('village:', res.data)
        var resdata = res.data.data;
        var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
        wx.getLocation({
          type: "gcj02",
          success: function (aa) {
            if (resdata == undefined)
              resdata = [];
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
              // console.log('bbb:',b)
              // console.log(villageList);
              if (b == 0) {
                // console.log("1111",res.data.data[b])

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
  // getEquipmentLower: function () {
  //   console.log(11111);
  //   var that = this;
  //   if (!that.data.isBottom) {
  //     var pageNo = this.data.pageNo + 1;
  //     this.setData({
  //       pageNo: pageNo
  //     })
  //     myjifen.call(this);
  //   }
  // },

})

//获取用户当前位置
function location() {
  var that = this;
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
function getAreas() {
  var that = this;
  wx.request({
    url: getApp().globalData.url + "wx/address/villageList",

    data: {
      citySign: getApp().globalData.citySign,
      organizeId: getApp().globalData.organize_id,
    },
    success: function (res) {
      var list = res.data.data;
      console.log("所有小区列表: ", list);
      // that.setData({
      //   villageList : list
      // })

    }
  })
}

function getAllArea() {
  console.log("city:", app.globalData.citySign)
  wx.showLoading({
    title: '加载中',
  })
  var that = this;
  wx.request({
    url: 'https://tc.whtiyu.cn/admin/dept/tree2',
    data: {
      citySign: getApp().globalData.citySign,
      organize_id: getApp().globalData.organize_id,
    },
    success: function (res) {
      console.log("区域列表: ", res)
      var retdata = res.data.data.data;
      // console.log(retdata);
      var areaList = retdata.area;
      var streetList = retdata.street;
      var communityList = retdata.community;
      var streetList_1 = [];
      var communityList_1 = [];

      that.setData({
        objectMultiArray: [areaList, streetList, communityList],
        streetList: streetList,
        communityList: communityList,
      })

      console.log("第三级社区: ", that.data.objectMultiArray[2][0])
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
          organizeId: getApp().globalData.organize_id
        },
        success: function (res) {
          var retdata = res.data;
          console.log("获取第一个小区列表: ", retdata);
          var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
          wx.getLocation({
            type: "gcj02",
            success: function (aa) {
              console.log('aaa: ', aa)
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
              //递归每个小区的计算路径距离时间
              function recurve(b, res, villageList, aa) {

                console.log('bbbbbbbb', b)
                console.log('res.data.data: ', res.data.data)
                if (b == 0) {

                  if (res.data.data[b].img_urls != null && res.data.data[b].img_urls.length > 0) {

                    var arr = res.data.data[b].img_urls.split(',');
                    res.data.data[b].img_urls = arr[0];
                  }
                  if (res.data.data[b].longitude) {//有位置信息
                    console.log('111111111')
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

