import { HTML_TAGS, NAME_SPACE, GLOBAL_ATTRIBUTES, EVENT_HANDLERS, BOOL_ATTRS } from "../dict"
import setBooleanAttr from "../boolAttr"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"
import { NodeReplacementNode, ComponentReplacementComponent, NodeReplacementComponent, ComponentReplacementNode } from "./SubstitutionNode"
import SetNodeStyle from "./SetNodeStyle";
import { AddNode, ReplaceList, PatchChildren } from "./ListNodeOperation"
import SetAttr from "./SetAttr"
import { setDomEventHandler, removeDomEventHandler } from "../eventBinding"
import BvError from "../../tools/BvError";
import Vnode from "../../tools/Vnode";
import RemoveNode from "./RemoveNode";
import BvWarn from "../../tools/BvWarn";

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

// 判断是否为一个“纯 keyed 列表”(所有子节点都是携带 key 属性的 vnode)
// 满足条件时使用 key 对齐算法以支持插入 / 删除 / 重排
const isKeyedList = (children) => {
  if (!Array.isArray(children) || children.length === 0) return false
  return children.every(child => isVnode(child) && child.attributes && child.attributes.key !== void 0)
}

/**
 * <select> 受控 value 的二次同步
 *
 * diff 时 attributes 先于 children 处理:若同一轮内 option 列表与 value 同时变化,
 * 写入 value 的时刻新 option 尚未存在,浏览器会把 select.value 置为 ''(selectedIndex = -1),
 * 且此后不会再自动纠正。因此在子节点处理完成后再同步一次。
 *
 * @param {Vnode} vnode 当前(新)虚拟节点
 * @param {Component} vm 组件实例
 */
const syncSelectValue = (vnode, vm) => {
  const attrs = vnode.attributes
  if (!attrs || attrs.value === void 0 || attrs.value === null) return

  const dom = vm._KeyMapDom.get(vnode.key)
  if (!(dom instanceof Element) || dom.tagName !== 'SELECT') return

  const target = String(attrs.value)
  if (dom.value !== target) dom.value = target
}

/**
 * diff 主方法
 * @param {Vnode} oldvnode 旧虚拟节点
 * @param {Vnode} newvnode 新虚拟节点
 */
