## 快速入门

### 1. 创建第一个应用

由于该库还不支持 `src` 引入，接下来的例子我将在 `webpack` 环境下演示，<a href="https://github.com/bronze-ding/bindview-Template">webpack 模板</a> 已经配置完毕，可直接下载使用

创建一个应用可用通过 `new` 来创建实例或通过提供的  `createApp` 方法来创建下面我将分别演示

1. 通过 `new` 来创建 App , `el` 配置项用来选择 `DOM` 被渲染到那个节点下， `render` 方法返回一个虚拟 `DOM` ，`h` 函数可以创建一个虚拟 `DOM`，`render` 返回的虚拟 `DOM` 将被转换为真实 `DOM` 并添加到 id 为 Root 的 节点下，<span style="color:red">！！！</span> 通过 `new` 创建的实例常常用来配置一些全局的方法，数据和组件

```js
// 导入 Bindview.js
import Bindview from "bindview"

// new 一个实例
new Bindview({
    el:"#Root",
    render(h){
        return h("div",{},["hello"]) 
    }
})
```

2. 通过 `createApp` 方法来创建 App , 在 `createApp` 方法中传入一个组件，在通过 `$mount` 方法将虚拟 `DOM` 添加到 id 为 Root 的 节点下，如何创建一个组件将在后面讲到

```js
import { createApp } from "bindview"
import App from "./App"

createApp(App).$mount("#Root")
```

### 2. 虚拟 `DOM` 的创建

1. 通过 `h` 函数来创建虚拟 `DOM` , 虚拟 `DOM` 本质上就是一个 `真实 DOM` 抽象为一个 js 对象，对象上记录了 `DOM` 的类型，属性和子节点的信息，在 `render` 方法中可以通过 `h` 函数来创建虚拟 `DOM` , `h` 通过下面的方式都可以创建出虚拟 `DOM` , 通过 `h` 的的函数来创建 虚拟 `DOM` 的方式，不是很推荐，因为过程太繁琐我推荐使用 `JSX` 的方式来创建 

```js
// 导入 Bindview.js
import Bindview from "bindview"

new Bindview({
    el: '#Root',
    render(h) {
      return h('ul', {}, [
      	h('li', {} , []),
        h('li', null , [])
    ])
    },
  })
```

2. 通过 `JSX` 来创建，在我配置好的 <a href="https://github.com/bronze-ding/bindview-Template">webpack 模板</a> 下可以使用 `JSX` 来创建虚拟 `DOM` ,是非常推荐的做法，后面的例子都将使用 `JSX` 的形式

```js
// 导入 Bindview.js
import Bindview from "bindview"

new Bindview({
    el: '#Root',
    render() {
      return (
      	<div>Hello World</div>
      )
    },
  })
```

### 3. 组件的定义和使用

组件是 `Bindview` 中的一个重要概念，是一个可以重复使用的 `Bindview实例`，它拥有独一无二的组件名称，它可以扩展虚拟 `DOM`，以组件名称的方式作为自定义的虚拟 `DOM`。因为组件是可复用的 Bindview 实例，所以它们与`new Bindview()`接收相同的选项，例如`data`， `render(h){}`、`methods`以及生命周期钩子等。
把一些公共的模块抽取出来，然后写成单独的的工具组件或者页面，在需要的页面中就直接引入即可。那么我们可以将其抽出为一个组件进行复用。

定义一个组件，`Bindview` 的组件是一个函数返回一个配置对像，对象中只有 `render` 配置项是必须的其他的配置项都不是必须的, 函数的 `props` 形参 用来接收一些传递给组件的参数，组件中还有一些功能将在后面的内容中讲到

```jsx
// 定义一个 App 组件
export default function App(props) {
  return {
    name: 'App',
    render() {
      return (
        <div id="App">
          <div>Hello World</div>
        </div>
      )
    }
  }
}
```

使用组件, 将组件注册到 `components` 配置项中，<span style="color:red">！！！</span> 组件名一定要大写，虽然可以小写但这是为了避免一些错误，然后使用 `JSX` 方式来书写就可以使用了

```js
// 导入 Bindview.js
import Bindview from "bindview"
import App from "./App"

// new 一个实例
new Bindview({
    el:"#Root",
    render:() => (<App />),
    components:{ App }
})
```

### 4. `data` 配置项和数据响应式

`Bindview` 使用了一种类似于 <a href="https://baike.baidu.com/item/MVVM/96310?fr=ge_ala">MVVM</a> 的设计模式，数据和视图进行绑定，页面的显示结果将受 `data` 配置项中的数据影响，而 `data` 配置项中的数据使用了 `Vue3` 数据代理的方法，修改 `data` 中的数据，视图将自动更新 

在下面这个例子中，`data` 中配置一个 `num` 是数据，在 `render` 方法中 `this` 可以获取到整个组件是实例，我们通过 `this` 解构出 `data` 并重命名为 `_` ,在 `JSX` 中使用数据，在 `button` 上绑定了一个点击事件来对数据进行自增，当点击 页面上的 button 按钮时页面上的数据将自动更新

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      const { data: _ } = this

      return (
        <div id="App">
          <div>{_.num}</div>
          <button onClick={() => _.num++}>Button</button>
        </div>
      )
    },
    data:()=>({
         num: 0
    })
  }
}
```

> **数组、嵌套对象与 `delete` 同样是响应式的**：数组的 `push/pop/shift/unshift/splice/sort/reverse` 等变异方法、显式修改 `arr.length`（如 `arr.length = 0` 清空数组）以及 `delete` 删除属性都会触发视图更新；嵌套对象/数组会被缓存为**同一个代理引用**（`_.obj === _.obj`），深层属性修改（如 `_.obj.a.b = 1`）同样能更新视图。
>
> **视图更新采用微任务批处理**：同一任务内对同一实例的多次写入只触发一次 `render + diff`，因此数据修改后 DOM 并不会立刻更新。需要等待本次更新完成时，请使用原型方法 `this.$nextTick()`（见下文「原型方法」）。

### 5. `methods` 配置项

`methods` 配置项用来定义一些组件内部需要使用的方法, 下面的例子中在 `methods` 中定义了一个 `Add` 方法来对 `data` 中的 `num`  进行自增，在 `onClcik` 事件绑定中使用当点击 `button` 时将调用该方法，`Add` 方法的 `this`  指向组件实例,  <span style="color:red">！！！</span> 事件绑定中的方法或函数会接收到两个参数 第一个是事件绑定的 `DOM` 元素，第二个是事件对象 `event` ,  <span style="color:yellow">*** </span>如果组件需要使用一些方法和函数这并不是唯一的方式

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      const { data: _,methods: f } = this

      return (
        <div id="App">
          <div>{_.num}</div>
          <button onClick={f.Add}>Button</button>
        </div>
      )
    },
    data: {
      num: 0
    },
    methods:{
        Add(){
            this.data.num++
        }
    }
  }
}
```

