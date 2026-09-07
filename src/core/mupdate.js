import { queueJob } from "./scheduler"

/**
 * 手动更新
 * @param {Function} func 回调
 */
export default function mupdate(func) {
  const vm = this
  if (typeof func === 'function') {
    func()
  }

  // 通过调度器入队(与数据驱动更新共用同一去重队列)
  queueJob(vm)
}