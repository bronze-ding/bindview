import Component from "./Component"

class Bindview extends Component {
  constructor(config) {
    super(config)
    if (Bindview.dispalyVer) {
      console.log(`%c Bindview.js %c v${Bindview.version} `,
        'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
        'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0; color: #fff',);
    }
  }
  static version = "3.0.0"
  static dispalyVer = true

  /**
   * 挂载全局组件
   * @param  {...any} item 
   */
  static components(...item) {
    Component.components(...item)
  }
  /**
   * 加载插件
   * @param {Function|Array<Function|object>|Object} unit 插件或插件数组
   */
  static use(unit) {
    Component.use(unit)
  }
}

export default Bindview