### 6. `ref` 获取 `DOM`

`ref` 被用来给元素注册引用信息。引用信息将会注册在父组件的 `refs` 对象上。在 `DOM` 元素上使用，引用指向的就是 `DOM` 元素, `ref` 可以传入一个 `字符串` 或一个 `函数` ,传入字符串的 `DOM` 元素将引用到 `refs` 上，传入函数函数会接收的 `DOM` 元素，在组件上使用 `ref` 只能使用传入函数，函数接收的组件实例

```jsx
export default function () {
  let dom // 接收 dom 元素的实例
  return {
    name: 'App',
    render() {
      return (
        <div id="App">
          <div ref="div">hello</div>
          <div ref={_dom => dom = _dom}>world</div>
        </div>
      )
    },
    life:{
        created(){
            console.log(this.refs) // { div:HTMLDivElement }
        }
    }
  }
}
```

如果使用了相同的 `ref` 信息那么，`refs` 对象中该信息将是一个数组保存了使用相同信息的 `DOM`

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      return (
        <div id="App">
          <div ref="box">hello</div>
          <div ref="box">world</div>
        </div>
      )
    },
    life:{
        created(){
            console.log(this.refs) // { box:[ HTMLDivElement , HTMLDivElement ] }
        }
    }
  }
}
```

### 7. `linkage` 联动更新

在 `Bindview` 中当父组件中触发更新时 ( 一般是 `data` 中的数据发生改变 ) 父组件会触发所有后代组件的更新，因为父组件不知道那些后代组件使用了它自身的一些数据，所以他会触发所有后代组件的更新方法，如果后代组件是视图模型中发生了变化，那么组件将更新视图，但在开发过程中一些组件只做展示效果那么可以通过 `linkage` 配置项来关闭父组件对自身的联动更新，<span style="color:yellow">*** </span>注意 `linkage` 只会关闭父组件对子组件的联动更新，而不会关闭子组件自身的数据响应式

下面的例子中给 `Son` 子组件配置了 `linkage` 配置项当改变父组件中的 `num` 的值时，子组件将不会更新来获取最新的数据来更新视图

```jsx
function Son(props) {
  const { num } = props
  return {
    name: 'Son',
    linkage: false,
    render() {
      return (
        <div>{num()}</div>
      )
    }
  }
}

export default function () {
  return {
    name: 'Dome',
    render() {
      const { data: _ } = this
      return (
        <div>
          <button onClick={() => _.num++}>num++</button>
          <Son num={() => _.num} />
        </div>
      )
    },
    data:()=>({
      num: 0
    }),
    components: { Son }
  }
}
```

### 8. 插槽

插槽是组件中不确定的部分由用户来定义，这部分就叫插槽，相当于一种占位符,在组件中通过组件函数的 `slot` 来获取插槽， `slot` 函数将返回插槽的虚拟 `DOM` ，在 `render` 中直接使用即可

在 `Bindview` 中组件插槽有两种一种是 `普通插槽` 还有一种是 `函数插槽` ,下面将分别说明每种插槽的作用

#### 1. 普通插槽

普通插槽就是在组件中直接书写文档结构这种组件的特点就是在插槽中会失去响应式，也就是说在插槽中使用了响应式数据将无法获得更新，一般用来展示一次性数据

 ```jsx
 function Son(props,slot) {
   const { num } = props
   return {
     name: 'Son',
     render() {
       return (
         <div>
           {slot()} {num()}
         </div>
       )
     }
   }
 }
 
 export default function () {
   return {
     name: 'Dome',
     render() {
       const { data: _ } = this
       return (
         <div>
           <button onClick={() => _.num++}>num++</button>
           <Son num={() => _.num}>
             <span>Num: </span>
           </Son>
         </div>
       )
     },
     data: {
       num: 0
     },
     components: { Son },
   }
 }
 ```

#### 2. 函数插槽

函数插槽就是在组件中使用一个函数将文档结构返回出去，这种方式将不会失去数据的响应式，同时它还可以拿到组件中的一些数据在 `Son` 组件中向 `slot` 传递一个字符串，在 `Dome` 组件中定义插槽的函数中可以通过 `title` 拿到并使用

```jsx
function Son(_,slot) {
  return {
    name: 'Son',
    render() {
      return (
        <div>
          {slot("Num: ")}
        </div>
      )
    }
  }
}

export default function () {
  return {
    name: 'Dome',
    render() {
      const { data: _ } = this
      return (
        <div>
          <button onClick={() => _.num++}>num++</button>
          <Son>{(title) => (
            <span>{title} {_.num}</span>
          )}</Son>
        </div>
      )
    },
    data:()=>({
      num: 0
    }),
    components: { Son },
  }
}
```

#### 3. 多插槽

在组件中可以使用多个插槽，在使用多插槽时需要使用 `{ }` 双花括号包裹，每个单独插槽就使用一个 `{}` 包裹 ，`slot` 将得到一个数组数组中包含了每个插槽

```jsx
function Son(_,slot) {
  return {
    name: 'Son',
    render() {
      return (
        <div>
          <div>插槽1 {slot[0]()}</div>
          <div>插槽2 {slot[1]()}</div>
        </div>
      )
    }
  }
}

export default function () {
  return {
    name: 'Dome',
    render() {
      return (
        <div>
          <Son>
             {<span>多插槽1</span>}
             {<span>多插槽2</span>}
          </Son>
        </div>
      )
    },
    components: { Son },
  }
}
```

### 9. proto 向原型添加属性或方法

使用 `proto` 方法可以向构造函数的原型上添加属性或方法，在创造实例前调用使用，有两种使用方法，第一种每次只能添加一个方法或属性，第二种使用对象形式可以添加多个方法或属性，

```jsx
import Bindview from "../../bindview"


// 使用一
Bindview.proto('Test', function(){
    console.log("Test")
})

// 使用二
Bindview.proto({
    Test1:"hello",
    Test2(){
        console.log("Test")
    }
})

