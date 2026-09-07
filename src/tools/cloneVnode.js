import { isVnode, isVtext } from "./isVnodeAndVtext"

/**
 * 轻量克隆虚拟节点树(替代第三方 deep-copy, P1.3)
 *
 * 仅克隆 Vnode / Vtext 的结构外壳:
 *   - attributes 做一层浅拷贝(不会与渲染产生的属性对象共享同一引用)
 *   - 函数插槽等非节点成员保持原引用
 * 不复制函数 / 样式对象内部,因此比通用深拷贝更省内存与时间。
 *
 * @param {Vnode|Vtext|*} vnode 虚拟节点(或函数等其它成员)
 * @returns {Vnode|Vtext|*}
 */
function cloneVnode(vnode) {
  if (isVtext(vnode)) {
    const copy = Object.create(Object.getPrototypeOf(vnode))
    copy.text = vnode.text
    copy.key = vnode.key
    return copy
  }

  if (isVnode(vnode)) {
    const copy = Object.create(Object.getPrototypeOf(vnode))
    copy.elementName = vnode.elementName
    copy.attributes = vnode.attributes === null || vnode.attributes === void 0
      ? null
      : Object.assign({}, vnode.attributes)
    copy.children = vnode.children.map(child => cloneVnode(child))
    copy.key = vnode.key
    return copy
  }

  // 函数插槽等其它成员直接复用
  return vnode
}

export default cloneVnode
