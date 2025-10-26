// 创建一个自定义错误类型  
class BvError extends Error {
  constructor(message, vm) {
    // 调用父类构造函数并传入message参数
    super(message);

    // 设置错误name
    this.name = `
    [Bindview]
    组件: ${vm && vm.name ? ` ${vm.name}` : '未定义'}
    `;

    // 为了保持栈跟踪，在ES6中需要手动设置
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BvError);
    } else {
      this.stack = (new Error()).stack;
    }
  }
}

export default BvError