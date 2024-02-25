import BvWarn from "../tools/BvWarn"
import Vtext from "../tools/Vtext"
import isUUID from "../tools/isUUID"
import { isVnode, isVtext } from "../tools/isVnodeAndVtext"
import Component from "./Component"

/**
 * 插槽预处理
 * 普通插槽不会获得响应式
 * 函数插槽才会有响应式
 * @param {Array<Vnode|Vtext|Component>} children slot
 * @returns {Function|Array<Function>}
 */
function handleSlot(children) {
  if (children.length === 1 && (isVnode(children[0]) || isVtext(children[0]))) {
    return () => children[0]
  } else if (children.length === 1 && typeof children[0] === 'function') {
    return children[0]
  } else if (children.length > 1) {
    return children.map(i => {
      if (typeof i === 'function') {
        return i
      } else {
        return () => i
      }
    })
  } else {
    return null
  }
}

/**
 * 创建组件实例
 * @param {Vnode} vnode 
 * @returns {HTMLElement} Element
 */
export default function createComponentExample(vnode) {
  const vm = this
  const { elementName, attributes, children } = vnode

  let ComponentExample = new Object()
  ComponentExample.__proto__ = Component.prototype

  let Components = elementName in vm._Components ? vm._Components[elementName] : void 0
  if (Components !== void 0 && typeof Components === 'function') {
    // ^创建组件实例

    let props = Object.prototype.toString.call(attributes) === '[object Object]' ? attributes : {}

    //初始化组件实例
    ComponentExample._Init(Components(props, handleSlot(children)))

    // 处理组件中的 ref
    // 当 ref 是函数将调用该函数并传入组件实例
    if (props.ref && typeof props.ref === 'function') {
      props.ref(ComponentExample)
    }

    // 处理组件中的 key
    // 如果 props 中有 key, 将 组件上的key设置为 props 的 key
    if (props.id && typeof props.id === 'string') {
      ComponentExample._key = props.id
      if (!isUUID(props.id)) {
        BvWarn(`组件 ${elementName} 的 id: ${props.id} 应符合UUID规范,当前组件为 ${vm.name}`)
      }
    }

    vnode.key = ComponentExample._key // 将 组件的虚拟dom key 和 组件的 key 保持一致，方便后续增删获取组件实例

    // 添加到组件映射表
    vm._KeyMapComponent.set(ComponentExample._key, ComponentExample)

    ComponentExample._isComponent = true

    return ComponentExample.el
  } else {
    // 使用未注册组件生成警告
    let replace = document.createElement("div")
    replace.innerText = `[Bindview] Components 中没有注册 "${elementName}" 组件,当前组件 "${vm.name}"`
    replace.className = 'Warn'
    replace.style.backgroundColor = "yellow"
    replace.style.border = "1px #555 solid "
    replace.style.padding = '5px'
    BvWarn(`Components 中没有注册 "${elementName}" 组件,当前组件 "${vm.name}"`)
    return replace
  }
}