new Bindview({
  el: '#Root',
  render(h) {
    return (
      <div>hello</div>
    )
  }
})
```

### 10.插件

插件通常用来为 Vue 添加全局功能

插件用来给 `bindview` 拓展功能，如添加全局组件或全局属性，通过 `use` 方法来使用插件, 传入数组可以使用多个插件

<span style="color:red">！！！</span> 插件需要是一个函数或一个带有 `_install_` 方法的对象，它们会获得 `bindview` 的构造器

```jsx
import { Bindview } from "bindview"
import App from "./App";

import { history } from "bindview-router"

Bindview.use(history)

new Bindview({
  el: '#Root',
  render: () => (<App />),
  components: { App }
})
```

### 11.全局组件

`components` 方法用来注册全局组件，在 `new Bindview` 之前全局注册的组件无需再注册即可使用

```jsx
import Bindview from "../../bindview"
import App from "./App";

Bindview.components("App",App) // 方式一
Bindview.components({ App }) // 方式二

new Bindview({
  el:"#Root",
  render: () => (<App />),
})
```

### 12. 动态组件

动态组件是在同一个位置根据不同的状态显示不同的组件，在动态组件中必须要有一个 `id` 参数并传入一个不会改变的唯一 `id` 

下面是一个简单的动态组件例子

```jsx
import { crateId } from "bindview"
import Dome1 from "./Dome1"
import Dome2 from "./Dome2"

export default function (props) {
  let { state } = props
  const [ a , b ] = crateId(2)

  return {
    name: 'Test',
    render() {
      return state() ? <Dome1 id={a} /> : <Dome2 id={b} />
    },
    components: { Dome1, Dome2 }
  }
}
```



## 更新机制：微任务批处理（重点）

`bindview` 的视图更新是**异步批处理**的：数据被写入的那一刻只是把组件「标记为脏」并入队，真正的 `render + diff + updated` 会在**微任务（microtask）**中执行。理解这一机制是理解后面的「生命周期调用时机」与「表单处理」的前提。

### 1. 调度器的实现

调度逻辑集中在 [`scheduler.js`](bindview@3/src/core/scheduler.js)：

- `pendingJobs`：一个 `Set`，保存待更新组件。`Set` 天然去重，**同一实例在一轮里最多只会入队一次**。
- [`queueJob()`](bindview@3/src/core/scheduler.js:41)：入队入口，由数据代理（[`DataProxy.js`](bindview@3/src/core/DataProxy.js:55) 的 `set` / `deleteProperty` / 数组变异方法）、[`$mupdate()`](bindview@3/src/core/mupdate.js:7) 以及子组件联动（[`updateComponent.js`](bindview@3/src/core/updateComponent.js:10)）调用。
- [`scheduleFlush()`](bindview@3/src/core/scheduler.js:51)：用 `Promise.resolve().then(...)` 安排一次刷新，`currentFlush` 变量保证**多次入队只对应一个微任务**。
- [`flushJobs()`](bindview@3/src/core/scheduler.js:25)：`while (pendingJobs.size > 0)` 循环消费队列，因此刷新过程中新产生的更新（父组件级联出的子组件更新）会在**同一轮**被消费完。
- [`nextTick()`](bindview@3/src/core/scheduler.js:69)：等待本次（或下一次）DOM 更新完成后执行回调 / `resolve`。

> 一句话：**赋值是同步的，DOM 更新是异步的（微任务）**。

### 2. 一次数据写入发生了什么

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      const { data: _ } = this
      return (
        <div ref="box">
          <span>{_.n}</span>
          <button onClick={() => {
            // 第 1 步：同步入队(Set 去重),此刻 DOM 仍是旧值
            _.n = 1
            _.n = 2
            _.n = 3
            // 第 2 步：微任务中 flush → render → diff → updated(只执行一次!)
          }}>add</button>
        </div>
      )
    },
    data: () => ({ n: 0 }),
    life: {
      updated() {
        // 到这里 DOM 已经是最新的
        console.log(this.refs.box.textContent) // "3"
      }
    }
  }
}
```

执行顺序：

1. 点击回调（同步）：`_.n = 1/2/3` → 三次 `queueJob`，但 `Set` 去重后队列里只有一个该实例 → 只安排**一个**微任务。
2. 当前宏任务（事件回调）结束。
3. 微任务：`flushJobs()` 取出实例 → `_Update()` → `_renderCache()` → `diffmain()` → `_updateComponent()`（把需要联动的子组件入队）→ 调用 `life.updated`。
4. 队列中若还有级联出的子组件，在同一轮 `flushJobs` 内继续消费（父先子后）。

### 3. 批处理的 6 条规则

| # | 规则 | 说明 |
| :-: | :--- | :--- |
| 1 | 写入同步入队 | `_.x = 1` 立即执行，但视图不会立刻变 |
| 2 | 同轮去重 | 同一任务内对同一实例的多次写入 → 只 `render + diff` 一次 |
| 3 | 级联同轮消费 | 父组件更新中入队的子组件，在本轮 `flushJobs` 内执行完 |
| 4 | 父先子后 | `flushJobs` 按入队顺序（`Set` 插入序）执行，父 `updated` 先于子 `updated` |
| 5 | 空转守卫 | 未初始化（`_oldvnode` 为 `undefined`）或已卸载（`_oldvnode === null`）的实例**不会**入队，避免无效 `diff` |
| 6 | `updated` 在微任务里 | 钩子不再是「赋值语句下一行」同步触发，而是本轮 flush 中触发 |

### 4. 如何「等待更新完成」

```js
// 写法一：Promise
this.data.n = 1
await this.$nextTick()
console.log(this.refs.box.textContent) // 新值

// 写法二：回调
this.data.n = 1
this.$nextTick(() => {
  console.log(this.refs.box.textContent) // 新值
})

// 写法三：测试 / 调试用,立即同步刷新(不等待微任务)
this.data.n = 1
this.$flush()
console.log(this.refs.box.textContent) // 新值
```

### 5. 常见误区

- ❌ **「赋值后立刻读 DOM」**：`_.n++ ; console.log(this.refs.box.textContent)` 读到的是旧值 → 请用 `$nextTick`。
- ❌ **在 `render` 里修改 `data`**：初始化阶段 `_oldvnode` 尚未建立，`queueJob` 会被守卫直接忽略；在更新阶段也可能引起反复渲染，属于反模式。
- ❌ **在 `updated` 中无条件修改自身依赖的 `data`**：`flushJobs` 是 `while` 循环，本轮新入队的任务会被继续消费，可能形成**同轮死循环**。如确需，请加条件判断或改用 `$nextTick` 延后。
- ⚠️ **`$mupdate(fn)` 也不是同步更新**：它会先同步执行 `fn`，再 `queueJob`，DOM 仍在微任务中更新；需要立刻读 DOM 请配 `$flush()`。



