import { HTML_TAGS, NAME_SPACE } from "../dict"
import RemoveNode from "./RemoveNode"
import GetNewNodeLocation from "./GetNewNodeLocation"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"
import Vnode from "../../tools/Vnode"

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
 * 通过虚拟dom获取真实DOM
 * @param {Vnode} Vdom 
 * @param {VM} vm 
 */
const getVnodeAndComponentDom = (Vdom, vm) => {
  if (isComponent(Vdom)) {
    const { key } = Vdom
    return vm._KeyMapComponent.has(key) ? vm._KeyMapComponent.get(key).el : null
  } else if (isElementAndText(Vdom)) {
    const { key } = Vdom
    return vm._KeyMapDom.has(key) ? vm._KeyMapDom.get(key) : null
  }
}

/**
 * 创建 dom 或组件实例
 * @param {Vnode} vnode 
 * @param {VM} vm 
 */
const createDomAndComponent = (vnode, vm) => {
  if (isComponent(vnode)) {
    return vm._createComponentExample(vnode)
  } else if (isElementAndText(vnode)) {
    return vm._createElement(vnode)
  }
}



/**
 * 添加节点
 * @param {Vnode} newvnode 新节点
 * @param {Array<Vnode|Vtext>} newvnodeChildren 新节点子节点数组
 * @param {Vm} vm vm
 */
function AddNode(newvnode, newvnodeChildren, vm) {
  let { key } = newvnode
  const Dom = vm._KeyMapDom.has(key) ? vm._KeyMapDom.get(key) : null

  if (Dom !== null) {
    newvnodeChildren.forEach(childrenVnode => {
      if (isComponent(childrenVnode)) {
        const newDom = vm._createComponentExample(childrenVnode)
        Dom.appendChild(newDom)
      } else if (isElementAndText(childrenVnode)) {
        const newDom = vm._createElement(childrenVnode)
        Dom.appendChild(newDom)
      }
    })
  }
}

/**
 * 无 key 的列表,进行替换
 * @param {Vnode} oldvnode 
 * @param {Array<Vnode>} newvnodeChildren 
 * @param {VM} vm 
 */
function ReplaceList(oldvnode, newvnodeChildren, vm) {
  const Dom = getVnodeAndComponentDom(oldvnode, vm)

  // 先清空子节点
  oldvnode['children'].forEach(childrenVnode => {
    RemoveNode(childrenVnode, vm)
  })

  // 添加节点
  if (Dom !== null) {
    newvnodeChildren.forEach(childrenVnode => {
      const newDom = createDomAndComponent(childrenVnode, vm)
      Dom.appendChild(newDom)
    })
  }
}

/**
 * 对有 key 的节点进行节插入
 * @param {Array<Vnode>} oldvnodeChildren 
 * @param {Vnode} Parent 父节点
 * @param {Array<Vnode>} newvnodeChildren 
 * @param {VM} vm 
 */
function InsertNode(oldvnodeChildren, newvnodeChildren, Parent, vm) {
  if (newvnodeChildren.length - oldvnodeChildren.length === 1) {
    // 只多出来一个节点
    let index = GetNewNodeLocation(oldvnodeChildren, newvnodeChildren)[0]
    if (index === 0) { // 在头部添加节点
      const Dom = getVnodeAndComponentDom(Parent, vm) // 父节点真实dom
      const Dom1 = getVnodeAndComponentDom(newvnodeChildren[1], vm) // 追加在第一个 DOM 之前的 key,真实dom
      if (Dom !== null) {
        const newDom = createDomAndComponent(newvnodeChildren[0], vm) // 创建新节点或组件
        Dom.insertBefore(newDom, Dom1) // 插入新节点
      }
      index = null // 释放内存
    } else if (index === newvnodeChildren.length - 1) { // 在尾部添加节点
      const Dom = getVnodeAndComponentDom(Parent, vm) //父节点 key, 真实dom
      let tailNode = newvnodeChildren[newvnodeChildren.length - 1]
      if (Dom !== null) {
        const newDom = createDomAndComponent(tailNode, vm) // 创建新节点或组件
        Dom.appendChild(newDom) // 插入新节点
      }
      index = null
    } else if (index !== 0 && index !== newvnodeChildren.length - 1) { // 中间插入
      const Dom = getVnodeAndComponentDom(Parent, vm) //父节点 真实dom
      const Dom1 = getVnodeAndComponentDom(newvnodeChildren[index + 1], vm) // 真实dom
      if (Dom !== null) {
        const newDom = createDomAndComponent(newvnodeChildren[index], vm) // 创建新节点
        Dom.insertBefore(newDom, Dom1) // 插入新节点
      }
      index = null // 释放内存
    }
  } else {
    // 多出多个节点
    let index = GetNewNodeLocation(oldvnodeChildren, newvnodeChildren) // 获取新添加项的索引
    let BenchmarkNodeIndex = index[0] // 记录基准节点索引
    let newvnodeChildrenLength = newvnodeChildren.length

    index.forEach(ind => {
      if (BenchmarkNodeIndex !== void 0 && BenchmarkNodeIndex !== null && typeof BenchmarkNodeIndex === 'number') {
        // 在头部和中间添加
        for (let i = BenchmarkNodeIndex; i < newvnodeChildren.length; i++) { // 
          if (i < newvnodeChildrenLength - 1 && ind <= i + 1) {
            const BenchmarkDom = getVnodeAndComponentDom(newvnodeChildren[i + 1], vm) // 基准节点 DOM
            const newDom = createDomAndComponent(newvnodeChildren[ind], vm)
            const Fu = getVnodeAndComponentDom(Parent, vm)// 父节点DOM 
            if (BenchmarkDom !== null) {
              Fu.insertBefore(newDom, BenchmarkDom)
              BenchmarkNodeIndex = ind + 1
              break
            }
          } else {
            BenchmarkNodeIndex = void 0;
            // 在末尾添加
            const Fu = getVnodeAndComponentDom(Parent, vm)// 父节点DOM 
            const newDom = createDomAndComponent(newvnodeChildren[ind], vm)
            Fu.appendChild(newDom)
            break
          }
        }
      } else if (BenchmarkNodeIndex === void 0) {
        // 在末尾添加
        const Fu = getVnodeAndComponentDom(Parent, vm)// 父节点DOM 
        const newDom = createDomAndComponent(newvnodeChildren[ind], vm)
        Fu.appendChild(newDom)
      }
    })

    newvnodeChildrenLength = BenchmarkNodeIndex = index = null //释放内存
  }
}

export {
  AddNode,
  ReplaceList,
  InsertNode
}