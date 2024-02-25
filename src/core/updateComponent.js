/**
 * 更新组件
 */
export default function updateComponent() {
  const vm = this
  vm._KeyMapComponent.forEach(item => {
    if (item._linkage) {
      item._Update();
      // 当数据发生改变依次调用后代组件的更新函数
      item._updateComponent();
    }
  })
}