import BvError from "./BvError"
import BvWarn from "./BvWarn"

// 准确的类型判断
function getType(value) {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (Array.isArray(value)) return "array"
  if (value instanceof Date) return "date"
  if (value instanceof RegExp) return "regexp"
  if (value instanceof Error) return "error"
  if (value instanceof Map) return "map"
  if (value instanceof Set) return "set"
  if (value instanceof Promise) return "promise"

  const type = typeof value
  if (type === 'object' && value !== null) return 'object'
  return type
}

// 可接受的类型列表
const VALID_TYPES = [
  'string', 'number', 'boolean', 'symbol',
  'undefined', 'object', 'function', 'array',
  'null', 'date', 'regexp', 'error', 'map', 'set', 'promise', 'any'
]

/**
 * 判断是否为默认值配置
 */
function isDefaultConfig(typeConfig) {
  if (typeof typeConfig !== 'object' || typeConfig === null) return false
  return 'default' in typeConfig
}

/**
 * 获取默认值
 */
function getDefaultValue(typeConfig, key, componentName) {
  if (!isDefaultConfig(typeConfig)) return undefined

  const { default: defaultValue } = typeConfig

  // 如果默认值是函数，执行它获取值
  if (typeof defaultValue === 'function') {
    try {
      return defaultValue()
    } catch (err) {
      BvWarn(`获取 ${key} 的默认值失败：${err.message}，当前组件：${componentName}`)
      return undefined
    }
  }

  return defaultValue
}

/**
 * 获取类型列表（兼容 'type' 和 'types'）
 */
function getTypes(typeConfig) {
  if (Array.isArray(typeConfig)) return typeConfig
  if (typeof typeConfig === 'string') return [typeConfig]
  if (typeof typeConfig === 'object' && typeConfig !== null) {
    // 兼容 'type' 和 'types' 两种写法
    const typeField = typeConfig.types || typeConfig.type
    if (typeField) {
      return Array.isArray(typeField) ? typeField : [typeField]
    }
    if ('default' in typeConfig) {
      return ['any']  // 有默认值但没有指定类型，默认为 any
    }
  }
  return ['any']
}

/**
 * 检查值是否匹配类型
 */
function checkType(value, types, key, componentName, silent) {
  const actualType = getType(value)

  for (const type of types) {
    // 自定义验证器
    if (typeof type === 'function') {
      try {
        if (type(value)) {
          return { valid: true, actualType }
        }
      } catch (err) {
        if (!silent) {
          BvWarn(`自定义验证器执行出错：${err.message}`)
        }
      }
      continue
    }

    // 'any' 类型总是通过
    if (type === 'any') {
      return { valid: true, actualType }
    }

    // 类型匹配
    if (actualType === type) {
      return { valid: true, actualType }
    }
  }

  return { valid: false, actualType }
}

/**
 * props 类型约束（支持默认值）
 * 
 * 规则：
 * 1. 有默认值的属性：未传入时静默使用默认值，不报错，不警告
 * 2. 无默认值的属性：未传入时抛出错误（必需属性）
 * 3. 类型不匹配时：根据 strict 模式决定是否报错
 * 
 * @param {Object} props - props 对象
 * @param {Object} config - 类型配置
 * @param {string} [comName] - 组件名
 * @param {Object} [options] - 配置选项
 * @param {boolean} [options.strict=false] - 严格模式（类型错误时抛出异常）
 * @param {boolean} [options.silent=false] - 静默模式（不输出警告）
 * @param {boolean} [options.throwError=true] - 是否抛出错误
 * @param {boolean} [options.applyDefault=true] - 是否应用默认值
 * @param {Function} [options.customValidator] - 自定义验证函数
 * @param {boolean} [options.requiredByDefault=false] - 默认所有属性为必需（无默认值时）
 * @param {boolean} [options.silentDefault=true] - 静默使用默认值（不输出警告）
 * @returns {Object} 返回处理后的 props 对象
 */
