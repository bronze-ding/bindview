/**
 * 添加原型属性
 * @param {any} string 
 * @param {any} obj 
 */
export default function proto(string, obj) {
  const Component = this
  if (arguments.length === 1 && Object.prototype.toString.call(string) === '[object Object]') {
    for (let item in string) {
      Component.prototype[item] = string[item]
    }
  } else if (arguments.length === 2 && typeof string === 'string' && Object.prototype.toString.call(obj) === '[object Object]') {
    Component.prototype[string] = obj
  }
}