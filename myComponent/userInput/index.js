Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    title: {
      type: String,
      value: '',
    },
    placeholder: {
      type: String,
      value: ''
    },
    border:{
      type:Boolean,
      value:true
    },
    value: {
      type: String,
      value: ''
    },
    i_type: {
      type: String,
      value: 'text'
    }
  },
  data: {
    // 这里是一些组件内部数据
    value:''
  },
  methods: {
    // 这里是一个自定义方法
    listen: function (e) {
      this.setData({ value: e.detail.value})
      this.triggerEvent('listen')
    }
  }
})