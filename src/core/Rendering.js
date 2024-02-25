/**
 * 渲染 UI
 * @param {Vnode} vnode 
 */
export default function Rendering(vnode) {
  const vm = this
  if (vm.el === null) {
    vm.el = vm._createElement(vm.vnode)
  } else {
    vm.el.appendChild(vm._createElement(vm.vnode))
  }
}