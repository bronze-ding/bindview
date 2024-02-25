import BvError from "../tools/BvError"

/**
 * 处理 methods
 * @param {ConfigMethods} methods config methods 配置项
 * @param {VM} vm vm
 * @returns {Object} new methods
 */
export default function HandleMethods(methods, vm) {
  if (Object.prototype.toString.call(methods) === '[object Object]' && Object.keys(methods).length > 0) {
    let newMethods = new Object()
    for (let item in methods) {
      if (typeof methods[item] === 'function') {
        newMethods[item] = methods[item].bind(vm)
      } else {
        throw new BvError(`methods 配置项只能为 Function 类型的你提供了一个 ${typeof methods[item]} 类型,当前组件 ${vm.name}`)
      }
    }
    return newMethods
  } else {
    return null
  }
}