export default function diffmain(oldvnode, newvnode) {
  const vm = this

  // 使用遍历来依次比较差异
  for (let attrItem in newvnode) {
    switch (attrItem) {
      case "elementName":
      case "text":
        // 处理节点，如果节点发生变化直接更换节点
        if (isElementAndText(newvnode) && isComponent(oldvnode)) {
          // 节点替换组件
          if (!(oldvnode['attributes'] && oldvnode['attributes']['id'])) {
            BvWarn(`${oldvnode[attrItem]} 作为动态组件应添加一个唯一的 id 属性`, vm)
          }
          NodeReplacementComponent(oldvnode, newvnode, vm)
          return
        } else if (isElementAndText(oldvnode) && isComponent(newvnode)) {
          //组件替换节点
          if (!(newvnode['attributes'] && newvnode['attributes']['id'])) {
            BvWarn(`${newvnode[attrItem]} 作为动态组件应添加一个唯一的 id 属性`, vm)
          }
          ComponentReplacementNode(oldvnode, newvnode, vm)
          return
        } else if (isComponent(newvnode) && isComponent(oldvnode)) {
          // 组件替换组件
          if (newvnode[attrItem] !== oldvnode[attrItem] || ((newvnode['attributes'] && oldvnode['attributes']) ? newvnode['attributes']['id'] !== oldvnode['attributes']['id'] : false)) {
            if (!(newvnode['attributes'] && newvnode['attributes']['id'] && oldvnode['attributes'] && oldvnode['attributes']['id'])) {
              BvWarn(`动态替换 ${oldvnode[attrItem]} 组件和 ${newvnode[attrItem]} 组件,需要一个唯一不变的 id 属性`, vm)
            }
            ComponentReplacementComponent(oldvnode, newvnode, vm)
          }
          return
        } else if (isElementAndText(newvnode) && isElementAndText(oldvnode)) {
          // 节点替换节点
          if (isVtext(newvnode) && isVtext(oldvnode)) {
            // 处理文本节点内容
            if (oldvnode[attrItem] !== newvnode[attrItem]) {
              const dom = vm._KeyMapDom.get(oldvnode['key'])
              dom.nodeValue = newvnode.text
              return // return 因为替换了节点不需要比较其它了
            }
          } else {
            // 如何两个节点都不为文本节点进行替换
            if (oldvnode[attrItem] !== newvnode[attrItem]) {
              NodeReplacementNode(oldvnode, newvnode, vm)
              return // return 因为替换了节点不需要比较其它了
            }
          }
        }
        break
      case "attributes": {
        // 处理属性
        // 新旧属性统一按空对象处理,避免旧节点 attributes 为 null 时访问崩溃
        const oldAttrs = (oldvnode[attrItem] === null || oldvnode[attrItem] === void 0) ? {} : oldvnode[attrItem]
        const newAttrs = (newvnode[attrItem] === null || newvnode[attrItem] === void 0) ? {} : newvnode[attrItem]

        // 组件节点不在此处处理属性
        if (isComponent(newvnode) && isComponent(oldvnode)) continue

        const dom = vm._KeyMapDom.get(oldvnode.key)
        if (dom instanceof Element) {
          // 处理 css 样式(新增 / 修改 / 删除由 SetNodeStyle 统一处理)
          const oldStyle = oldAttrs.style === void 0 ? null : oldAttrs.style
          const newStyle = newAttrs.style === void 0 ? null : newAttrs.style
          if (JSON.stringify(oldStyle) !== JSON.stringify(newStyle)) {
            SetNodeStyle(oldStyle, newStyle, oldvnode.key, vm)
          }

          // 事件处理(P2.4):diff 阶段支持 新增 / 更新 / 移除 处理器
          const eventProps = new Set()
          for (let p in oldAttrs) if (p in EVENT_HANDLERS) eventProps.add(p)
          for (let p in newAttrs) if (p in EVENT_HANDLERS) eventProps.add(p)
          eventProps.forEach(prop => {
            const type = EVENT_HANDLERS[prop]
            const newFn = typeof newAttrs[prop] === 'function' ? newAttrs[prop] : null
            const oldFn = typeof oldAttrs[prop] === 'function' ? oldAttrs[prop] : null
            if (newFn === oldFn) return // 未变化
            if (newFn) {
              setDomEventHandler(dom, vm, type, newFn)
            } else {
              removeDomEventHandler(dom, type)
            }
          })

          // 更新 / 新增的属性
          for (let attrName in newAttrs) {
            if (attrName === 'style' || attrName === 'ref' || attrName in EVENT_HANDLERS) continue
            if (oldAttrs[attrName] !== newAttrs[attrName]) {
              SetAttr(oldvnode.key, attrName, newAttrs, vm)
            }
          }

          // 删除旧属性中存在、而新属性中已不存在的属性
          for (let attrName in oldAttrs) {
            if (attrName === 'style' || attrName === 'ref' || attrName in EVENT_HANDLERS) continue
            if (!(attrName in newAttrs)) {
              if (attrName in BOOL_ATTRS) {
                // 布尔属性:复位 DOM property,否则 checked / selected 会因 dirty 状态残留
                setBooleanAttr(dom, attrName, false)
                continue
              }
              const realAttrName = GLOBAL_ATTRIBUTES[attrName] || attrName
              dom.removeAttribute(realAttrName)
              if (attrName === 'value' && 'value' in dom) dom.value = ''
            }
          }
        }
        break
      }
      case "children": {
        // 处理子节点
        if (isComponent(newvnode) && isComponent(oldvnode)) continue // 该节点如果为组件节点不进行操作

        const oldChildren = oldvnode[attrItem] || []
        const newChildren = newvnode[attrItem] || []

        // 纯 keyed 列表统一走 key 对齐算法(支持插入 / 删除 / 重排,并复用真实 DOM)
        if (isKeyedList(newChildren)) {
          PatchChildren(oldChildren, newChildren, oldvnode, vm)
        } else if (newChildren.length === oldChildren.length) {
          // 子节点长度不变,按索引逐一比较
          for (let i = 0; i < newChildren.length; i++) {
            vm._diffmain(oldChildren[i], newChildren[i])
          }
        } else if (newChildren.length > oldChildren.length) {
          // 子节点长度增加
          if (oldChildren.length === 0) {
            // 旧节点为空,直接整体添加
            AddNode(newvnode, newChildren, vm)
          } else {
            // 无 key 列表:整体重建替换
            ReplaceList(oldvnode, newChildren, vm)
          }
        } else if (newChildren.length < oldChildren.length) {
          // 子节点长度减少
          //
          // 此分支只处理「非纯 keyed 列表」(纯 keyed 列表已由上面的 PatchChildren 处理)。
          // Assign_key 已把新节点与对应旧节点的内部 key 同步好,这里按内部 key 对齐:
          // 保留被新列表引用的旧节点并做内容级 diff,其余旧节点整体移除。
          //
          // 旧实现在「新索引(index)」与「旧索引(i)」两套坐标间混用:index 是「新列表中
          // 新增项的索引」,却拿去和旧索引比较,导致应当移除的旧节点被保留在 DOM 中。
          // 典型表现:骨架屏从「真实内容」切回「占位态」时,多余旧占位行 / 文本残留。
          const oldByKey = new Map()
          oldChildren.forEach(child => oldByKey.set(child.key, child))
          const newKeySet = new Set(newChildren.map(child => child.key))
          oldChildren.forEach(oldChild => {
            if (!newKeySet.has(oldChild.key)) RemoveNode(oldChild, vm)
          })
          newChildren.forEach(newChild => {
            const oldChild = oldByKey.get(newChild.key)
            if (oldChild !== void 0) vm._diffmain(oldChild, newChild)
          })
        }

        // options 就绪后同步 <select> 的受控 value
        syncSelectValue(newvnode, vm)

        break
      }
      case "key":
        // 处理 Key 一般不会发生变化，如果有变化及发生错误
        if (oldvnode[attrItem] !== newvnode[attrItem]) {
          throw new BvError("key 属性发生变化,及出现严重错误请排查", vm)
        }
    }
  }
}