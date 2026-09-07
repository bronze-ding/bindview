/**
 * 开发 / 生产模式标志(P2.6)
 *
 * 生产构建时,打包器(webpack DefinePlugin 等)会把 `process.env.NODE_ENV`
 * 替换为字面量 "production",此处将解析为 false;
 * 开发构建会替换为 "development"(或 "test"),此处解析为 true。
 * 在未经过打包器替换的环境(如直接浏览器运行)中访问 process 会抛错,
 * 由 try/catch 兜底并默认按开发模式处理,避免 ReferenceError。
 */
let __DEV__ = true

try {
  __DEV__ = process.env.NODE_ENV !== 'production'
} catch (e) {
  // 非 Node / 未替换环境:默认按开发模式
  __DEV__ = true
}

export { __DEV__ }
export default __DEV__
