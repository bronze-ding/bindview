/**
 * 判断字符是不是 UUID
 * @param {String} str uuid
 * @returns {Boolean} 布尔
 */
export default function isUUID(str) {
  // 正则表达式匹配UUID格式  
  const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return regex.test(str);
}