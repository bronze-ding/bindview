import BvWarn from "../tools/BvWarn";

/**
 * 追加组件
 * @param {Object|String} ObjAndStr 对象或者字符串
 * @param {Function} Func 函数
 */
export default function appendComponent(ObjAndStr, Func) {
  const vm = this
  if (arguments.length == 2 && typeof ObjAndStr === 'string' && typeof Func === 'function') {
    vm._Components[ObjAndStr] = Func
  } else if (arguments.length == 1, Object.prototype.toString.call(ObjAndStr) === '[object Object]') {
    for (let item in ObjAndStr) {
      vm._Components[item] = ObjAndStr[item]
    }
  } else {
    BvWarn(`$appendComponent 参数错误`, vm)
  }
}