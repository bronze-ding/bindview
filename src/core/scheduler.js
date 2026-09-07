/**
 * 更新调度器
 *
 * 目标(P1.1): 同一任务内对同一实例的多次数据变更只触发一次 render + diff。
 * 做法: 数据变更将组件标记为“脏”并推入 pendingJobs(Set 天然去重),
 *       通过微任务合并刷新;刷新过程中由父组件产生的子组件更新也会在同一轮被消费。
 *
 * 对外能力:
 *   - queueJob(vm)      入队一个待更新组件(内部使用)
 *   - flushJobs()       立即同步清空并执行队列(测试 / 调试用)
 *   - nextTick(cb)      在本次(或下一次)DOM 更新完成后回调 / resolve
 */

// 待更新组件集合(按插入顺序,Set 去重)
const pendingJobs = new Set()

// 当前正在进行的刷新微任务(Promise),用于合并多次入队
let currentFlush = null

/**
 * 立即执行队列中的所有更新
 * 执行期间新入队的任务(例如父组件更新后级联产生的子组件更新)会继续在本轮消费,
 * 直到队列清空
 */
function flushJobs() {
  while (pendingJobs.size > 0) {
    const vm = pendingJobs.values().next().value
    pendingJobs.delete(vm)

    // 组件已卸载 / 未初始化完成时跳过(卸载后 _oldvnode 会被置为 null)
    if (vm && vm._oldvnode) {
      vm._Update()
    }
  }
}

/**
 * 将组件入队并安排一次合并后的刷新
 * @param {Component} vm
 */
function queueJob(vm) {
  // 未初始化或已卸载的组件无需调度(避免对已移除组件执行无效 diff)
  if (!vm || !vm._oldvnode) return
  pendingJobs.add(vm)
  scheduleFlush()
}

/**
 * 通过微任务安排一次 flush(多次调用会被合并为一次)
 */
function scheduleFlush() {
  if (currentFlush) return

  const p = Promise.resolve().then(() => {
    try {
      flushJobs()
    } finally {
      currentFlush = null
    }
  })
  currentFlush = p
}

/**
 * 下一次 DOM 更新完成后执行回调 / resolve Promise
 * @param {Function} [cb]
 * @returns {Promise}
 */
function nextTick(cb) {
  if (pendingJobs.size > 0) scheduleFlush()
  const p = (currentFlush || Promise.resolve()).then(() => (typeof cb === 'function' ? cb() : void 0))
  return p
}

export {
  queueJob,
  flushJobs,
  nextTick
}
