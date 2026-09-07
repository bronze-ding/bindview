import Component from "./Component"
import { __DEV__ } from "../tools/devMode"

import config from "../../package.json"

class Bindview extends Component {
  constructor(config) {
    // 版本横幅仅在开发模式打印(P2.6),生产构建 __DEV__ 为 false 自动裁剪
    if (__DEV__ && Bindview.displayVer) {
      console.log(`%c bindview %c v${Bindview.version} `,
        'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
        'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0; color: #fff',
        '\n',
        'https://github.com/bronze-ding/bindview');
    }
    super(config)
  }
  static version = config.version ? config.version : '❓🤔'
  static displayVer = true

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
  /**
   * 添加原型属性
   * @param  {...any} item 
   */
  static proto(...item) {
    Component.proto(...item)
  }
}

export default Bindview