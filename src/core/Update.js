import dcopy from "deep-copy"
import Vnode from "../tools/Vnode";
import Vtext from "../tools/Vtext";
import { isVnode, isVtext, XOR } from "../tools/isVnodeAndVtext"


/**
 * 对具有 key 的列表进行 key 同步
 * @param {Array<Vnode>} oldvnodecChildren 旧子节点
 * @param {Array<Vnode>} newvnodeChildren 新子节点
 */
function Assign_list_key(oldvnodecChildren, newvnodeChildren) {
  // 创建一个映射，用于快速查找旧子节点的 key
  const oldKeysMap = new Map(oldvnodecChildren.map(child => {
    return [child.attributes.key, child]
  }));
  // 遍历新的子节点列表
  for (let i = 0; i < newvnodeChildren.length; i++) {
    const newChildKey = newvnodeChildren[i].attributes['key'];
    // 利用映射快速查找对应的旧节点 key
    if (oldKeysMap.has(newChildKey)) {
      newvnodeChildren[i].key = oldKeysMap.get(newChildKey)['key'];
      Assign_key(oldKeysMap.get(newChildKey), newvnodeChildren[i]) // 对子节点的 key 进行处理
    }
  }
}

/**
 * 赋值 key
 * @param {Vnode|Vtext} oldvnode 旧vnode
 * @param {Vnode|Vtext} newvnode 新vnode
 */
function Assign_key(oldvnode, newvnode) {
  // 新获取的Vnode没有key将旧的key 赋值给新的 
  if (oldvnode != void 0) {
    if (isVtext(newvnode) && isVtext(oldvnode)) {
      newvnode.key = oldvnode.key;
    } else if (XOR(isVtext(oldvnode), isVtext(newvnode)) || oldvnode.elementName !== newvnode.elementName) {
      // 判断如果同一级节点，节点类型不一样或节点元素名不一样,将 key 同步后不需要在为子节点进行 key 同步
      newvnode.key = oldvnode.key;
    } else if (isVnode(newvnode) && isVnode(oldvnode)) {
      newvnode.key = oldvnode.key;
      if (newvnode.children ? newvnode.children.length > 0 : false) {
        if (newvnode.children[0].attributes ? ((newvnode.children[0].attributes.key !== void 0) && (newvnode.children[newvnode.children.length - 1].attributes.key !== void 0)) ? true : false : false) {
          // 对具有 key 的列表进行单独处理
          Assign_list_key(oldvnode.children, newvnode.children)
        } else {
          for (let i = 0; i < newvnode.children.length; i++) {
            Assign_key(oldvnode.children[i], newvnode.children[i])
          }
        }
      }
    }
  }
}

/**
 * 更新预处理
 */
export default function Update() {
  const vm = this
  let newvnode = vm._renderCache() // 获取最新的虚拟节点

  // 新 vnode 预处理,进行 key 同步
  Assign_key(vm._oldvnode, newvnode)

  vm.vnode = null;
  vm.vnode = newvnode

  // 调用 diff
  vm._diffmain(vm._oldvnode, vm.vnode)

  // diff 更新完后将新的 vnode 拷贝给旧的 vnode
  vm._oldvnode = dcopy(vm.vnode)

  // 更新子组件
  vm._updateComponent()

  // 生命周期调用 更新后
  if (vm.life && vm.life.updated && typeof vm.life.updated === 'function') { vm.life.updated.call(vm) }
}