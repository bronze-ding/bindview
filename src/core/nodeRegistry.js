/**
 * 虚拟 DOM / 组件 映射注册表 —— 统一生命周期入口(P2.3)
 *
 * 把 _KeyMapDom / _KeyMapComponent 的「写入 / 删除」收敛到以下工具函数,
 * 保证创建与销毁(增删)始终对称、成对清理,避免 diff 与 remove 各自散落操作导致泄漏;
 * 同时提供 registryStats() 用于调试统计。
 *
 * 说明:两张 Map 仍为 vm._KeyMapDom / vm._KeyMapComponent,便于既有的读取
 * (diff / PatchChildren 等)保持不变;这里只统一它们的写入与删除入口。
 */

/**
 * 注册一个真实 DOM(元素 / 文本 / 组件根节点)
 * @param {Component} vm
 * @param {String|Symbol} key
 * @param {Node} dom
 */
export function registerDom(vm, key, dom) {
  if (vm && vm._KeyMapDom) vm._KeyMapDom.set(key, dom)
}

/**
 * 注销一个真实 DOM,并返回被注销的节点(便于移除 / 释放监听)
 * @returns {Node|undefined}
 */
export function unregisterDom(vm, key) {
  if (!vm || !vm._KeyMapDom) return void 0
  const existed = vm._KeyMapDom.get(key)
  vm._KeyMapDom.delete(key)
  return existed
}

/**
 * 注册一个组件实例
 * @param {Component} vm
 * @param {String} key
 * @param {Component} component
 */
export function registerComponent(vm, key, component) {
  if (vm && vm._KeyMapComponent) vm._KeyMapComponent.set(key, component)
}

/**
 * 注销一个组件实例,并返回被注销的实例
 * @returns {Component|undefined}
 */
export function unregisterComponent(vm, key) {
  if (!vm || !vm._KeyMapComponent) return void 0
  const existed = vm._KeyMapComponent.get(key)
  vm._KeyMapComponent.delete(key)
  return existed
}

/**
 * 清空某 vm 上的全部映射(组件销毁兜底)
 */
export function clearRegistry(vm) {
  if (vm && vm._KeyMapDom) vm._KeyMapDom.clear()
  if (vm && vm._KeyMapComponent) vm._KeyMapComponent.clear()
}

/**
 * 调试统计:返回两个映射的数量与 key 列表
 * @param {Component} vm
 */
export function registryStats(vm) {
  // 作为原型方法调用时 this 为组件实例,参数可能为空
  const target = vm || this
  return {
    dom: target && target._KeyMapDom ? target._KeyMapDom.size : 0,
    component: target && target._KeyMapComponent ? target._KeyMapComponent.size : 0,
    domKeys: target && target._KeyMapDom ? [...target._KeyMapDom.keys()] : [],
    componentKeys: target && target._KeyMapComponent ? [...target._KeyMapComponent.keys()] : [],
  }
}
