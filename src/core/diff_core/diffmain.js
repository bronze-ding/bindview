import { HTML_TAGS, NAME_SPACE } from "../dict"
import { isVnode, isVtext } from "../../tools/isVnodeAndVtext"
import { NodeReplacementNode, ComponentReplacementComponent, NodeReplacementComponent, ComponentReplacementNode } from "./SubstitutionNode"
import SetNodeStyle from "./setNodeStyle";
import { AddNode, ReplaceList, InsertNode } from "./ListNodeOperation"
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
            BvWarn(`${oldvnode[attrItem]} 作为动态组件应添加一个唯一的 id 属性,当前组件 ${vm.name}`)
          }
          NodeReplacementComponent(oldvnode, newvnode, vm)
          return
        } else if (isElementAndText(oldvnode) && isComponent(newvnode)) {
          //组件替换节点
          if (!(newvnode['attributes'] && newvnode['attributes']['id'])) {
            BvWarn(`${newvnode[attrItem]} 作为动态组件应添加一个唯一的 id 属性,当前组件 ${vm.name}`)
          }
          ComponentReplacementNode(oldvnode, newvnode, vm)
          return
        } else if (isComponent(newvnode) && isComponent(oldvnode)) {
          // 组件替换组件
          if (newvnode[attrItem] !== oldvnode[attrItem] || newvnode['attributes']['id'] !== oldvnode['attributes']['id']) {
            if (!(newvnode['attributes'] && newvnode['attributes']['id'] && oldvnode['attributes'] && oldvnode['attributes']['id'])) {
              BvWarn(`动态替换 ${oldvnode[attrItem]} 组件和 ${newvnode[attrItem]} 组件,需要一个唯一不变的 id 属性, 当前组件 ${vm.name}`)
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
      case "attributes":
        // 处理属性

        // 将 attr 转换为 string 进行粗略比较
        let oldattrstring = JSON.stringify(oldvnode[attrItem])
        let newattrstring = JSON.stringify(newvnode[attrItem])

        if (isComponent(newvnode) && isComponent(oldvnode)) continue // 该节点如果为组件节点不进行操作

        if ((oldattrstring !== newattrstring) && newvnode[attrItem]) {
          if (newvnode[attrItem]['style']) {
            // 处理css样式
            SetNodeStyle(oldvnode[attrItem]['style'], newvnode[attrItem]['style'], newvnode.key, vm)
          }

          for (let attrName in newvnode[attrItem]) {
            if (attrName === 'style') continue
            if (oldvnode[attrItem][attrName] !== newvnode[attrItem][attrName]) {
              SetAttr(oldvnode.key, attrName, newvnode[attrItem], vm)
            }
          }
        }
        // 释放内存
        oldattrstring = newattrstring = null
        break
      case "children":
        // 处理子节点
        if (isComponent(newvnode) && isComponent(oldvnode)) continue // 该节点如果为组件节点不进行操作

        if (newvnode[attrItem].length === oldvnode[attrItem].length) {
          // 子节点长度不变
          for (let i = 0; i < newvnode[attrItem].length; i++) {
            vm._diffmain(oldvnode[attrItem][i], newvnode[attrItem][i])
          }
        } else if (newvnode[attrItem].length > oldvnode[attrItem].length) {
          // 子节点长度增加
          if (oldvnode[attrItem].length === 0) {
            // 如果旧节点等于0,直接添加节点
            AddNode(newvnode, newvnode[attrItem], vm)
          } else if (
            (
              newvnode[attrItem][0]['attributes'] && newvnode[attrItem][0]['attributes']['key'] !== void 0
            ) && (
              newvnode[attrItem][newvnode[attrItem].length - 1]['attributes'] && newvnode[attrItem][newvnode[attrItem].length - 1]['attributes']['key'] !== void 0
            )
          ) {
            // 带有 key 的列表,通过比较第一个节点和最后一个节点是否有 key 属性
            InsertNode(oldvnode[attrItem], newvnode[attrItem], oldvnode, vm)
          } else {
            // 没有 key 的列表
            ReplaceList(oldvnode, newvnode[attrItem], vm)
          }
        } else if (newvnode[attrItem].length < oldvnode[attrItem].length) {
          // 子节点长度减少
          let index = GetNewNodeLocation(newvnode[attrItem], oldvnode[attrItem])
          for (let i = 0; i < index.length; i++) {
            RemoveNode(oldvnode[attrItem][index[i]], vm)
          }
          index = null
        }
        break
      case "key":
        // 处理 Key 一般不会发生变化，如果有变化及发生错误
        if (oldvnode[attrItem] !== newvnode[attrItem]) {
          throw new BvError("key 属性发生变化,及出现严重错误请排查")
        }
    }
  }
}