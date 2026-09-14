import BvWarn from "../../tools/BvWarn";
import { EVENT_HANDLERS, GLOBAL_ATTRIBUTES, BOOL_ATTRS } from "../dict"
import setBooleanAttr from "../boolAttr"
import normalizeValue from "../../tools/normalizeValue"

/**
 * 更新属性
 * @param {String} key key
 * @param {String} value 要更新的属性
 * @param {*} attr 新值的提供者
 */
export default function SetAttr(key, value, attr, vm) {
  let dom = vm._KeyMapDom.get(key);
  switch (value) {
    case 'ref':
      if (typeof attr[value] === 'function') return
      ((ref, el) => {
        if (vm.refs[ref] instanceof HTMLElement) {
          let temp = new Array(vm.refs[ref]);
          temp.push(el)
          vm.refs[ref] = temp;
        } else if (vm.refs[ref] instanceof Array) {
          vm.refs[ref].push(el)
        } else {
          vm.refs[ref] = el;
        }
      })(attr[value], dom);
      BvWarn("动态修改 ref 属性,非常非常不推荐使用", vm);
      break;
    case 'value':
      // null / undefined 归一化为空串,避免被字符串化成 "undefined"
      if ("value" in dom) {
        dom.value = normalizeValue(attr[value])
      } else {
        dom.setAttribute(value, normalizeValue(attr[value]));
      }
      break
    default:
      if (value in BOOL_ATTRS) {
        // 布尔属性:存在即为真,必须写 DOM property(详见 dict.js 中 BOOL_ATTRS 注释)
        setBooleanAttr(dom, value, attr[value])
      } else if (!(value in EVENT_HANDLERS)) {
        // 与 createElement 建节点时保持一致:将 camelCase 属性名映射为真实 HTML 属性名
        // 例如 className -> class,避免 diff 更新时写入无效的 "className" 属性
        const realAttrName = GLOBAL_ATTRIBUTES[value] || value
        dom.setAttribute(realAttrName, attr[value]);
      }
      break
  }
}