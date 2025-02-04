import BvError from "./BvError"
import BvWarn from "./BvWarn"

function type(item) {
  if (Array.isArray(item)) {
    return "array"
  }

  return typeof item
}

/**
 * props 类型约束
 * @param {Object} props props
 * @param {Object} config 类型配置
 * @returns {Object} props props
 */
export default function propsType(props, config) {
  if (Object.keys(config).length === 0) throw new BvError("propsType config 不能为空")

  const z = /^(?:string|number|boolean|symbol|undefined|object|function|array)$/

  for (let i in config) {
    if (props[i] === undefined) {
      BvWarn(`props 中无 ${i} 属性`)
      continue
    }
    if (Array.isArray(config[i])) {
      for (let j of config[i]) {
        if (!z.test(j)) {
          throw new BvError(`propsType config 的 ${i} 属性 ${j} 类型不正确`)
        }
      }
      if (config[i].indexOf(type(props[i])) === -1) {
        BvWarn(`props 中 ${i} 属性类型应该为 ${config[i]}`)
        continue
      }
    } else if (type(config[i]) === 'string') {
      if (!z.test(config[i])) throw new BvError(`propsType config 的 ${i} 属性 ${config[i]} 类型不正确`)
      if (type(props[i]) !== config[i]) {
        BvWarn(`props 中 ${i} 属性类型应该为 ${config[i]}`)
        continue
      }
    }
  }

  return props
}