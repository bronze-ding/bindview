import BvWarn from "../tools/BvWarn"

/**
 * 挂载公共方法
 * @param {*} MethodsName 方法名
 * @param {*} Methods 方法
 */
export default function addMethods(MethodsName, Methods) {
  const vm = this
  switch (arguments.length) {
    case 1:
      if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
        for (let i in arguments[0]) {
          Object.defineProperty(vm.prototype._publicMethod, i, {
            value: arguments[0][i],
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      } else {
        BvWarn('Methods 传递一个参数时只能为 Obiect');
      }
      break;
    case 2:
      if (typeof MethodsName === 'string' && Methods instanceof Function) {
        Object.defineProperty(vm.prototype._publicMethod, MethodsName, {
          value: Methods,
          writable: true,
          enumerable: false,
          configurable: true
        });
      } else {
        BvWarn(`Methods，方法或者方法名不正确`);
      }
      break
    default:
      BvWarn('Methods 传入的参数不正确');
      break;
  }
}