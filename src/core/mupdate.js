/**
 * 手动更新
 * @param {Function} func 回调 
 */
export default function mupdate(func) {
  const vm = this
  if (typeof func === 'function') {
    func()
  }

  vm._Update()
}