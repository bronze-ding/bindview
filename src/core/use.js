import BvWarn from "../tools/BvWarn"

/**
 * 加载插件
 * @param {Function|Array<Function|Object>|Object} unit 插件或插件数组或普通对象
 */
export default function Use(unit) {
  let component = this
  if (typeof unit === 'function') {
    unit(component)
  } else if (Array.isArray(unit)) {
    for (let item of unit) {
      if (typeof item === 'function') {
        item(component)
      } else {
        if (typeof item.name === 'string' && Object.prototype.toString.call(item.unit) === '[object Object]') {
          component.prototype[item.name] = item.unit
        } else {
          BvWarn(`对象插件应以 { name : String, unit : unitObject } 的方式注册`)
          continue
        }
      }
    }
  } else if (Object.prototype.toString.call(unit) === '[object Object]') {
    if (typeof unit.name === 'string' && Object.prototype.toString.call(unit.unit) === '[object Object]') {
      component.prototype[unit.name] = unit.unit
    } else {
      BvWarn(`对象插件应以 { name:String,unit:unitObject } 的方式注册`)
    }
  } else {
    BvWarn(`插件应该为 Function 类型或 Array<Function> 类型或普通 Object 类型`)
  }
}