## 生命周期钩子

每个 `Bindview` 实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、将实例挂载到 DOM 并在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做 **生命周期钩子** 的函数，这给了用户在不同阶段添加自己的代码的机会

在 `Bindview` 中 **生命周期钩子** 需要配置到 `life` 配置项中

| 生命周期钩子 | 调用时机 | 调用方式 | 此时能否读 DOM |
| :---: | :--- | :---: | :---: |
| `beforeInit` | 实例初始化最开始，`data` 代理、`el`、`methods` 都还没建立 | 同步（构造过程中） | 否 |
| `created` | 真实 `DOM` 已由 `render` 创建完成 | 同步（`Init` 末尾） | 可以（通过 `refs`，时序见下） |
| `updated` | **微任务批处理**中，本轮 `render + diff` 完成后 | **异步（微任务）** | 可以（已是新 DOM） |
| `beforeDestroy` | 组件被卸载、`DOM` 被移除之前 | 同步 | 可以（元素仍在） |

<span style="color:red">！！！</span> **`updated` 是最需要注意的变化**：由于采用微任务批处理，`updated` **不再**在「修改数据的下一行」同步触发，而是在本轮更新队列被 flush 时才触发；并且同一轮内对同一实例的多次写入只会触发**一次** `updated`。

钩子与调度器的关系（详见上一章「更新机制：微任务批处理」）：

```
赋值 _.n++  ──同步──▶ queueJob(vm) 入队(Set 去重)
                │
                ▼  ──微任务(flushJobs)──
        _Update() → render → diffmain → _updateComponent() → life.updated()
                │
                ▼
        (若本轮还有级联子组件,继续 while 消费 → 子组件 updated)
```

### 1. `beforeInit` 

`beforeInit` 会在组件实例初始化时调用，是本轮生命周期中**最早**的一个钩子（见 [`Init.js`](bindview@3/src/core/Init.js:26)）。

- **形参**：传入的是 `config.data` 的**原始值**（即你写在 `data` 配置项里的对象或函数），而**不是**整个配置对象。
- 此时 `vm.data`（响应式代理）、`vm.el`、`vm.methods`、`vm.refs` **都还不存在**，因此不要在 `beforeInit` 中访问 `this.data`。
- 推荐用法是通过 `this` 向实例上挂载一些**非响应式**的自定义字段 / 方法（例如下面的 `this.datas`）；若 `data` 是对象形式，也可以通过形参直接补默认值（后续代理使用的正是同一个对象引用，对函数形式的 `data` 无效）。

```jsx
function Life() {
  return {
    name: "Lifecomponents",
    render() {
      return (
        <div>hello</div>
      )
    },
    life: {
		beforeInit(dataConfig){
		          // dataConfig 是 data 配置项的原始值(对象 / 函数),注意此时 this.data 还不存在
		          console.log(dataConfig)
		      }
    }
  }
}
```

### 2. `created` 

`created` 钩子会在 `render` 配置项中的 **虚拟DOM** 被创建为 **真实DOM** 后调用，在此阶段就可以通过 `refs` 得到 `DOM` 元素了。

需要注意两点时序问题：

1. **`created` 是同步调用的**（在 [`Init.js`](bindview@3/src/core/Init.js:110) 末尾），它发生在初始化流程内部。
2. **能否立刻读到「正确」的值要分情况**：
   - 使用 `el` 配置项时，`created` 触发时元素已经插入页面；
   - 使用 `createApp(...).$mount()` 时，`created` 触发时元素**尚未插入文档**，但通过 `refs` 依然可以访问（只是 `document.querySelector` 查不到、依赖布局的测量会得到 0）；
   - **`<select>` 的初始 `value` 由微任务写入**（见「表单处理」章节），在 `created` 中**同步**读取 `this.refs.sel.value` 拿到的是浏览器默认选中的首项，而不是你传入的目标值。**请用 `$nextTick` 读取**。

```jsx
life: {
  created() {
    // 元素已创建,refs 可用
    console.log(this.refs.box)
    // 涉及 <select> 初始值:请等到 DOM 更新完成后再读
    this.$nextTick(() => {
      console.log(this.refs.sel.value)
    })
  }
}
```

```jsx
function Life() {
  return {
    name: "Lifecomponents",
    render() {
      return (
        <div ref="box">hello</div>
      )
    },
    life: {
		created(){
            console.log(this.refs['box'])
        }
    }
  }
}
```

### 3. `updated` 

`updated` 钩子会在本次**批处理刷新**完成后调用：同一轮数据变更中，同一组件实例只会触发一次 `updated`（多次写入会被合并为一次更新）。

在**微任务批处理**模式下，它相比「每次 `set` 都同步更新」的旧行为有以下差异：

| 对比项 | 旧行为（同步更新） | 现在（微任务批处理） |
| :--- | :--- | :--- |
| 触发时机 | 每次赋值后立即 | 本轮 flush（微任务）时 |
| 触发次数 | 写入 N 次 → N 次 | 写入 N 次 → **1 次** |
| 触发位置 | 赋值语句所在调用栈 | 独立的微任务调用栈 |
| 多实例顺序 | 各自独立 | 父组件先于子组件（同一轮 FIFO） |

因此：

- **不要**把「赋值后紧跟着的代码」当作 `updated` 的时机，那时代码先于 `updated` 执行。
- 想在 `updated` 里读最新 `DOM` 是可以的（此时 `diff` 已完成）。
- 想在**任意位置**等待更新结束，用 `$nextTick`；测试中想同步刷新用 `$flush`。
- <span style="color:red">！！！</span> **不要在 `updated` 中无条件修改自身依赖的 `data`**：`flushJobs` 使用 `while` 循环，本轮新入队的任务会被继续消费，可能造成同一轮内**反复更新甚至死循环**。

```jsx
life: {
  updated() {
    console.log("本轮更新完成, DOM 已是最新")
  }
}
```

```jsx
function Life() {
  return {
    name: "Lifecomponents",
    render() {
      return (
        <div>hello</div>
      )
    },
    life: {
		updated(){
            console.log("date发生改变")
        }
    }
  }
}
```

