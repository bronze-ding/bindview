import { BOOL_ATTRS, GLOBAL_ATTRIBUTES } from './dict'

/**
 * 写入布尔属性(DOM property)
 *
 * HTML 布尔属性的语义是「存在即为真」,因此不能像普通属性那样直接 setAttribute:
 *   - setAttribute('checked', false) 会写成 checked="false",属性存在 → 元素反而被勾选;
 *   - 用户交互后的 checked / selected 带有 dirty 标记,再改 attribute 已不影响其状态;
 *   - 取值为假时仅 removeAttribute 也不会取消已勾选(selected)状态。
 * 所以这里统一写 DOM property(穿透 dirty 状态),并同步维护 attribute 以便
 * CSS 选择器 / 表单序列化 / outerHTML 表现符合预期。
 *
 * @param {HTMLElement} dom 目标元素
 * @param {String} prop 属性名(JSX 名,如 checked / readOnly / autoFocus)
 * @param {*} value 目标值(真值表示启用该布尔属性)
 */
export default function setBooleanAttr(dom, prop, value) {
  const realAttrName = GLOBAL_ATTRIBUTES[prop] || prop
  const propName = BOOL_ATTRS[prop] || prop
  const truthy = !!value

  if (propName in dom) {
    // 写 property:这才是用户实际观察到的状态
    dom[propName] = truthy
  }

  if (truthy) {
    if (!dom.hasAttribute(realAttrName)) dom.setAttribute(realAttrName, '')
  } else {
    dom.removeAttribute(realAttrName)
  }
}
