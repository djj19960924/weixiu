var amapFile = require('../../utils/amap-wx.js');

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: "",
    longitude: "",
    files: [],//图片数组
    weizhi:'',
    id:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("options",options)
    let that = this;
    var id = options.id
    //获取当前位置
    var myAmapFun = new amapFile.AMapWX({ key: app.globalData.map_key });
    myAmapFun.getRegeo({
      success: function (data) {
        that.setData({
          weizhi: data[0].name + '(' + data[0].desc + ')',
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          id:id
        })
        //成功回调
        // console.log("wz", this.data.weizhi)
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
    })
  },

  // -------- upload start --------
  chooseImage: function (e) {
    var that = this;
    if (this.data.files.length >= 10) {
      wx.showModal({
        title: '提示',
        content: '最多添加十张图片',
      })
      return
    }
    wx.chooseImage({
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var files = that.data.files;
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          if (files.length < 10) {
            files = files.concat(res.tempFilePaths[i]);
          }
        }
        that.setData({
          files: files
        });
        console.log("files: ", that.data.files)
      }
    })
  },

  //提交
  bx_submit: function (e) {
    var that = this;
    var upLoadNumber = 0; //上传图片数组的下标数量
    var imgUrls = "";
    console.log("files", this.data.files)

    if (this.data.files.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请上传设施点图片',
        showCancel: false
      })
      return
    }
    wx.showLoading({
      title: '提交中...',
    })

    if (this.data.files.length > 0) {
      //1.上传图片 2.提交订单
      uploadImg.call(this);
    } else if (this.data.files.length == 0) {
      //1.提交订单
      submitOrder.call(this);
    }

    //上传图片
    function uploadImg() {
      console.log("filePath :", that.data.files)
      wx.uploadFile({
        url: app.globalData.url1 + 'uploadImages', //仅为示例，非真实的接口地址
        filePath: that.data.files[upLoadNumber],
        name: 'file',
        header: { "content-type": "multipart/form-data" },
        formData: {
          pathType: 'wximg',
        },
        success: function (res) {
          console.log('filePath: ', res);
          var mObject = JSON.parse(res.data);
          upLoadNumber++;
          if (imgUrls != "") {
            imgUrls = imgUrls + ";" + mObject.finalFileName;
          } else {
            imgUrls = mObject.finalFileName;
          }

          // imageIds.push(mObject.imageInfo.id);
          if (upLoadNumber == that.data.files.length) {
            console.log("图片上传完毕...");
            submitOrder.call(that);
          } else {
            uploadImg.call(that);
          }
        },
        fail: function () {
          // fail
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '提交失败!',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              }
            }
          })
        },
        complete: function () {
        }
      })
    }

    //提交订单
    function submitOrder() {
      var that = this;
      
      wx.request({
        url: app.globalData.url1 + "address/village/update",
        data: {
          id: that.data.id,
          img_urls: imgUrls,
          latitude: that.data.latitude,
          longitude: that.data.longitude
        },
        method:'post',
        success: function (res) {
          wx.hideLoading();
          if (res.data.msg == '修改成功') {
            
            var content = "恭喜您上传成功！"
            wx.showModal({
              title: '提示',
              content: content,
              confirmText: "设施列表",
              confirmColor: "#398DE3",
              cancelText: "回到首页",
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '../searchSb/searchSb',
                  })
                } else if (res.cancel) {
                  wx.redirectTo({
                    url: '../index/index',
                  })

                }
              }
            })
          }
          else {
            wx.showModal({
              title: '提示',
              content: '提交失败',
              showCancel: false
            })
          }
        },
        fail: function () {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '提交失败!',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
              }
            }
          })
        }
      })
    }
  }, 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})

function uploadImg() {
  console.log("filePath :", that.data.files)
  wx.uploadFile({
    url: app.globalData.url1 + 'uploadImages', //仅为示例，非真实的接口地址
    filePath: that.data.files[upLoadNumber],
    name: 'file',
    header: {
      "content-type": "multipart/form-data"
    },
    formData: {
      pathType: 'wximg',
    },
    success: function (res) {
      console.log('filePath: ', res);
      var mObject = JSON.parse(res.data);
      upLoadNumber++;
      if (imgUrls != "") {
        imgUrls += "," + mObject.finalFileName;
      } else {
        imgUrls = mObject.finalFileName;
      }
      console.log("imgUrls:", imgUrls)

      if (upLoadNumber == that.data.files.length) {
        console.log("图片上传完毕...");
        submitOrder.call(that);
      } else {
        uploadImg.call(that);
      }
    },
    fail: function () {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '提交失败!',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    },
    complete: function () { }
  })
}