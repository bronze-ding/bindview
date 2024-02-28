import BvWarn from "../tools/BvWarn"

/**
 * 加载插件
 * @param {Function|Array<Function|Object>|Object} unit 插件或插件数组或普通对象
 */
export default function Use(unit) {
  let Component = this
  if (typeof unit === 'function') {
    unit(Component)
  } else if (Array.isArray(unit)) {
    for (let item of unit) {
      if (typeof item === 'function') {
        item(Component)
      } else {
        if (Object.prototype.toString.call(item) === '[object Object]' && typeof item._install_ === 'function') {
          item._install_(Component)
        } else {
          BvWarn(`对象插件是一个Bindview插件对象和函数`)
          continue
        }
      }
    }
  } else if (Object.prototype.toString.call(unit) === '[object Object]' && typeof unit._install_ === 'function') {
    unit._install_(Component)
  } else {
    BvWarn(`插件应该为 Function 类型或 Array<Function> 类型或Bindview插件对象`)
  }
}