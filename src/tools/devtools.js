/**
 * Bindview DevTools 集成(P3.x)
 * ------------------------------------------------------------------
 * 框架侧只做一件事:在关键生命周期把组件事件安全地抛给全局 Hook
 * `window.__BINDVIEW_DEVTOOLS_GLOBAL_HOOK__`(由浏览器调试插件注入)。
 *
 * 设计原则:
 *   1. 零侵入:未安装调试插件时 Hook 不存在,所有调用都会短路返回,
 *      不产生副作用、不保留引用(除一个活跃实例登记表,见下);
 *   2. 零异常:devtools 侧任何异常都被捕获,绝不影响业务渲染;
 *   3. 可回放:扩展晚于框架加载时,通过 `__BINDVIEW_DEVTOOLS_HOOK_REPLAY__`
 *      注册回调,在 Hook 就绪后补发一次全量组件快照。
 *
 * 活跃实例登记表 `aliveInstances` 用于回放时生成完整组件树,
 * 组件销毁(user `$remove`)时会同步移除,避免泄漏。
 */

export const DEVTOOLS_HOOK_NAME = '__BINDVIEW_DEVTOOLS_GLOBAL_HOOK__'
export const DEVTOOLS_REPLAY_NAME = '__BINDVIEW_DEVTOOLS_HOOK_REPLAY__'

/** 当前存活的组件实例(供 devtools 晚连接时补发快照) */
const aliveInstances = new Set()

/**
 * 安全获取 window(SSR / Node 环境下返回 null)
 * @returns {Window|null}
 */
function getWindow() {
  try {
    return typeof window !== 'undefined' ? window : null
  } catch (e) {
    return null
  }
}

/**
 * 获取调试插件的全局 Hook
 * @returns {Object|null}
 */
export function getDevtoolsHook() {
  const win = getWindow()
  if (!win) return null
  const hook = win[DEVTOOLS_HOOK_NAME]
  return hook && typeof hook.emit === 'function' ? hook : null
}

/**
 * 调试插件是否已安装
 * @returns {Boolean}
 */
export function isDevtoolsEnabled() {
  return getDevtoolsHook() !== null
}

/**
 * 向调试插件派发事件(未安装时为无操作)
 * @param {String} event
 * @param {Object} payload
 * @returns {Boolean} 是否成功派发
 */
export function emitDevtools(event, payload) {
  const hook = getDevtoolsHook()
  if (!hook) return false
  try {
    hook.emit(event, payload)
  } catch (e) {
    // devtools 侧的异常不应影响应用
  }
  return true
}

/**
 * 生成组件的 devtools 元信息
 * @param {Component} vm
 * @returns {Object}
 */
export function describeInstance(vm) {
  const parent = vm._parent
  return {
    uid: vm._key,
    name: vm.name || 'AnonymousComponent',
    parentUid: parent && parent._key ? parent._key : null,
    isComponent: !!vm._isComponent,
    version: (vm.constructor && vm.constructor.version) || null,
    timestamp: Date.now()
  }
}

/**
 * 通知:组件已创建
 * @param {Component} vm
 */
export function notifyComponentAdded(vm) {
  aliveInstances.add(vm)
  emitDevtools('component:added', Object.assign(describeInstance(vm), { instance: vm }))
}

/**
 * 通知:组件已更新
 * @param {Component} vm
 * @param {Number} duration 本次渲染 + diff 耗时(ms)
 */
export function notifyComponentUpdated(vm, duration) {
  emitDevtools('component:updated', {
    uid: vm._key,
    name: vm.name || 'AnonymousComponent',
    duration: typeof duration === 'number' ? duration : 0,
    timestamp: Date.now()
  })
}

/**
 * 通知:组件已销毁
 * @param {Component} vm
 */
export function notifyComponentRemoved(vm) {
  aliveInstances.delete(vm)
  emitDevtools('component:removed', {
    uid: vm._key,
    name: vm.name || 'AnonymousComponent',
    timestamp: Date.now()
  })
}

/**
 * 生成当前存活组件的完整快照
 * 供调试器「刷新」时全量重建组件树使用(不产生任何事件)
 * @returns {Array<Object>}
 */
export function getDevtoolsSnapshot() {
  const list = []
  aliveInstances.forEach(function (vm) {
    list.push(Object.assign(describeInstance(vm), { instance: vm }))
  })
  return list
}

/**
 * 把快照提供器挂载到全局 Hook 上
 * 使调试器无需依赖事件即可随时获取完整组件列表(修复「刷新」只能增量补漏的问题)
 * @param {Object} hook
 */
export function attachSnapshotProvider(hook) {
  if (!hook || typeof hook !== 'object') return
  try {
    hook.getSnapshot = getDevtoolsSnapshot
    hook.__bindviewSnapshot = true
  } catch (e) {
    // ignore
  }
}

/**
 * 注册「扩展晚于框架加载」时的回放回调
 */
function installReplay(win) {
  try {
    const replay = win[DEVTOOLS_REPLAY_NAME] || (win[DEVTOOLS_REPLAY_NAME] = [])
    replay.push(function (hook) {
      attachSnapshotProvider(hook)
      try {
        hook.emit('app:rescan', { components: getDevtoolsSnapshot() })
      } catch (e) {
        // ignore
      }
    })
  } catch (e) {
    // ignore
  }
}

const __win = getWindow()
if (__win) {
  installReplay(__win)
  // Hook 通常先于框架注入,这里直接挂载快照提供器
  attachSnapshotProvider(getDevtoolsHook())
}

export default {
  DEVTOOLS_HOOK_NAME,
  DEVTOOLS_REPLAY_NAME,
  getDevtoolsHook,
  isDevtoolsEnabled,
  emitDevtools,
  describeInstance,
  getDevtoolsSnapshot,
  attachSnapshotProvider,
  notifyComponentAdded,
  notifyComponentUpdated,
  notifyComponentRemoved
}
