/**
 * 注册组件
 * @param {*} Components 配置项
 * @param {VM} vm 
 */
export default function SigupComponents(Components, vm) {
  if (Components !== void 0 && Object.prototype.toString.call(Components) === '[object Object]') {
    Components.__proto__ = vm._publicComponent
    return Components
  } else {
    let newComponents = new Object()
    newComponents.__proto__ = vm._publicComponent
    return newComponents
  }
}