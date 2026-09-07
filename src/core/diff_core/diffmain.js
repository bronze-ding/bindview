import { HTML_TAGS, NAME_SPACE, GLOBAL_ATTRIBUTES, EVENT_HANDLERS } from "../dict"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"
import { NodeReplacementNode, ComponentReplacementComponent, NodeReplacementComponent, ComponentReplacementNode } from "./SubstitutionNode"
import SetNodeStyle from "./SetNodeStyle";
import { AddNode, ReplaceList, PatchChildren } from "./ListNodeOperation"
import SetAttr from "./SetAttr"
import BvError from "../../tools/BvError";
import Vnode from "../../tools/Vnode";
import GetNewNodeLocation from "./GetNewNodeLocation";
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
          break
        }

        if (newChildren.length === oldChildren.length) {
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
          let index = GetNewNodeLocation(newChildren, oldChildren)
          for (let i = 0; i < oldChildren.length; i++) {
            if (index.includes(i)) {
              RemoveNode(oldChildren[i], vm)
            } else if (i < newChildren.length) {
              vm._diffmain(oldChildren[i], newChildren[i])
            }
          }
          index = null
        }
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