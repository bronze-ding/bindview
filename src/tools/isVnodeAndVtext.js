import Vnode from "./Vnode"
import Vtext from "./Vtext"

/**
 * is node type ?
 * @param {Vnode} vdom 
 * @returns {Boolean}
 */
function isVnode(vdom) {
  if (Object.prototype.toString.call(vdom) === '[object Object]') {
    return ("elementName" in vdom && "attributes" in vdom && "children" in vdom)
  } else {
    return false
  }
}

/**
 * is text type ?
 * @param {Vtext} vdom 
 * @returns {Boolean}
 */
function isVtext(vdom) {
  if (Object.prototype.toString.call(vdom) === '[object Object]') {
    return ("text" in vdom)
  } else {
    return false
  }
}

/**
 * 异或运算,
 * 如果a、b两个值不相同，则异或结果为1。如果a、b两个值相同，异或结果为0
 * @param {Boolean} a 
 * @param {Boolean} b 
 * @returns {Boolean}
 */
const XOR = (a, b) => (a && !b) || (!a && b);

export {
  isVnode,
  isVtext,
  XOR
}