/**
 * 警告方法
 * @param {*} Warn message
 */
export default function BvWarn(Warn, vm = {}) {

  console.warn(`
    [Bindview]  
    组件: ${vm.name ? ` ${vm.name}` : '未定义'}
    ${Warn}
    `);
  return ""
}