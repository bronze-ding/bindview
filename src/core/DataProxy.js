import { queueJob } from "./scheduler"

/**
 * 数组变异方法:拦截后直接在原始数组上执行一次,
 * 避免按索引逐个触发 set 导致的多次入队,并统一触发一次更新
 * (配合调度器 Set 去重,同 tick 多次 push 只产生一次 flush)
 */
const ARRAY_MUTATION_METHODS = new Set([
  'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'
])

/**
 * 判断值是否为需要做响应式代理的“源”(普通对象或数组)
 * @param {*} value
 * @returns {Boolean}
 */
function isReactiveSource(value) {
  return Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 递归为对象/数组创建(缓存的)响应式代理
 * 同一原始对象只创建一次 Proxy,保证嵌套读取返回稳定引用(P1.5)
 * @param {Component} vm 组件实例
 * @param {Object|Array} target 原始对象
 * @returns {Proxy}
 */
function createReactiveProxy(vm, target) {
  // 每个 vm 拥有独立的代理缓存,组件销毁后可整体被 GC
  const cache = vm._proxyCache || (vm._proxyCache = new WeakMap())

  let proxy = cache.get(target)
  if (proxy !== void 0) return proxy

  const handlers = {
    get(t, key, receiver) {
      const value = Reflect.get(t, key, receiver)

      // 数组变异方法拦截:原始数组上执行一次 + 一次更新
      if (Array.isArray(t) && typeof value === 'function' && ARRAY_MUTATION_METHODS.has(key)) {
        const original = Array.prototype[key]
        return function (...args) {
          const result = original.apply(t, args)
          queueJob(vm)
          return result
        }
      }

      // 嵌套对象 / 数组:返回缓存的代理,避免每次 get 新建 Proxy
      if (isReactiveSource(value)) {
        return createReactiveProxy(vm, value)
      }
      return value
    },
    set(target, key, value, receiver) {
      // 判断新数据是否和旧数据相同
      // 相同数据不需要设置
      if (receiver[key] === value) return true

      // 记录旧长度(仅对数组 length 操作有意义)
      const oldLength = (Array.isArray(target) && key === 'length') ? target.length : null

      let res = Reflect.set(target, key, value, receiver)

      // 数组 length:长度真实发生变化时才触发更新
      // 支持 arr.length = 0 等显式清空操作也能驱动视图刷新
      if (oldLength !== null) {
        if (oldLength === value) return res
        queueJob(vm)
        return res
      }

      queueJob(vm) // 通过调度器合并更新(同一任务内多次写入只会执行一次 diff)
      return res
    },
    deleteProperty(target, propKey) {
      let success = Reflect.deleteProperty(target, propKey);

      if (success) {
        queueJob(vm) // 通过调度器合并更新
      } else {
        console.error(`删除属性 ${propKey} 失败`);
      }

      return success; // 必须返回 Reflect.deleteProperty 的结果以确保原生行为生效
    },
  }

  proxy = new Proxy(target, handlers)
  cache.set(target, proxy)
  return proxy
}

/**
 * 数据代理
 * @param {*} data 代理数据
 * @returns {Proxy} Proxy Object
 */
export default function DataProxy(data) {
  const vm = this
  return createReactiveProxy(vm, data)
}
