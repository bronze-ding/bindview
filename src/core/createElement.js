import { NAME_SPACE, CUSTOM_ATTR, GLOBAL_ATTRIBUTES, HTML_TAGS, EVENT_HANDLERS } from './dict'
import Vnode from "../tools/Vnode"
import BvError from '../tools/BvError'
import { isVnode, isVtext } from "../tools/isVnodeAndVtext"
import Vtext from '../tools/Vtext'

/**
 * 将虚拟DOM装换为真实DOM
 * @param {Vnode} vnode 虚拟节点
 */
export default function createElement(vnode) {
  const vm = this

  // 判断是DOM节点,还是文本节点
  if (isVnode(vnode)) {
    // DOM 节点
    const { elementName, attributes, children, key } = vnode

    const tag = HTML_TAGS[elementName] || NAME_SPACE[elementName]
    const object = Object.prototype.toString.call(tag) === '[object Object]'
    const localAttrs = object ? tag.attributes || {} : {}
    const attrs = Object.assign({}, GLOBAL_ATTRIBUTES, localAttrs)
    const tagType = object ? tag.name : tag // tagType 等于 void 0 表示 组件
    let domExample = null

    if (tagType === void 0) {
      // 组件
      domExample = vm._createComponentExample(vnode)
    } else if (typeof tagType === 'function') {
      // 命名空间标签
      domExample = tagType();
    } else {
      // 普通节点c
      domExample = document.createElement(tagType);
    }

    // 添加dom映射
    vm._KeyMapDom.set(key, domExample);

    if (tagType !== void 0) {
      // 对属性进行操作
      Object.keys(attributes === null ? {} : attributes).forEach(prop => {
        if (prop in attrs) {
          // 公共属性
          switch (prop) {
            case "xlink:href":
              domExample.setAttributeNS('http://www.w3.org/1999/xlink', prop, attributes[prop]);
              break;
            case "value":
              if ("value" in domExample) {
                if (domExample.tagName === "SELECT") {
                  Promise.resolve().then(function () {
                    domExample.value = attributes[prop]
                  })
                } else {
                  domExample.value = attributes[prop]
                }
              } else {
                domExample.setAttribute(attrs[prop], attributes[prop]);
              }
              break
            default:
              domExample.setAttribute(GLOBAL_ATTRIBUTES[prop] || prop, attributes[prop])
              break;
          }
        }

        if (prop in EVENT_HANDLERS) {
          if (attributes[prop] instanceof Function) {
            domExample.addEventListener(EVENT_HANDLERS[prop], function (e) {
              attributes[prop].call(vm, this, e);
            })
          } else {
            throw new BvError(`${prop} 事件值 (${JSON.stringify(attributes[prop])}) 不正确`, vm)
          }
        }

        if (prop in CUSTOM_ATTR && tagType !== void 0) {
          switch (prop) {
            case 'ref':
              if (typeof attributes[prop] === 'function') {
                // ref 传递函数
                attributes[prop](domExample)
              } else if (typeof attributes[prop] === 'string') {
                // ref 传递字符串
                CUSTOM_ATTR[prop].call(this, attributes[prop], domExample)
              }
              break;
          }
        }

        if (!(prop in attrs || prop in EVENT_HANDLERS || prop in CUSTOM_ATTR)) {
          // 自定义属性
          domExample.setAttribute(prop, attributes[prop])
        }
      })
    }

    // 处理css样式
    if (tagType !== void 0 && (attributes !== null && attributes['style'] !== null ? Object.prototype.toString.call(attributes['style']) === '[object Object]' : false)) {
      const styles = attributes.style
      if (typeof styles === 'string') {
        domExample.style = styles
      } else {
        Object.keys(styles).forEach(prop => {

          const value = styles[prop]
          if (typeof value === 'number') {
            domExample.style[prop] = `${value}px`
          } else if (typeof value === 'string') {
            domExample.style[prop] = value
          } else {
            throw new BvError(`style ${prop} 的值应为 number 或 string `, vm)
          }
        })
      }
    }

    if (tagType !== void 0) { // 组件不需要创建子节点
      // 创建子节点
      children.forEach(childNode => {
        let sonNode = vm._createElement(childNode)
        domExample.appendChild(sonNode)
      })
    }

    return domExample;

  } else if (isVtext(vnode)) {
    // 文本节点
    const { text, key } = vnode
    let domExample = null
    domExample = document.createTextNode(text)
    vm._KeyMapDom.set(key, domExample);

    return domExample
  }
}