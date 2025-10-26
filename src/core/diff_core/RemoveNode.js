import BvError from "../../tools/BvError"
import { HTML_TAGS, NAME_SPACE } from "../dict"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"

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
  } else if (isElementAndText(vnode)) {
    const children = vnode.children || []
    if (vm._KeyMapDom.has(key)) { // 判断 dom 映射表中有没有
      vm._KeyMapDom.get(key).remove() // 获取 DOM 并移除
      vm._KeyMapDom.delete(key) // 删除映射表中的映射记录

      children.forEach(childrenVnode => {// 移除子节点
        RemoveNode(childrenVnode, vm)
      })
    }
  }
}