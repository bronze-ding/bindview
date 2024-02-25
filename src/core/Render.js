import BvError from "../tools/BvError"
import { HTML_TAGS, NAME_SPACE } from "./dict"
import Vnode from "../tools/Vnode"
import Vtext from "../tools/Vtext"
import { isVnode, isVtext } from "../tools/isVnodeAndVtext"

// 判断是不是组件
const isComponent = (vnode) => {
  if (isVnode(vnode)) {
    return !(vnode["elementName"] in HTML_TAGS || vnode["elementName"] in NAME_SPACE)
  } else if (isVtext(vnode)) {
    return false
  }
}

/**
 * 将 babelrc 转换后的 vdom ,进行处理将节点和文本进行处理和添加 key
 * @param {Vnode} vdom babelrc 转换后的 vdom 
 * @param {vm} vm
 * @returns {Vnode} new Vnode
 */
export default function Render(vdom, vm) {
  // 判断 vdom 是字符串还是数值, 创建文本类型的虚拟节点
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return new Vtext(vdom)
  } else if (isVnode(vdom)) {
    // 判断是不是 element vdom 创建节点类型的虚拟节点
    let newDom
    newDom = new Vnode(vdom)
    // 如果子节点为空直接返回
    if (vdom.children === null) return newDom
    // 如果有子节点通过遍历和递归来创建虚拟节点
    for (let i = 0; i < vdom.children.length; i++) {
      if (Object.prototype.toString.call(vdom.children[i]) === '[object Object]') {
        newDom.children.push(Render(vdom.children[i], vm))
      } else if (Array.isArray(vdom.children[i])) {
        vdom.children[i].forEach(element => {
          newDom.children.push(Render(element, vm))
        });
      } else if (isComponent(vdom) && typeof vdom.children[i] === 'function') {
        // 如果组件下的子节点有函数那么直接返回
        newDom.children.push(vdom.children[i])
      } else {
        newDom.children.push(Render(vdom.children[i], vm))
      }
    }
    return newDom
  } else if (isVtext(vdom)) {
    return vdom
  } else {
    if (Object.prototype.toString.call(vdom) === '[object Object]' || Object.prototype.toString.call(vdom) === '[object Array]') {
      // 如果是对象将其转换为字符串在转换为虚拟节点
      return new Vtext(JSON.stringify(vdom))
    } else {
      return new Vtext(new String(vdom))
    }
  }
}