export default function propsType(props, config, comName, options = {}) {
  const {
    strict = false,
    silent = false,
    throwError = true,
    applyDefault = true,
    customValidator = null,
    requiredByDefault = true,
    silentDefault = true  // 🔑 新增：静默使用默认值，不输出警告
  } = options

  const componentName = typeof comName === 'string' ? comName : '未命名组件'
  const configKeys = Object.keys(config)

  // 检查配置是否为空
  if (configKeys.length === 0) {
    const error = new BvError(`propsType config 不能为空，当前组件：${componentName}`)
    if (throwError) throw error
    return props
  }

  // 创建 props 的副本（避免修改原始对象）
  const result = { ...props }

  // 第一轮：验证配置并处理默认值
  for (const key of configKeys) {
    const typeConfig = config[key]
    const types = getTypes(typeConfig)

    // 验证配置中的类型是否合法
    for (const t of types) {
      if (typeof t === 'function') continue
      if (t !== 'any' && !VALID_TYPES.includes(t)) {
        const error = new BvError(
          `propsType config 的 ${key} 属性包含非法类型 "${t}"，` +
          `当前组件：${componentName}`
        )
        if (throwError) throw error
      }
    }

    // 🔑 处理默认值（静默模式，不输出警告）
    if (applyDefault && (result[key] === undefined || result[key] === null)) {
      const hasDefault = isDefaultConfig(typeConfig)
      if (hasDefault) {
        const defaultVal = getDefaultValue(typeConfig, key, componentName)
        if (defaultVal !== undefined) {
          result[key] = defaultVal
          // 🔑 只有在非静默模式下才输出警告
          if (!silent && !silentDefault) {
            BvWarn(
              `props 中无 ${key} 属性，` +
              `使用默认值：${typeof defaultVal === 'object' ? JSON.stringify(defaultVal) : defaultVal}，` +
              `当前组件：${componentName}`
            )
          }
        }
      }
    }
  }

  // 第二轮：检查必需属性（无默认值且未传入）
  const missingRequired = []
  for (const key of configKeys) {
    const typeConfig = config[key]
    const hasDefault = isDefaultConfig(typeConfig)
    const value = result[key]

    // 无默认值且值为 undefined 且 requiredByDefault 为 true
    if (!hasDefault && (value === undefined || value === null) && requiredByDefault) {
      missingRequired.push(key)
    }
  }

  // 如果有缺失的必需属性，抛出错误
  if (missingRequired.length > 0 && throwError) {
    const error = new BvError(
      `组件 ${componentName} 缺少必需的 props：${missingRequired.join(', ')}\n` +
      `提示：请为这些属性传入值，或在配置中添加 default 默认值`
    )
    throw error
  }

  // 严格模式：检查未定义的 props（使用原始 props 检查）
  if (strict) {
    const propKeys = Object.keys(props)
    const extraProps = propKeys.filter(key => !configKeys.includes(key))
    if (extraProps.length > 0) {
      const error = new BvError(
        `组件 ${componentName} 接收到未定义的 props：${extraProps.join(', ')}`
      )
      if (throwError) throw error
    }
  }

  // 第三轮：类型检查
  const errors = []

  for (const key of configKeys) {
    const value = result[key]
    const typeConfig = config[key]
    const types = getTypes(typeConfig)

    // 如果有默认值配置且值为 undefined，跳过检查（使用默认值）
    if (value === undefined && isDefaultConfig(typeConfig)) {
      continue
    }

    // 如果值为 undefined 且没有默认值，已经在上面的必需检查中处理了
    if (value === undefined || value === null) {
      continue
    }

    // 检查类型
    let { valid, actualType } = checkType(value, types, key, componentName, silent)

    // 自定义验证器（全局）
    if (!valid && customValidator && typeof customValidator === 'function') {
      try {
        valid = customValidator(key, value, config)
      } catch (err) {
        if (!silent) {
          BvWarn(`自定义验证器出错：${err.message}`)
        }
      }
    }

    // 验证失败处理
    if (!valid) {
      const expectedTypes = types.map(t =>
        typeof t === 'function' ? 'custom' : t
      ).join(' | ')

      const message =
        `props 中 ${key} 属性类型错误，` +
        `期望：${expectedTypes}，` +
        `实际：${actualType}，` +
        `当前组件：${componentName}`

      errors.push({ key, message })

      if (!silent) {
        BvWarn(message)
      }
    }
  }

  // 如果有类型错误且抛出模式开启（严格模式）
  if (errors.length > 0 && throwError && strict) {
    const errorMessages = errors.map(e => e.message).join('\n')
    throw new BvError(`Props 类型校验失败：\n${errorMessages}`)
  }

  return result
}