### 4. `beforeDestroy` 

 `beforeDestroy` 钩子会在组件被卸载之前调用，在此阶段可以注销事件监听，和清空定时器

```jsx
function Life() {
  return {
    name: "Lifecomponents",
    render() {
      return (
        <div>hello</div>
      )
    },
    life: {
		beforeDestroy(){
            // 清空定时器或注销事件监听
        }
    }
  }
}
```



## 表单处理

表单是「数据 ↔ 视图」最容易出问题的地方，`bindview` 对表单做了一系列专门处理（见 [`createElement.js`](bindview@3/src/core/createElement.js)、[`SetAttr.js`](bindview@3/src/core/diff_core/SetAttr.js)、[`boolAttr.js`](bindview@3/src/core/boolAttr.js)、[`diffmain.js`](bindview@3/src/core/diff_core/diffmain.js)）。本章说明推荐写法与必须注意的时序。

### 1. `value`：走 DOM property 并做归一化

`value` 不会被当成普通 attribute 写入，而是写入 **DOM property**，并做归一化（[`normalizeValue.js`](bindview@3/src/tools/normalizeValue.js:11)）：

| 传入 | 渲染结果 |
| :--- | :--- |
| `value={undefined}` | `""`（**不会**渲染成 `"undefined"`） |
| `value={null}` | `""` |
| `value={0}` | `"0"` |
| `value={"abc"}` | `"abc"` |

建节点与 `diff` 更新两处都做了同样的归一化，因此 `value` 在 `undefined ↔ "x"` 之间来回切换都是可靠的。

> `value` 在 diff 中被**删除**时（新 `vnode` 不再包含该属性），框架会移除对应 attribute 并把 `dom.value` 置为 `''`（见 [`diffmain.js`](bindview@3/src/core/diff_core/diffmain.js:169)）。

### 2. 布尔属性：写 property，不再是「有属性即为真」

HTML 布尔属性的语义是「存在即为真」，若用 `setAttribute('checked', false)` 会写出 `checked="false"`（属性存在 → 元素**反而被勾选**）。为此 `bindview` 对以下属性统一走 **DOM property**（[`BOOL_ATTRS`](bindview@3/src/core/dict.js:483)）：

| 分类 | 属性 |
| :--- | :--- |
| 表单 | `checked`、`selected`、`disabled`、`readOnly`、`required`、`multiple` |
| 自动 / 播放 | `autoFocus`、`autoPlay`、`controls`、`loop`、`muted` |
| 其他 | `open`、`hidden`、`default`、`isMap`、`noValidate`、`reversed`、`allowFullscreen`、`async`、`defer` |

由此带来两个关键保证：

1. **取值为 `false` 时不会输出该 attribute**，也不会把元素设为勾选 / 禁用；
2. **程序化改回 `false` 能穿透用户交互产生的 dirty 状态**，正确取消勾选 / 取消选中（例如「清除已完成」「全不选」这类操作）。

```jsx
<input type="checkbox" checked={_.ok} onChange={f.onChange} />
<input disabled={_.disabled} />
<input type="radio" name="g" checked={_.g === 'a'} onChange={f.pickA} />
```

> 「写 property 并同步 attribute」意味着 `outerHTML`、表单序列化、CSS 选择器（如 `[checked]`）的表现也符合预期。

### 3. `<select>` 的时序：初始值由微任务写入

`<select>` 比较特殊：它的 `value` 依赖 `option` 子节点存在，而建节点时属性处理**早于**子节点创建，所以框架对 `SELECT` 的 `value` 采用**微任务写入**（[`createElement.js`](bindview@3/src/core/createElement.js:61)）：

```js
if (domExample.tagName === "SELECT") {
  Promise.resolve().then(function () { domExample.value = val })
}
```

由此产生一条**必须遵守**的规则：

<span style="color:red">！！！</span> **不要在 `created` 中同步读取 `<select>` 的初始值。**

- `created` 里同步读 `this.refs.sel.value` → 得到的往往是浏览器默认选中的**第一项**，不是 `value` 目标值；
- 正确做法是在 `$nextTick` 中读取。

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      const { data: _, methods: f } = this
      return (
        <select ref="sel" value={_.picked} onChange={f.onPick}>
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      )
    },
    data: () => ({ picked: 'b' }),
    methods: {
      onPick(dom) { this.data.picked = dom.value }
    },
    life: {
      created() {
        // ❌ 同步读到的是浏览器默认首项
        console.log(this.refs.sel.value)
        // ✅ 等到 DOM 更新完成
        this.$nextTick(() => {
          console.log(this.refs.sel.value) // "b"
        })
      }
    }
  }
}
```

### 4. 同一轮内「选项列表」与 `value` 同时变化

`diff` 的处理顺序是 **attributes → children**。若同一轮内 `option` 列表被重建、同时 `value` 又指向新选项，写 `value` 的那一刻新 `option` 还不存在，浏览器会把 `select.value` 置为 `''` 且不再自动纠正。

框架在**子节点处理完成后**会再做一次受控同步（[`syncSelectValue()`](bindview@3/src/core/diff_core/diffmain.js:50)），因此下面这种写法是可靠的：

```jsx
data: () => ({ picked: 'y', opts: ['x', 'y'] }),

methods: {
  changeOptions() {
    // 同一轮内同时改选项与目标值
    this.data.opts = ['m', 'n']
    this.data.picked = 'n'
    this.$nextTick(() => {
      console.log(this.refs.sel.value) // "n"
    })
  }
}

// render
<select ref="sel" value={_.picked} onChange={f.onPick}>
  {_.opts.map(o => <option value={o}>{o}</option>)}
