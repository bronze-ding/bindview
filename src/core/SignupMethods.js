/**
 * 注册方法
 * @param {*} Methods 配置项
 * @param {VM} vm 
 */
export default function SignupMethods(Methods, vm) {
  if (Methods !== void 0 && Object.prototype.toString.call(Methods) === '[object Object]') {
    Methods.__proto__ = vm._publicMethod
    return Methods
  } else {
    let newComponents = new Object()
    newComponents.__proto__ = vm._publicMethod
    return newComponents
  }
}