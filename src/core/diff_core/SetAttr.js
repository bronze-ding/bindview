import BvWarn from "../../tools/BvWarn";
import { EVENT_HANDLERS } from "../dict"

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
      BvWarn("动态修改 ref 属性,非常非常不推荐使用");
      break;
    case 'value':
      if ("value" in dom) {
        dom.value = attr[value]
      } else {
        dom.setAttribute(value, attr[value]);
      }
      break
    default:
      if (!(value in EVENT_HANDLERS)) {
        dom.setAttribute(value, attr[value]);
      }
      break
  }
}