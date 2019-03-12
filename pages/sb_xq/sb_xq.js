var app = getApp();
Page({

  data: {
    equipmentDetail: null,
    ip: getApp().globalData.url,
    fileUrl: getApp().globalData.fileUrl,
    imgUrls: [],
    sb_allInfo: null,
    id: null,
  },

  onLoad: function (options) {
    this.setData({ id: options.id })
    getEquipmentDetailById.call(this, options.id);
  },

  gotoSbDetail: function (e) {
    wx.navigateTo({
      url: '../sb_sb/sb_sb?id=' + e.currentTarget.dataset.id,
    })
  },
  getLocationInfo: function () {
    var that = this;
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        var mContent = "经度: " + res.longitude + '\r\n' + " 纬度: " + res.latitude;
        var longitude = res.longitude;
        var latitude = res.latitude;
        wx.showModal({
          title: '提示',
          content: mContent,
          confirmText: "上传",
          confirmColor: "#398DE3",
          success: function () {
            wx.request({
              url: getApp().globalData.url + "wx/address/update/village",
              data: {
                id: that.data.id,
                longitude: longitude,
                latitude: latitude,
              },
              success: function (res) {
                console.log(res)
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '上传位置成功',
                    icon: 'none',
                    duration: 2000
                  })
                } else {
                  wx.showToast({
                    title: '上传位置失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              fail: function () {
                wx.showToast({
                  title: '上传位置失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }
        })
      },
    })
  },
  //开始导航
  intoMap: function () {
    var that = this;
    if (!that.data.equipmentDetail.latitude || !that.data.equipmentDetail.longitude) {
      wx.showModal({
        title: '提示',
        content: '尚未获取位置信息',
        showCancel: false
      })
      return
    }
    wx.openLocation({
      latitude: (that.data.equipmentDetail.latitude) * 1,
      longitude: (that.data.equipmentDetail.longitude) * 1,
      name: that.data.equipmentDetail.name,
      address: that.data.equipmentDetail.position
    })
  },
})
//获取小区详情
function getEquipmentDetailById(id) {
  var that = this; console
  wx.request({
    url: getApp().globalData.url + "wx/getVillageId_",
    data: {
      village_id: id
    },
    success: function (res) {

      var resdata = res.data.data;
      // console.log(resdata);
      //小区信息
      var img = resdata.img_urls;
      var imgUrls = img.split(',');
      // if (imgUrls.length > 1)
      //   imgUrls.splice(imgUrls.length - 1, 1)
      that.setData({
        imgUrls: imgUrls
      })
      var equipmentDetail = {
        name: resdata.name,
        position: resdata.aname + resdata.sname + resdata.cname + resdata.name,
        longitude: resdata.longitude != null ? resdata.longitude : "",
        latitude: resdata.latitude != null ? resdata.latitude : ""
      }
      that.setData({
        equipmentDetail: equipmentDetail
      })
      //设备信息
      var list = res.data.list;
      wx.request({
        url: getApp().globalData.url + "wx/equipmentBase",
        data: {
          village_id: id
        },
        success: function (res) {
          var resdata = res.data.data;
          // console.log(resdata);

          that.setData({
            sb_allInfo: resdata
          })

        },
        fail() {
          wx.hideLoading();
        }
      })
    }
  })
}