import { __DEV__ } from "./devMode"

/**
 * 警告方法(P2.6)
 * 生产构建(__DEV__ = false)时裁剪控制台输出,仅在开发模式打印
 * @param {*} Warn message
 */
export default function BvWarn(Warn, vm = {}) {
  if (!__DEV__) {
    return ""
  }

  console.warn(`
    [Bindview]  
    组件: ${vm.name ? ` ${vm.name}` : '未定义'}
    ${Warn}
    `);
  return ""
}
