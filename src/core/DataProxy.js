/**
 * 数据代理
 * @param {*} data 代理数据
 * @returns {Proxy} Proxy Object
 */
export default function DataProxy(data) {
  const vm = this
  return new Proxy(data, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver)
      if ((Object.prototype.toString.call(res) === '[object Object]' && res !== null) || Array.isArray(res)) {
        return DataProxy.call(vm, res);
      }
      return res
    },
    set(target, key, value, receiver) {
      // 判断新数据是否和旧数据相同
      // 相同数据不需要设置
      if (receiver[key] === value) return true

      let res = Reflect.set(target, key, value, receiver)
      // 数组改变时长度发生变化不更新
      if (Array.isArray(target) && key === 'length') return res
      vm._Update()
      return res
    },
    deleteProperty(target, propKey) {
      let success = Reflect.deleteProperty(target, propKey);

      if (success) {
        vm._Update()
      } else {
        console.error(`删除属性 ${propKey} 失败`);
      }

      return success; // 必须返回 Reflect.deleteProperty 的结果以确保原生行为生效
    },
  })
}