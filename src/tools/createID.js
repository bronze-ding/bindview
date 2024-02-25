import BvError from "./BvError"
/**
 * 生成唯一ID数组
 * @param {Number} Generate_quantity 生成唯一ID个数
 * @returns {String|Array<string>}
 */
export default function createID(Generate_quantity) {
  // 判断参数是否正确
  if (typeof Generate_quantity !== 'undefined' && typeof Generate_quantity !== 'number') throw new BvError(`createID 函数需要一个 Number 类型的参数或无参数,你提供了一个 ${typeof Generate_quantity} 类型的`)

  // 判断需要返回ID的形式
  if (Generate_quantity === void 0) {
    // 没有传入参数直接生成并返回ID
    return getUuid()
  } else if (Generate_quantity === 0) {
    throw new BvError(`createID 函数参数不能为 0`)
  } else {
    // 如果传入 1 直接生成 ID 并返回
    if (Generate_quantity === 1) return getUuid()

    let UUIDArray = []
    let i = 0
    for (i; i < Generate_quantity; i++) {
      UUIDArray.push(getUuid())
    }
    i = null
    return UUIDArray
  }
}

/**
 * 生成唯一ID
 * @returns {UUID}
 */
function getUuid() {
  if (typeof crypto === 'object') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
      const callback = (c) => {
        const num = Number(c);
        return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
      };
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, callback);
    }
  }
  let timestamp = new Date().getTime();
  let perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16;
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (perforNow + random) % 16 | 0;
      perforNow = Math.floor(perforNow / 16);
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
};