import BvError from "../tools/BvError"

/**
 * 处理 methods
 * @param {ConfigMethods} methods config methods 配置项
 * @param {VM} vm vm
 * @returns {Object} new methods
 */
export default function HandleMethods(methods, vm) {
  if (Object.prototype.toString.call(methods) === '[object Object]') {
    let newMethods = new Object()
    for (let item in methods) {
      if (typeof methods[item] === 'function') {
        newMethods[item] = methods[item].bind(vm)
        // devtools:绑定后的函数会丢失源码,这里保留原始函数引用,
        // 供调试器展示形参个数与源码(非枚举,不影响业务逻辑)
        Object.defineProperty(newMethods[item], '__bvRaw__', {
          value: methods[item],
          writable: false,
          enumerable: false,
          configurable: true
        })
      } else {
        throw new BvError(`methods 配置项只能为 Function 类型的你提供了一个 ${typeof methods[item]} 类型,当前组件 ${vm.name}`)
      }
    }
    return newMethods
  } else {
    return null
  }
}