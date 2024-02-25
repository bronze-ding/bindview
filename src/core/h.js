import BvError from "../tools/BvError"

/**
 * h 函数
 * @param {HTMLString} elementName 元素名
 * @param {Object} attributes 属性
 * @param {Array<VDOM>} children 子节点
 */
export default function h(elementName, attributes, children) {
  let elementNameS, attributesS, childrenS
  if (typeof elementName === 'string') {
    elementNameS = elementName
  } else {
    throw new BvError(`h 函数 elementName 需要一个 String 类型,你提供了一个 ${typeof elementName} 类型`)
  }

  if (Object.prototype.toString.call(attributes) === '[object Object]' || attributes === null || attributes === void 0) {
    attributesS = attributes
  } else {
    throw new BvError(`h 函数 attributes 需要一个普通 Object 类型`)
  }

  if (Array.isArray(children) || children === void 0 || typeof children === 'string' || typeof children === 'number') {
    childrenS = children
  } else {
    throw new BvError(`h 函数 children 需要一个普通 Array 类型`)
  }


  return {
    elementName: elementNameS,
    attributes: attributesS === void 0 ? {} : attributesS,
    children: childrenS === void 0 ? [] : childrenS
  }
}