import BvWarn from "../tools/BvWarn"
import BvError from '../tools/BvError'
import Render from './Render'
import HandleMethods from "./HandleMethods"
import SignupComponents from "./SignupComponents"
import h from './h'
import dcopy from 'deep-copy'
import createID from "../tools/createID"

/**
 * Bindview 初始化函数
 * @param {*} config 配置项
 */
export default function Init(config) {
  const vm = this

  // 配置生命周期
  vm.life = Object.prototype.toString.call(config.life) === '[object Object]' ? config.life : null;

  // 生命周期调用 初始化之前
  if (vm.life && vm.life.beforeInit && typeof vm.life.beforeInit === 'function') { vm.life.beforeInit.call(vm, config.data) }

  //* 设置组件名
  if (config.name === void 0) {
    vm.name = ""
  } else if (typeof config.name === 'string') {
    vm.name = config.name
  } else {
    BvWarn("vm 配置项 name 需要一个 String 类型,你提供了一个 " + typeof config.name + "类型")
  }

  // 组件挂载 DOM 实例对象
  // 判断el配置项是 string 还是 HTMLElement
  if (typeof config.el === "string" || config.el instanceof HTMLElement) {
    vm.el = config.el instanceof HTMLElement ? config.el :
      document.querySelector(config.el) === null ? (() => { throw new BvError(`无法获取到 DOM 选择器的 DOM 实例 ${config.el}, 当前组件为 ${vm.name}`) })() : document.querySelector(config.el);

  } else if (config.el === void 0) {
    // 没有配置 el 说明需要手动挂载组件, $mount() 方法
    vm.el = null
  } else {
    throw new BvError(`el 配置项需要一个 String 类型的 DOM 选择器或 DOM 实例对象来挂载组件,你提供了一个 ${typeof config.el} 类型`)
  }

  // 设置 data 
  if (config.data === void 0) {
    vm.data = null
  } else if (typeof config.data === 'function' || Object.prototype.toString.call(config.data) === '[object Object]') {
    vm.data = vm._DataProxy(typeof config.data === 'function' ? config.data() : config.data)
  } else {
    throw new BvError(`data 配置项需要一个 Object 或 Function 类型,你提供了一个 ${typeof config.data} 类型`)
  }

  // render 缓存
  vm._renderCache = null

  // refs 回去真实dom
  vm.refs = new Object()

  // 处理 methods 的 this
  vm.methods = HandleMethods(config.methods, vm)

  // 虚拟dom对真实dom的映射
  vm._KeyMapDom = new Map()

  // 虚拟dom对 Component 的映射
  vm._KeyMapComponent = new Map()

  // 是组件还是不是组件默认不是组件
  vm._isComponent = false

  // 注册组件
  vm._Components = SignupComponents(config.components, vm)

  // 联动更新
  vm._linkage = typeof config.linkage === 'boolean' ? config.linkage : true

  // 组件 keu
  vm._key = createID()

  //* 判断 reader 函数
  if (typeof config.render === 'function') {
    vm.vnode = Render(config.render.call(vm, h), vm)
    vm._renderCache = () => Render(config.render.call(vm, h), vm)
  } else {
    throw new BvError(`render 配置项需要一个 Function 类型,你提供了一个 ${typeof config.render} 类型`)
  }

  // 渲染 UI
  vm._Rendering(vm.vnode)

  // 旧节点
  vm._oldvnode = dcopy(vm.vnode)


  // 生命周期调用 安装后
  if (vm.life && vm.life.mounted && typeof vm.life.mounted === 'function') { vm.life.mounted.call(vm) }
}