/**
 * 获取新节点位置
 * @param {Array<Vnode|Vtext>} oldnodeArray 少虚拟节点数组
 * @param {Array<Vnode|Vtext>} newnodeArray 多虚拟节点数组
 * @returns {Array<Number>} 索引数组
 */
export default function GetNewNodeLocation(oldnodeArray, newnodeArray) {
  // 收集旧节点数组中的key
  let keySet = []
  for (let i = 0; i < oldnodeArray.length; i++) {
    keySet.push(oldnodeArray[i]['key'])
  }

  // 创建一个Set来存储数组keySet的元素  
  let setA = new Set(keySet);

  // 存储数组newnodeArray中不在数组oldnodeArray中的元素的索引  
  const indices = [];

  // 遍历数组newnodeArray  
  for (let i = 0; i < newnodeArray.length; i++) {
    // 如果newnodeArray中的元素不在setA中，则添加到indices数组  
    if (!setA.has(newnodeArray[i]['key'])) {
      indices.push(i);
    }
  }

  // 释放内存
  keySet = setA = null

  // 返回索引数组  
  return indices;
}  