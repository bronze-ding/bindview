import BvWarn from "../tools/BvWarn"

/**
 * 挂载公共组件
 * @param {*} ComponentsName 组件名
 * @param {*} Components 组件
 */
export default function addComponents(ComponentsName, Components) {
  const vm = this
  switch (arguments.length) {
    case 1:
      if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
        for (let i in arguments[0]) {
          Object.defineProperty(vm.prototype._publicComponent, i, {
            value: arguments[0][i],
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      } else {
        BvWarn('Components 传递一个参数时只能为 Obiect');
      }
      break;
    case 2:
      if (typeof ComponentsName === 'string' && Components instanceof Function) {
        Object.defineProperty(vm.prototype._publicComponent, ComponentsName, {
          value: Components,
          writable: true,
          enumerable: false,
          configurable: true
        });
      } else {
        BvWarn(`Components，组件或者组件名不正确`);
      }
      break
    default:
      BvWarn('Components 传入的参数不正确');
      break;
  }
}