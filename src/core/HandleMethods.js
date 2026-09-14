import BvError from "../tools/BvError"
import { notifyMethodCall } from "../tools/devtools"

/**
 * 高精度时间戳(优先 performance,便于统计方法耗时)
 * @returns {Number}
 */
function now() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
}

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
        const raw = methods[item]

        // devtools:包装一层,把「方法被调用」上报给调试器(未安装插件时空操作)。
        // 不能用 bind —— bind 产出的函数无法在调用时插入上报逻辑。
        // 用 try/finally 保证方法抛错时也能记录本次调用。
        const traced = function (...args) {
          const started = now()
          try {
            return raw.apply(vm, args)
          } finally {
            notifyMethodCall(vm, item, args.length, now() - started)
          }
        }

        // devtools:包装函数会丢失源码,这里保留原始函数引用,
        // 供调试器展示形参个数与源码(非枚举,不影响业务逻辑)
        Object.defineProperty(traced, '__bvRaw__', {
          value: raw,
          writable: false,
          enumerable: false,
          configurable: true
        })

        newMethods[item] = traced
      } else {
        throw new BvError(`methods 配置项只能为 Function 类型的你提供了一个 ${typeof methods[item]} 类型,当前组件 ${vm.name}`)
      }
    }
    return newMethods
  } else {
    return null
  }
}
