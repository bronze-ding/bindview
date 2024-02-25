import BvError from "../../tools/BvError";
import RemoveNode from "./RemoveNode"
import Vnode from "../../tools/Vnode";
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"

/**
 * 节点替换节点
 * @param {Vnode} oldvnode 旧节点
 * @param {Vnode} newvnode 新节点
 * @param {VM} vm vm
 */
function NodeReplacementNode(oldvnode, newvnode, vm) {
  const { key } = oldvnode
  const children = isVtext(oldvnode) ? [] : oldvnode.children || []
  const oldDom = vm._KeyMapDom.has(key) ? vm._KeyMapDom.get(key) : null
  const newDom = vm._createElement(newvnode) //创建新节点
  if (oldDom instanceof HTMLElement || oldDom instanceof Text) {
    const parentNode = oldDom.parentNode // 获取父节点
    parentNode.replaceChild(newDom, oldDom) //替换节点

    oldDom.remove() // 移除旧节点实例
    children.forEach(childrenVnode => { // 移除旧节点
      RemoveNode(childrenVnode, vm)
    });

  } else {
    throw new BvError(`无法获取到 key 为 ${key}的实例,发生错误请检查`)
  }
}


/**
 * 节点替换组件
 * @param {Vnode} oldvnode 旧组件
 * @param {Vnode} newvnode 新节点
 * @param {VM} vm vm
 */
function NodeReplacementComponent(oldvnode, newvnode, vm) {
  const oldComponent = vm._KeyMapComponent.get(oldvnode.key) // 获取旧组件实例
  const parentNode = oldComponent.el.parentNode  // 获取父节点
  const newNode = vm._createElement(newvnode)
  parentNode.replaceChild(newNode, oldComponent.el)
  oldComponent.$remove(vm)
}

/**
 * 组件替换节点
 * @param {Vnode} oldvnode 旧节点
 * @param {Vnode} newvnode 新组件
 * @param {VM} vm vm
 */
function ComponentReplacementNode(oldvnode, newvnode, vm) {
  const oldNode = vm._KeyMapDom.get(oldvnode.key) // 获取旧节点
  const parentNode = oldNode.parentNode  // 获取父节点
  const newComponent = vm._createComponentExample(newvnode)
  parentNode.replaceChild(newComponent, oldNode) // 替换
  RemoveNode(oldvnode, vm) // 移除节点
}


/**
 * 组件替换组件
 * @param {Vnode} oldvnode 旧组件
 * @param {Vnode} newvnode 新组件
 * @param {VM} vm vm
 */
function ComponentReplacementComponent(oldvnode, newvnode, vm) {
  const oldComponent = vm._KeyMapComponent.get(oldvnode['key']) // 获取组件实例
  const parentNode = oldComponent.el.parentNode  // 获取父节点
  const newComponent = vm._createComponentExample(newvnode) // 创建组件实例
  parentNode.replaceChild(newComponent, oldComponent.el) // 替换节点
  oldComponent.$remove(vm)
}


export {
  NodeReplacementNode,
  ComponentReplacementComponent,
  NodeReplacementComponent,
  ComponentReplacementNode
}