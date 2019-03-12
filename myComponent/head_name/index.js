Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    img: {
      type: String,
      value: '',
    },
    name: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: '#9D9D9D'
    },
    width: {
      type: String,
      value: '200'
    }
  },
  data: {
    // 这里是一些组件内部数据
    value:''
  },
  methods: {
    // 这里是一个自定义方法
    
  }
})