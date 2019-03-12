Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    icon: {
      type: String,
      value: '',
    },
    text: {
      type: String,
      value: '',
    },
    border: {
      type: Boolean,
      value: true,
    },
    color: {
      type: String,
      value: '#80848f',
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {
      
    }
  },
  methods: {
    // 这里是一个自定义方法
    goto:function(){
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('click', myEventDetail, myEventOption)
    }
  }
})