/**
 * DOM 事件绑定工具(P2.4)
 *
 * 让事件处理器在 diff 阶段能够 新增 / 更新 / 移除:
 *  - 同一 DOM 的每个事件类型只 addEventListener 一次;
 *  - 内部保存“当前处理器”,事件触发时读取最新处理器调用;
 *  - diff 更新处理器时只替换内部引用(不反复 add/remove);
 *  - 处理器被移除或节点销毁时 removeEventListener,避免泄漏。
 *
 * 通过非标准属性 dom.__bvEvents 记录,key 为真实事件名。
 */

function getRecords(dom) {
  if (!dom.__bvEvents) {
    dom.__bvEvents = new Map()
  }
  return dom.__bvEvents
}

function addListener(dom, type, rec) {
  rec.listener = function (e) {
    const fn = rec.handler
    if (typeof fn === 'function') {
      // 与原 createElement 语义一致:handler 以 vm 为 this,参数为 (DOM 元素, event)
      fn.call(rec.vm, dom, e)
    }
  }
  dom.addEventListener(type, rec.listener)
}

/**
 * 设置 / 更新某一事件类型在 DOM 上的处理器
 * @param {HTMLElement} dom
 * @param {Component} vm 组件实例(作为 handler 的 this)
 * @param {String} type 真实事件名,如 'click'
 * @param {Function} handler 事件处理器(传 null/undefined 等于移除)
 */
export function setDomEventHandler(dom, vm, type, handler) {
  const records = getRecords(dom)
  let rec = records.get(type)

  if (!rec) {
    // 首次绑定
    rec = { vm, handler, listener: null }
    records.set(type, rec)
    addListener(dom, type, rec)
    return
  }

  // 已绑定过:仅替换 vm / handler
  rec.vm = vm
  rec.handler = handler
}

/**
 * 移除某一事件类型的监听与处理器
 */
export function removeDomEventHandler(dom, type) {
  const records = dom.__bvEvents
  if (!records) return
  const rec = records.get(type)
  if (rec) {
    if (rec.listener) dom.removeEventListener(type, rec.listener)
    records.delete(type)
    if (records.size === 0) dom.__bvEvents = undefined
  }
}

/**
 * 移除某 DOM 上绑定的全部事件(节点销毁前调用,防止监听泄漏)
 */
export function removeAllDomEventHandlers(dom) {
  const records = dom.__bvEvents
  if (!records) return
  records.forEach((rec, type) => {
    if (rec.listener) dom.removeEventListener(type, rec.listener)
  })
  dom.__bvEvents = undefined
}
