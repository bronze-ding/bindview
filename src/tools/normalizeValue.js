/**
 * 表单值归一化
 *
 * DOM property 赋值时 `undefined` / `null` 会被字符串化为 "undefined" / "null"
 * (例如 `<input value={undefined}>` 会显示成 "undefined"),这里统一归一化为空串,
 * 与浏览器/React 的受控表单预期保持一致。
 *
 * @param {*} value 原始值
 * @returns {*} 归一化后的值
 */
export default function normalizeValue(value) {
  return value === void 0 || value === null ? '' : value
}
