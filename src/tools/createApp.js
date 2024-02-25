import BvWarn from "./BvWarn";
import Component from "../core/Component";

const isComponent = (Component) => (Component.render !== void 0 && typeof Component.render === 'function')

/**
 * 创建组件实例
 * @param {*} config 配置项
 * @param {*} props props
 * @returns vm
 */
export default function createApp(config, props) {
  if (typeof config === 'function') {
    let runConfig = config(Object.prototype.toString.call(props) === '[object Object]' ? props : {})
    runConfig.el = void 0
    let App = new Component(runConfig)
    if (Object.prototype.toString.call(props) === '[object Object]' && props.ref && typeof props.ref === 'function') {
      props.ref(App)
    }
    return App
  } else if (isComponent(config)) {
    if (props !== void 0) {
      BvWarn(`使用 createApp 创建实例时,函数组件才能添加 props, Components Name: ${config.name}`)
    }
    config.el = void 0
    return new Component(config)
  }
}