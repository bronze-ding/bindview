/**
 * 浏览器 / DOM 环境检测(P2.2)
 * bindview 依赖真实 DOM,在 SSR / Node 等无 DOM 环境应给出明确错误,
 * 而不是抛出晦涩的 ReferenceError(如 HTMLElement is not defined)。
 */

export function isDOMEnvironment() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof HTMLElement !== 'undefined'
  )
}

/**
 * 断言当前处于浏览器/DOM 环境
 * @param {String} [scope] 触发来源描述
 * @throws {Error}
 */
export function assertDOMEnvironment(scope) {
  if (!isDOMEnvironment()) {
    throw new Error(
      '[Bindview] ' + (scope || 'bindview') +
      ' 依赖浏览器 DOM(window/document/HTMLElement),' +
      '请在浏览器或提供 DOM 模拟(如 jsdom)的环境中运行'
    )
  }
}