</select>
```

> `syncSelectValue` 只在 `value` 非 `undefined` / `null` 时生效，比较时会做 `String()`，因此 `value={1}` 与 `<option value="1">` 也能正确匹配。

### 5. 事件回写：回调签名是 `(dom, event)`

`bindview` 的事件处理器接收两个参数，**不是** React 的 `(event)`：

```jsx
methods: {
  onInput(dom, event) { this.data.text = dom.value },
  onChange(dom) { this.data.flag = dom.checked },
  onSelect(dom) { this.data.picked = dom.value },
  onSubmit(dom, event) { event.preventDefault(); /* ... */ }
}
```

> `this` 指向组件实例（见 [`eventBinding.js`](bindview@3/src/core/eventBinding.js:21)）。

### 6. 为什么「受控」但不「强制」——务必在事件里回写数据

`bindview` 的数据流向是**数据 → DOM 单向同步**：只有当 `data` 真正发生变化时才会安排 diff。这意味着：

- 用户输入后，若你在事件里**没有**把 DOM 的值写回 `data`，数据没变 → 不触发更新 → **DOM 会保留用户输入**（不会像 React 那样回滚）；
- 因此「受控表单」在 `bindview` 中的正确姿势是：**在 `onInput` / `onChange` 里立刻写回 `data`**。

```jsx
methods: {
  onInput(dom) { this.data.text = dom.value } // 必须回写
}
```

### 7. 完整示例

```jsx
export default function () {
  return {
    name: 'Form',
    render() {
      const { data: _, methods: f } = this
      return (
        <form onSubmit={f.submit}>
          {/* 文本框 */}
          <input value={_.text} onInput={f.onText} />

          {/* 复选框 */}
          <input type="checkbox" checked={_.agree} onChange={f.onAgree} />

          {/* 单选 */}
          <label><input type="radio" name="g" checked={_.g === 'a'} onChange={f.radioA} />A</label>
          <label><input type="radio" name="g" checked={_.g === 'b'} onChange={f.radioB} />B</label>

          {/* 下拉框 */}
          <select value={_.picked} onChange={f.onPick}>
            <option value="a">A</option>
            <option value="b">B</option>
          </select>

          {/* 多行文本 */}
          <textarea value={_.text} onInput={f.onText} />

          {/* 禁用状态 */}
          <input disabled={_.disabled} />

          <button type="submit" disabled={_.disabled}>提交</button>
        </form>
      )
    },
    data: () => ({
      text: 'hello',
      agree: false,
      g: 'a',
      picked: 'a',
      disabled: false
    }),
    methods: {
      onText(dom) { this.data.text = dom.value },
      onAgree(dom) { this.data.agree = dom.checked },
      radioA(dom) { if (dom.checked) this.data.g = 'a' },
      radioB(dom) { if (dom.checked) this.data.g = 'b' },
      onPick(dom) { this.data.picked = dom.value },
      submit(dom, e) {
        e.preventDefault()
        console.log({ ...this.data })
      }
    }
  }
}
```

### 8. 表单注意事项清单

- ✅ `value` / `checked` / `selected` / `disabled` 用**属性**方式绑定，框架自动走 property，不要手动 `setAttribute`。
- ❌ **不要直接改 `dom.value`** 后指望数据被更新——数据层不会知道，也不会触发 `updated`（可用 `$mupdate` 强制刷新视图，但数据与 DOM 会不一致）。
- ⚠️ **`<select multiple>`**：`value` property 只能表达单选，多选请改用每个 `<option>` 的 `selected` 属性，或在 `onChange` 中读取 `dom.selectedOptions` 自行维护数组。
- ⚠️ **`<input type="file">`**：出于安全限制，浏览器不允许程序化写入 `value`，请只读 `dom.files`。
- ⚠️ **`<textarea>`**：不要同时用 `value` 属性和子文本节点传值；推荐只用 `value`（框架按 property 写入）。
- ⚠️ **`<select>` 初始值**：`created` 中同步读取不可靠，请用 `$nextTick`（见第 3 节）。
- ✅ **表单提交**：`<form onSubmit={...}>` 记得 `event.preventDefault()`，注意**第二个参数**才是事件对象。
- ✅ **attribute 与 property 相互独立**：`input.setAttribute('value', 'attr')` **不会**改变已渲染的 `input.value`（框架受控更新写的是 property）。
- ✅ **程序化取消勾选**：`data.flag = false` 能正确取消（布尔属性写 property，可穿透 dirty 状态）。



## 原型方法

在  `Bindview` 组件实例中有一些以 `$` 开头的原型方法，这些方法提供了一些方便开发的功能，这些方法中有些一般情况下只是用一次应为这些方法一般是是用来给组件添加一些配置的 如 添加全局组件，下面将说明每个原型方法的作用和使用方法

### 1. `$appendComponent`

`$appendComponent` 追加组件，向已经创建好的组件中注册新的组件在 `created` 生命周期中调用，一般来注册异步请求后的组件

```jsx
export default function App() {
  return {
    name: 'App',
    render() {
      const { data: _ } = this
      return (
        <div id="App">
         {_.show?<div>占位<div>:<Test id="UUID" />}
        </div >
      )
    },
    data: () => ({
      show: false
    }),
    life: {
     async created() {
        let module=await import("@/components/Test")
        this.$appendComponent("Test",module.default)
        this.data.show=true
      }
    }
  }
}
```

### 2. `$mount`

`$mount` 安装组件， 将组件实例安装到页面上，方法需要传入一个 DOM 选择字符串 ( '#Root' , '.Root' 等) 或是一个 DOM 元素

```jsx
import { createApp,Bindview } from "../../bindview";
import App from "./App"

createApp(App).$mount("#Root")

// new Bindview({
// render: () => (<App />),
//   components: { App }
// }).$mount("#Root")
```

### 3. `$remove`

`$remove` 卸载组件，通过组件实例调用可卸载组件，卸载时会调用 `beforeDestroy` 生命周期钩子

```jsx
import { createApp } from "../../bindview";
import App from "./App"

const vm = createApp(App).$mount("#Root")

