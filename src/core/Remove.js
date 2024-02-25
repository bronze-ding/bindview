import BvError from "../tools/BvError";
import Component from "./Component";
import RemoveNode from "./diff_core/RemoveNode"
/**
 * 销毁组件
 * @param {VM} ComponentVM 父组件实例 
 */
export default function Remove(ComponentVM) {
  let vm = this

  // 生命周期调用 销毁前
  if (vm.life && vm.life.beforeDestroy && typeof vm.life.beforeDestroy === 'function') { vm.life.beforeDestroy.call(vm) }

  RemoveNode(vm.vnode, vm)
  vm.vnode = vm._oldvnode = null

  // 注销子组件
  vm._KeyMapComponent.forEach(item => {
    if (item._linkage) {
      item.$remove(vm);
      vm._KeyMapComponent.delete(item._key)
    }
  })

  // 注销当前组件
  if (ComponentVM instanceof Component) {
    ComponentVM._KeyMapComponent.delete(vm._key)
  } else if (vm._isComponent) {
    throw new BvError(`手动卸载 ${vm.name} 组件需要一个父组件实例参数`)
  }
}