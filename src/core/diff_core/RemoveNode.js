import BvError from "../../tools/BvError"
import { HTML_TAGS, NAME_SPACE } from "../dict"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"
import { removeAllDomEventHandlers } from "../eventBinding"
import { unregisterDom } from "../nodeRegistry"

// 判断是不是节点
const isElementAndText = (vnode) => {
  if (isVnode(vnode)) {
    return (vnode["elementName"] in HTML_TAGS || vnode["elementName"] in NAME_SPACE)
  } else if (isVtext(vnode)) {
    return true
  }
}

// 判断是不是组件
const isComponent = (vnode) => {
  if (isVnode(vnode)) {
    return !(vnode["elementName"] in HTML_TAGS || vnode["elementName"] in NAME_SPACE)
  } else if (isVtext(vnode)) {
    return false
  }
}

/**
 * 移除节点
 * @param {Vnode} vnode 
 * @param {VM} vm 
 */
export default function RemoveNode(vnode, vm) {
  const { key } = vnode
  if (isComponent(vnode)) {
    const component = vm._KeyMapComponent.has(key) ? vm._KeyMapComponent.get(key) : null
    if (component === null) throw new BvError(`无法从组件映射表中获取到 key 为 ${key} 的 ${vnode['elementName']}的实例`, vm)
    component.$remove(vm)
    // $remove 已注销父组件的组件映射;这里再注销父组件 _KeyMapDom 中
    // 残留的组件根 DOM 记录(统一注销入口),避免悬空引用与内存泄漏(P2.3)
    unregisterDom(vm, key)
  } else if (isElementAndText(vnode)) {
    const children = vnode.children || []
    const domNode = vm._KeyMapDom.get(key)
    if (domNode !== void 0) { // 判断 dom 映射表中有没有
      removeAllDomEventHandlers(domNode) // 移除节点上绑定的事件,防止监听泄漏(P2.4)
      domNode.remove() // 获取 DOM 并移除
      unregisterDom(vm, key) // 统一注销入口(P2.3)

      children.forEach(childrenVnode => {// 移除子节点
        RemoveNode(childrenVnode, vm)
      })
    }
  }
}