import { queueJob } from "./scheduler"

/**
 * 更新子组件(P1.2)
 *
 * 只把每个需要更新的子组件入队一次,由调度器统一去重刷新。
 * 子组件自身的 _Update 在执行时内部会再次调用 _updateComponent 去级联其后代,
 * 因此这里不再手动调用 item._updateComponent(),避免后代组件被重复更新。
 */
export default function updateComponent() {
  const vm = this
  vm._KeyMapComponent.forEach(item => {
    if (item._linkage) {
      queueJob(item)
    }
  })
}