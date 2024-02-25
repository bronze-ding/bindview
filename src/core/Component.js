import BvError from "../tools/BvError";
import Init from "./Init";
import DataProxy from "./DataProxy";
import Update from "./Update"
import Rendering from "./Rendering"
import createElement from "./createElement";
import diffmain from "./diff_core/diffmain";
import mount from "./mount"
import createComponentExample from "./createComponentExample"
import updateComponent from "./updateComponent"
import Remove from "./Remove"
import appendComponent from "./appendComponent"
import mupdate from "./mupdate"

import addComponents from "./addComponents"
import use from "./use"

/**
 * Component构造函数
 * @param {Object} config 配置项
 */
function Component(config) {
  if (!(this instanceof Component)) {
    throw new BvError('Component is a constructor and should be called with the `new` keyword')
  } else {
    if (typeof config !== void 0 && config instanceof Object) {
      this._Init(config)
    }
  }
}

// 挂载全局组件
Component.components = addComponents

//加载插件
Component.use = use

// 初始化
Component.prototype._Init = Init

// 数据代理
Component.prototype._DataProxy = DataProxy

// 更新
Component.prototype._Update = Update

// 渲染UI
Component.prototype._Rendering = Rendering

// 创建真实节点
Component.prototype._createElement = createElement

// diff
Component.prototype._diffmain = diffmain

// 公共组件挂载项
Component.prototype._publicComponent = Object.create(Object.prototype)

// 创建组件实例
Component.prototype._createComponentExample = createComponentExample

// 安装组件实例
Component.prototype.$mount = mount

// 卸载组件实例
Component.prototype.$remove = Remove

// 更新子组件
Component.prototype._updateComponent = updateComponent

// 追加 组件
Component.prototype.$appendComponent = appendComponent

// 手动更新
Component.prototype.$mupdate = mupdate

export default Component