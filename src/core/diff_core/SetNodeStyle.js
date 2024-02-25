/**
 * 过滤 css 获取多的属性
 * @param {Array<String>} styleMax styleMax
 * @param {Array<String>} styleMin styleMin
 * @returns {Array<String>}
 */
function diffKeys(styleMax, styleMin) {
  // 使用 Set 数据结构来存储两个数组中的所有唯一字符串  
  const set1 = new Set(styleMax);
  const set2 = new Set(styleMin);

  // 找出在 set1 中但不在 set2 中的字符串  
  const diff1 = Array.from(set1).filter(str => !set2.has(str));

  // 找出在 set2 中但不在 set1 中的字符串  
  const diff2 = Array.from(set2).filter(str => !set1.has(str));

  // 返回两个数组中的不同字符串  
  return diff1.concat(diff2);
}

/**
 * 获取相同样式
 * @param {Array<String>} styleA 
 * @param {Array<String>} styleB 
 * @returns {Array<String>}
 */
function getTheSame(styleA, styleB) {
  const set1 = new Set(styleA);
  const set2 = new Set(styleB);

  const commonStrings = [];
  for (const item of set1) {
    if (set2.has(item)) {
      commonStrings.push(item);
    }
  }

  return commonStrings;
}


/**
 * 设置 node css 样式
 * @param {*} oldstyle 旧样式
 * @param {*} newstyle 新样式
 * @param {String} vondekey 节点 key 用来获取真实 DOM 
 * @param {Bindview} vm 
 */
export default function SetNodeStyle(oldstyle, newstyle, vondekey, vm) {
  const dom = vm._KeyMapDom.get(vondekey)
  const oldlength = Object.keys(oldstyle)
  const newlength = Object.keys(newstyle)
  if (oldlength > newlength) {
    // 旧比新的多
    // 新的多出来的项
    const duo = diffKeys(newlength, oldlength)
    const TheSame = getTheSame(newlength, oldlength) // 共有的

    // 删除多的样式
    duo.forEach(key => {
      dom.style[key] = ""
    })

    TheSame.forEach(key => {
      if (newstyle[key] !== oldstyle[key]) {
        if (oldstyle[key] !== newstyle[key]) {
          if (typeof newstyle[key] === 'number') {
            dom.style[key] = newstyle[key] + "px"
          } else if (typeof newstyle[key] === 'string') {
            dom.style[key] = newstyle[key]
          }
        }
      }
    })

  } else if (newlength > oldlength) {
    // 新比旧的多
    // 新的多出来的项
    const duo = diffKeys(newlength, oldlength)
    const TheSame = getTheSame(newlength, oldlength)
    // 添加多的样式
    duo.forEach(key => {
      if (oldstyle[key] !== newstyle[key]) {
        if (typeof newstyle[key] === 'number') {
          dom.style[key] = newstyle[key] + "px"
        } else if (typeof newstyle[key] === 'string') {
          dom.style[key] = newstyle[key]
        }
      }
    })

    TheSame.forEach(key => {
      if (newstyle[key] !== oldstyle[key]) {
        if (oldstyle[key] !== newstyle[key]) {
          if (typeof newstyle[key] === 'number') {
            dom.style[key] = newstyle[key] + "px"
          } else if (typeof newstyle[key] === 'string') {
            dom.style[key] = newstyle[key]
          }
        }
      }
    })

  } else {
    // 一样多
    for (let style in newstyle) {
      if (oldstyle[style] !== newstyle[style]) {
        if (typeof newstyle[style] === 'number') {
          dom.style[style] = newstyle[style] + "px"
        } else if (typeof newstyle[style] === 'string') {
          dom.style[style] = newstyle[style]
        }
      }
    }
  }
}