// 卸载组件
vm.$remove()
```

### 4. `$mupdate`

`$mupdate` 方法用于**手动**驱动一次视图更新，适合「修改了没有数据响应式的数据（如 `this.datas`），但希望视图刷新」的场景（见 [`mupdate.js`](bindview@3/src/core/mupdate.js:7)）。

- 传入函数时，会**先同步执行**该函数，再把组件入队；
- 但它**同样走调度器**（`queueJob`）：

<span style="color:red">！！！</span> `$mupdate` **不是同步更新** —— 函数内改完数据后紧接着读 DOM 仍然是旧值。需要立刻读 DOM 时请配合 `$flush()`，或改用 `await this.$nextTick()`。

- 它与数据响应式写入**共用同一个去重队列**：同一轮里 `$mupdate` 与 `_.x++` 混用，也只会 `render + diff` 一次。

```jsx
export default function () {
  return {
    name: 'App',
    render() {
      const { methods: f } = this
      return (
        <div ref="Box" className="App">
          App
          <div>{f.datas()}</div>
          <button onClick={f.addData}>addDatas</button>
        </div>
      )
    },
    methods: {
      addData() {
        this.$mupdate(() => {
          this.datas++
        })
      },
      datas() {
        return this.datas
      }
    },
    life: {
      beforeInit() {
        this.datas = 0
      }
    }
  }
}
```

### 5. `$nextTick` 与 `$flush`

由于视图更新采用**微任务批处理**，数据修改后 DOM 并不会立刻更新，这两个方法就是用来「对齐时机」的。

#### `$nextTick(cb?)`

- 返回一个 `Promise`；传入的 `cb` 会在 DOM 更新完成后执行，`Promise` 也会在此时 `resolve`。
- 会把回调**挂到当前这一轮的 flush 之后**：如果此刻队列里还有待更新任务，它会先安排刷新，再在刷新完成后回调。
- 即使没有待更新任务，也会在当前微任务之后执行（语义上等价于 `Promise.resolve().then(cb)`）。

```jsx
methods: {
  async add() {
    this.data.n = 2
    await this.$nextTick()          // 等待本次更新完成
    console.log(this.refs.box.textContent)
  },
  add2() {
    this.data.n = 3
    this.$nextTick(() => {          // 回调写法
      console.log(this.refs.box.textContent)
    })
  }
}
```

#### `$flush()`

- 调用调度器 [`flushJobs()`](bindview@3/src/core/scheduler.js:25)，**立即同步**消费待更新队列（不等待微任务）。
- 刷新过程中新入队的任务（父组件级联出的子组件）也会在本次 `$flush` 内一并消费完。
- 主要用于**测试与调试**，业务代码请优先使用 `$nextTick`。

```js
vm.data.n++
vm.$flush() // 同步刷新,可立即读取最新 DOM
```

> **读取表单初始值的时机**：`<select>` 的初始 `value` 由微任务写入（需等待 `option` 就绪）。因此在 `created` 中同步读取 `this.refs.sel.value` 拿到的是浏览器默认选中的首项，而不是目标值；请在 `$nextTick` 中读取。详见「表单处理」章节。

### 6. `$registryStats`（调试统计）

返回当前实例 `_KeyMapDom` / `_KeyMapComponent` 两个映射的**数量与 key 列表**，便于排查 DOM/组件映射是否泄漏：

```js
console.log(vm.$registryStats())
// { dom: 12, component: 3, domKeys: [...], componentKeys: [...] }
```

## 工具函数

在 `Bindview` 中不止有 `Bindview` 构造函数还提供了一些便于开发的工具函数

### 1. `send` 

`send` 方法简化组件间传递参数的方法，该方法需要传入两个参数 1.数据源 2.数据项，该方法会返回一个对象对象中有两个方法分被是`get` `set` 用来获取和修改数据

```jsx
import { Bindview, send } from "bindview"

// Dome 组件
function Dome(props) {

  let { num, arr } = props

  return {
    name: 'Dome',
    render() {
      const { methods:f } = this  
      return (
        <div>
          <div>Dome</div>
          <div>{num.get()}</div>
          <button onClick={f.set}>set</button>
          <div>{arr.get()}</div>
          <button onClick={f.setArr}>setArr</button>
        </div>
      )
    },
    methods: {
      set() {
        // 1. num.set(100)
        // 2. i 是数据
        num.set(i => {
          return ++i;
        })
      },
      setArr() {
        arr.set(100)
      }
    }
  }
}


export default function () {
  return {
    el: '#Root',
    render() {
      const { data: _ } = this
      return (
        <div>
          <div>App</div>
          <Dome num={send(_, 'num')} arr={send(_.arr, 1)} />
        </div>
      )
    },
    data: {
      num: 0,
      arr: [1, 2, 3, 4]
    },
    components: { Dome }
  }
}
```

### 2. `createId`

`createId` 函数用来创建多个唯一的 `ID`， 函数传入一个数值返回一个长度为该数值的数组数组中包含了唯一 `ID`,不传入将返回一个唯一的 `ID` ,一般配合动态组件使用

```jsx
import { crateId } from "bindview"
import Dome1 from "./Dome1"
import Dome2 from "./Dome2"

export default function (props) {
  let { state } = props
  const [ a , b ] = crateId(2)

  return {
    name: 'Test',
    render() {
      return state() ? <Dome1 id={a} /> : <Dome2 id={b} />
    },
    components: { Dome1, Dome2 }
  }
}
```

### 3. `createApp`

`createApp` 用来创建组件实例，创建的组件实例需要通过 `$mount` 进行挂载， `createApp` 可以传入两个参数第一个参数是组件函数是必须的，第二个是 `props` 对象不是必须的，这个对象在组件函数的 `props` 可以得到

```jsx
import { createApp } from "../../bindview";
import App from "./App"

createApp(App, { title: '这是props' }).$mount("#Root")
```
### 4. `propsType`
`propsType` 用来约束父组件传递给子组件的数据的类型,需要传递两个参数 一个的 `props` , 一个是约束配置对象
```jsx

import { propsType } from "../../../bindview"

