/**
 * 挂载组件实例
 * @param {*} el 
 * @returns 
 */
export default function mount(el) {
  if (typeof el === "string" || el instanceof HTMLElement) {
    let root = el instanceof HTMLElement ? el :
      document.querySelector(el) === null ? (() => { throw new BvError(`无法获取到 DOM 选择器的 DOM 实例 ${el}, 当前组件为 ${this.name}`) })() : document.querySelector(el);
    root.appendChild(this.el)
  } else {
    throw new BvError(`el 配置项需要一个 String 类型的 DOM 选择器或 DOM 实例对象来挂载组件,你提供了一个 ${typeof el} 类型`)
  }
  return this
}