Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    text: {//文字
      type: String,
      value: '',
    },
    left: {//左图
      type: String
    },
    right: {//右图
      type: String
    },
    top: {//上边距
      type: String,
      value: '0'
    },
    bottom: {//下边距
      type: String,
      value: '0'
    },
    border: {//边框
      type: Boolean,
      value: true
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {
      
    }
  },
  methods: {
    // 这里是一个自定义方法
    customMethod: function () { }
  }
})