export default function B(props) {
  const { test } = propsType(props, {
    test: ['object'],
    a: 'array'
  })

  return {
    name: 'A',
    render() {
      return (
        <div>
          <div>{test.get()}</div>
        </div>
      )
    }
  }
}
```

## 注意事项与常见陷阱

汇总使用 `bindview` 时最容易踩坑的点。

### 1. 更新时机

- **赋值与读 DOM 之间必须隔一次 `$nextTick`**（测试中可用 `$flush` 同步刷新）。
- **`updated` 在微任务中触发**，不是赋值语句的下一行；同一轮多次写入只触发一次。
- **不要在 `updated` 里无条件修改自身依赖的数据**，否则会在同一轮内反复更新。
- **不要在 `render` 中修改 `data`**：初始化阶段会被调度器守卫忽略，更新阶段可能引起重复渲染。

### 2. 引用与 `key`

- `key` **一经确定不可变化**，变化会直接抛 [`BvError`](bindview@3/src/tools/BvError.js)（见 [`diffmain.js`](bindview@3/src/core/diff_core/diffmain.js:217)）。
- **纯 keyed 列表**（所有子节点都带 `key`）才会走 key 对齐算法，支持插入 / 删除 / **重排**并复用真实 DOM；只要有一个子节点缺 `key` 就会退化为按索引比较。
- 列表渲染请始终为同级兄弟节点提供**稳定且唯一**的 `key`。

### 3. 组件

- 组件名**建议大写**（避免与 HTML 标签混淆）；未注册的组件会被渲染成红色警告占位块。
- **动态组件必须提供唯一且不变的 `id`**（可配合 `createID()`），否则会出现更新 / 卸载异常。
- `linkage: false` 只关闭「父组件更新时对子组件的联动更新」，**不影响**子组件自身的数据响应式，也**不会**阻止销毁级联（[`Remove.js`](bindview@3/src/core/Remove.js:28) 会无条件注销子组件）。
- 在 `created` 中异步加载组件后，用 `$appendComponent` 注册；注册完成后记得改一次数据以触发渲染。

### 4. 插槽

- **普通插槽**（直接写文档结构）会**失去响应式**，只适合一次性内容。
- 需要响应式请使用**函数插槽**。
- 多插槽需要用 `{}` 分别包裹，此时 `slot` 参数会收到数组。

### 5. 事件

- 事件回调签名是 `(dom, event)`，**不是** React 的 `(event)`；`this` 指向组件实例。
- 事件处理器支持在 `diff` 阶段新增 / 更新 / 移除；但仍建议避免在每次渲染时创建全新的内联函数，以减少无谓的属性比较。

### 6. 环境与构建

- `bindview` 依赖浏览器 DOM，在 **SSR / Node** 环境下初始化或 `$mount` 会**抛出明确错误**（见 [`domEnv.js`](bindview@3/src/tools/domEnv.js)）。
- 版本横幅仅在开发模式（`__DEV__`）且 `Bindview.displayVer` 为真时打印；生产构建会裁剪 `console.warn`。
- 目前不支持源码 `src` 直接引入，推荐使用官方 webpack 模板。

### 7. 卸载与调试

- `$remove()` 会先触发 `beforeDestroy`，随后移除 DOM 并清空 `_KeyMapDom` / `_KeyMapComponent`；卸载后实例 `_oldvnode` 为 `null`，此时再改数据**不会**再调度更新。
- `$registryStats()` 可用来检查 DOM / 组件映射是否残留（排查内存泄漏）。
- 动态修改 `ref` 属性非常不推荐（框架会发出警告）。

### 8. 其他

- `{null}` / `{undefined}` / `{false}` / `{true}` 作为子节点**不会**被渲染成文本，可以放心书写 `{cond && <div/>}`。
- `data` 支持对象或函数；**组件内推荐使用函数**，可为每个实例返回独立数据。
- 数组的变异方法、`arr.length = 0`、`delete obj.prop`、深层嵌套属性均为响应式。



## 附录：版本变更记录

### v3.2.0 —— 微任务批处理重构

汇总本次重构带来的主要变化：

- **异步批处理更新**：新增更新调度器，同一任务内对同一实例的多次写入只执行一次 `render + diff`；新增原型方法 `$nextTick`（等待 DOM 更新）与 `$flush`（测试/调试用同步刷新）。
- **去掉重复更新**：父组件更新后，子 / 后代组件不再被重复刷新。
- **数组与代理增强**：数组变异方法、`arr.length = 0`、`delete` 删除、深层嵌套均响应式；嵌套代理被缓存为稳定引用。
- **列表 diff 增强**：带 `key` 的列表支持**排序 / 重排**（不再抛错）并复用真实 DOM 保留状态；属性增删、样式增删、文本更新更准确。
- **事件处理器可更新**：同一节点的事件可在 diff 阶段新增 / 更新 / 移除，不再永远指向旧闭包。
- **顶层数组（片段）**：`render` 可直接返回数组，按 `display: contents` 透明容器渲染。
- **映射生命周期统一**：新增调试方法 `$registryStats`；组件卸载后 DOM/组件映射不再残留悬空引用。
- **环境守卫**：`bindview` 在非浏览器（SSR / Node）环境初始化或 `$mount` 时会抛出明确错误。
- **开发 / 生产模式**：版本横幅仅在开发模式（`__DEV__`）且 `Bindview.displayVer` 为真时打印；生产构建自动裁剪 `console.warn` 警告。
- **初始化 render 单次执行**：同一初始化流程中 `render` 只调用一次。
- **卸载守卫**：已卸载 / 未初始化的组件不会执行无效 diff。
- **表单布尔属性修复**：`checked`、`selected`、`disabled`、`readOnly`、`required`、`multiple`、`autoFocus`、`autoPlay`、`open`、`hidden` 等布尔属性（见 `BOOL_ATTRS`）改为写 DOM property，取值 `false` 时不再输出 `checked="false"` 这类属性（此前会因「属性存在即为真」导致元素被勾选 / 禁用）；程序化改回 `false` 时也能穿透用户交互产生的 dirty 状态，正确取消勾选 / 选中。
- **`<select>` 受控值二次同步**：diff 中子节点处理完成后会再同步一次 `select.value`，修复「同一轮内 `option` 列表与 `value` 同时变化时 `value` 被置空」的问题（此前即使等到 `$nextTick` 也读不到目标值）。
- **表单值归一化**：`value` 属性在建节点与 diff 更新时都会做归一化，`undefined` / `null` 统一写为空串，`<input value={undefined}>` 不再渲染成 `"undefined"`。
- **空值与布尔子节点不渲染文本**：`{null}`、`{undefined}`、`{false}` / `{true}` 作为子节点不再被字符串化成 `"null"` / `"undefined"` / `"false"` 文本（与 React / Vue 语义一致），因此 `{ok && <div/>}` 这类条件渲染可以直接书写。

### 从「同步更新」迁移到「微任务批处理」

若你从旧版本升级，请重点关注以下**行为变化**：

| 场景 | 旧行为 | 新行为 / 迁移建议 |
| :--- | :--- | :--- |
| 赋值后立即读 DOM | 通常能读到新值 | 读不到；改用 `await this.$nextTick()` |
| `updated` 触发次数 | 每次写入触发一次 | 每轮 flush 触发一次 |
| `updated` 触发时机 | 与赋值同步 | 微任务中异步触发 |
| 连续多次赋值 | 触发多次渲染 | 合并为一次 `render + diff` |
| 父组件更新 | 会刷新全部后代 | 只入队需要联动的子组件，避免重复刷新 |
| `$mupdate` | 立即更新 | 走调度器，异步生效 |
| `<select>` 初始值 | 视实现而定 | `created` 中同步读取不可靠，请用 `$nextTick` |
| 测试中断言 DOM | 可直接断言 | 使用 `$flush()` 或 `await $nextTick()` |