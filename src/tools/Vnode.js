import createID from "./createID"
class Vnode {
  constructor(vdom) {
    this.elementName = vdom.elementName
    this.attributes = Object.keys(vdom.attributes ? vdom.attributes : {}).length === 0 ? null : vdom.attributes
    this.children = []
    this.key = createID()
  }
}
export default Vnode