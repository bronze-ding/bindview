import BvError from "../tools/BvError";
import Component from "./Component";
import RemoveNode from "./diff_core/RemoveNode"
import { unregisterComponent, clearRegistry } from "./nodeRegistry"

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

  // 注销子组件(统一注销入口, P2.3)
  vm._KeyMapComponent.forEach(item => {
    if (item._linkage) {
      item.$remove(vm);
      unregisterComponent(vm, item._key)
    }
  })

  // 注销当前组件
  if (ComponentVM instanceof Component) {
    unregisterComponent(ComponentVM, vm._key)
  } else if (vm._isComponent) {
    throw new BvError(`手动卸载 ${vm.name} 组件需要一个父组件实例参数`, vm)
  }

  // 组件已销毁,兜底清空自身映射,保证删除路径完全对称(P2.3)
  clearRegistry(vm)
}