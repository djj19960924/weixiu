const app = getApp()
Page({
  data: {
    account:'',
    pwd:'',
  },
  onLoad: function (options) {
  
  },

  listenAccount: function (e) {
    let that = this;
    that.setData({
      account: this.selectComponent("#account").data.value
    })
  },
  listenPwd: function (e) {
    let that = this;
    that.setData({
      pwd: this.selectComponent("#pwd").data.value
    })
  },
  ok:function(e){
    let that = this;
    wx.request({
      url: getApp().globalData.url+'wx/weixiu/userLogin',
     
      data:{
        name: this.data.account,
        pass: this.data.pwd
      },
      success:function(data){
        //console.log(data.data)
        if (data.data.code==0){
          if (data.data.data.code == 200) {
            getApp().globalData.islogin = true;
            getApp().globalData.currentUser = data.data.data.admin;
            getApp().globalData.token = data.data.data.token;
            wx.navigateBack({
              delta: 1
            })
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '账号密码错误',
              icon: 'none',
              duration: 2000
            })
          }
        }else{
          wx.showToast({
            title: '账号密码错误',
            icon: 'none',
            duration: 2000
          })
        }
           
      },
      fail(data){
        
      }
    })
    
  
  },

})