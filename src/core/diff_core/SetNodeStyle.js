/**
 * 归一化样式对象
 * @param {*} style style 可为对象 / undefined / null
 * @returns {Object}
 */
function normalizeStyle(style) {
  return (style !== null && style !== void 0 && Object.prototype.toString.call(style) === '[object Object]') ? style : {}
}

/**
 * 设置 node css 样式
 * 统一处理样式的 新增 / 修改 / 删除:
 * 遍历新旧样式的并集, 新值存在则写入, 新值不存在(被删除)则清空该样式恢复默认
 * @param {*} oldstyle 旧样式
 * @param {*} newstyle 新样式
 * @param {String} vondekey 节点 key 用来获取真实 DOM
 * @param {Bindview} vm
 */
export default function SetNodeStyle(oldstyle, newstyle, vondekey, vm) {
  const dom = vm._KeyMapDom.get(vondekey)
  if (dom === null || dom === void 0) return

  const oldStyleObj = normalizeStyle(oldstyle)
  const newStyleObj = normalizeStyle(newstyle)

  const keys = new Set([...Object.keys(oldStyleObj), ...Object.keys(newStyleObj)])

  keys.forEach(key => {
    const oldVal = oldStyleObj[key]
    const newVal = newStyleObj[key]

    // 值未变化(或删除后本就不存在),无需处理
    if (oldVal === newVal) return

    // 样式被删除:清空以恢复默认值
    if (newVal === void 0) {
      dom.style[key] = ''
      return
    }

    // 样式被新增 / 修改
    if (typeof newVal === 'number') {
      dom.style[key] = newVal + 'px'
    } else if (typeof newVal === 'string') {
      dom.style[key] = newVal
    }
  })
}
