/**
 * Ship 类用于封装对源对象中特定项的访问和修改操作。
 * 支持对数组或对象中的指定项进行获取和设置操作，并支持传入函数作为新值以实现更灵活的更新逻辑。
 */
class Ship {
  // 私有属性：存储源对象（数组或对象）
  #source;
  // 私有属性：存储要操作的项的键或索引
  #item;
  // 私有属性：存储结果（可选，根据需要使用）
  #result;

  /**
   * 构造函数，初始化 Ship 实例。
   * @param {Array|Object} source - 源对象，可以是数组或普通对象。
   * @param {string|number} item - 要操作的项的键（对象）或索引（数组）。
   * @throws {TypeError} 如果 source 不是数组或对象，或 item 不是有效键/索引时抛出错误。
   */
  constructor(source, item) {
    // 校验 source 类型
    if (source instanceof Array) {
      // 数组情况：item 必须是整数
      if (!Number.isInteger(item)) {
        this.#result = '错误报告：数组的项必须是有效的索引（整数）。';
      }

      // 数组越界检查
      if (item < 0 || item >= source.length) {
        this.#result = `错误报告：数组索引 ${item} 超出范围 [0, ${source.length})`;
      }
    } else if (source instanceof Object) {
      // 对象情况：item 必须是字符串
      if (typeof item !== 'string') {
        this.#result = '错误报告：对象的项必须是有效的键（字符串）。';
      }

      // 对象属性存在性检查
      if (!(item in source)) {
        this.#result = `错误报告：对象中不存在属性 "${item}"`;
      }
    } else {
      // 不支持的类型
      this.#result = '错误报告：源必须是数组或对象。';
    }

    this.#source = source;
    this.#item = item;
  }

  /**
   * 获取源对象中指定项的当前值。
   * @returns {*} 返回源对象中指定项的值或错误信息。
   */
  get() {
    return this.#result || this.#source[this.#item];
  }

  /**
   * 设置源对象中指定项的新值。
   * 如果新值是一个函数，则会将当前值传递给该函数并使用其返回值作为新值；
   * 否则直接使用提供的新值。
   * @param {*} newValue - 新值，可以是任意类型或一个接受当前值并返回新值的函数。
   * @throws {Error} 如果 source 既不是数组也不是对象时抛出错误。
   */
  set(newValue) {
    const currentValue = this.get();

    // 处理数组类型 source
    if (this.#source instanceof Array) {
      // 确保 item 是有效索引
      if (this.#item < 0 || this.#item >= this.#source.length) {
        throw new RangeError('数组索引越界');
      }

      // 更新值
      this.#source.splice(
        this.#item,
        1,
        this._processValue(currentValue, newValue)
      );
    }
    // 处理对象类型 source
    else if (this.#source instanceof Object) {
      // 更新值
      this.#source[this.#item] = this._processValue(currentValue, newValue);
    } else {
      throw new Error('不支持的源类型。');
    }
  }

  /**
   * 私有方法：根据新值类型处理当前值并返回最终结果。
   * @param {*} currentValue - 当前值
   * @param {*} newValue - 新值（可能是函数或其他类型）
   * @returns {*} 最终的新值
   */
  _processValue(currentValue, newValue) {
    return typeof newValue === 'function' ? newValue(currentValue) : newValue;
  }
}

/**
 * send 方法用于创建并返回一个新的 Ship 实例，以便对源对象中的指定项进行操作。
 * @param {Object|Array} source - 数据源，可以是数组或对象。
 * @param {String|Number} item - 要操作的项的键（对象）或索引（数组）。
 * @returns {Ship} 返回一个新的 Ship 实例。
 */
export default function send(source, item) {
  return new Ship(source, item);
}