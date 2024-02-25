import createID from "./createID"

class Vtext {
  constructor(vdom) {
    this.text = vdom
    this.key = createID()
  }
}

export default Vtext