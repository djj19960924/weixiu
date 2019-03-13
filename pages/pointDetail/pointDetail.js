var app = getApp();
Page({

  data: {
    id: null,
    imgUrls: ['http://jiangda.paobapaoba.cn/10.jpg'],
    imgUrl: app.globalData.imgFileUrl,
    sb_allInfo:[],
    equipmentDetail: null,
    longitude: null,
    latitude: null
  },

  onLoad: function (options) {
    console.log('id:', options.id)
    this.setData({
      id: options.id
    })
    getEquipmentDetailById.call(this, options.id);
  },

  onShareAppMessage: function () {

  },
  intoMap: function () {
    wx.openLocation({
      longitude: Number(this.data.longitude),
      latitude: Number(this.data.latitude)
    })
  },
  getLocationInfo: function () {
    wx.navigateTo({
      url: '../cameraDetail/cameraDetail?id=' + this.data.id,
    })
    // var that = this;
    // wx.getLocation({
    //   type: "gcj02",
    //   success: function (res) {
    //     var mContent = "经度: " + res.longitude + '\r\n' + " 纬度: " + res.latitude;
    //     var longitude = res.longitude;
    //     var latitude = res.latitude;
    //     wx.showModal({
    //       title: '提示',
    //       content: mContent,
    //       confirmText: "上传",
    //       showCancel: true,
    //       confirmColor: "#398DE3",
    //       success: function (res){
    //         if (res.cancel){

    //         }else{
    //           console.log("111111")
    //           console.log("longitude:", longitude)
    //           that.setData({
    //             longitude: longitude,
    //             latitude:latitude
    //           })
    //         }
    //       }
    //     })
        
        
    //   },
    // })
  },
})

//获取小区详情
function getEquipmentDetailById(id) {
  var that = this;
  wx.request({
    url: app.globalData.url1 + "wx/getVillageId_",
    data: {
      village_id: id
    },
    success: function (res) {

      var resdata = res.data.data;
      console.log("resdata:", resdata);
      //小区信息
      var imgUrls = resdata.img_urls;
      that.setData({
        latitude: resdata.latitude,
        longitude: resdata.longitude
      })
      if (imgUrls.indexOf(",") != -1) {
        var imgUrls = "http://jiangda.paobapaoba.cn/"+ img.split(',');
        that.setData({
          imgUrls: imgUrls
        })
      } else {
        var imgUrl = []
        var img = "http://jiangda.paobapaoba.cn/" + imgUrls
        imgUrl.push(img)
        that.setData({
          imgUrls: imgUrl
        })
      }

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
        url: getApp().globalData.url1 + "wx/equipmentBase",
        data: {
          village_id: id
        },
        success: function (res) {
          var resdata = res.data.data;
          console.log("设备: ",resdata);

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