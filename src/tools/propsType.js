import BvError from "./BvError"
import BvWarn from "./BvWarn"

// 类型判断工具函数
const type = (item) => Array.isArray(item) ? "array" : typeof item

// 合法基础类型正则（全局缓存提升性能）
const VALID_TYPE_REGEX = /^(?:string|number|boolean|symbol|undefined|object|function|array)$/

/**
 * 验证props类型配置有效性
 * @param {string} typeName - 待验证类型名
 * @param {string} componentName - 组件名
 * @throws {BvError} 非法类型时抛出
 */
const validateConfigType = (typeName, componentName) => {
  if (!VALID_TYPE_REGEX.test(typeName)) {
    throw new BvError(`propsType config 类型定义非法: ${typeName} (组件: ${componentName})`)
  }
}

/**
 * 类型验证主函数
 * @param {Object} props - 组件属性对象
 * @param {Object} config - 类型约束配置
 * @param {string} [comName="未设置"] - 组件名（可选）
 * @returns {Object} 验证后的props
 * @throws {BvError} 配置错误时抛出
 */
export default function propsType(props, config, comName = "未设置") {
  // 配置空校验
  if (Object.keys(config).length === 0) {
    throw new BvError("propsType config 不能为空 (组件: " + comName + ")")
  }

  Object.entries(config).forEach(([propName, typeConfig]) => {
    // 缺失属性警告
    if (props[propName] === undefined) {
      BvWarn(`props 缺失属性: ${propName} (组件: ${comName})`)
      return
    }

    // 多类型校验场景
    if (Array.isArray(typeConfig)) {
      // 配置类型校验
      typeConfig.forEach(type => validateConfigType(type, comName))

      // 实际类型校验
      const actualType = type(props[propName])
      if (!typeConfig.includes(actualType)) {
        BvWarn(`属性 ${propName} 类型应为 [${typeConfig.join('/')}]，实际为 ${actualType} (组件: ${comName})`)
      }
      return
    }

    // 单类型校验场景
    if (typeof typeConfig === 'string') {
      // 配置类型校验
      validateConfigType(typeConfig, comName)

      // 实际类型校验
      const actualType = type(props[propName])
      if (actualType !== typeConfig) {
        BvWarn(`属性 ${propName} 类型应为 ${typeConfig}，实际为 ${actualType} (组件: ${comName})`)
      }
    }
  })

  return props
}