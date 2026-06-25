
# Promise

1.`promise`构造函数接收一个`executor`函数，且该函数立即执行(即同步执行)

2.`executor`函数接收两个`promise`内部提供的方法`resolve方法`和`reject方法`用于供使用者调用，在合适的时候改变`promise`成合适的状态

```js
let myPromise = new Promise((resolve,reject) => {
  //这个箭头函数就是executor
})
```

3.`executor`函数内部执行异常时会被捕获并执行`reject`

```js
let myPromise = new Promise((resolve,reject) => {
  throw new Error('抛出异常')
  //相当于执行了reject，代码出现错误同理，会被捕获且将错误传给reject并执行。
})
```

4.具备三个状态(`fulfilled`成功,`rejected`失败,`pending`等待)和then方法(使用者用于传入`onFulfilled函数`和`onRejected函数`)

```js
let myPromise = new Promise((resolve,reject) => {
  resolve('成功')
})
myPromise.then((data) => { //onFulfilled函数
  console.log('then resolve---',data);
},(err) => { //onRejected函数
  console.log('then reject---',err);
})
//注意:then中的使用者传入的onFulfilled函数和使用者executor中使用的resolve都是成功时要调用的方法，可以认为resolve触发onFulfilled。

//reject和onRejected同上
```

5.`promise`默认处于`pending`状态，且只有`promise`处于`pending`状态时，内部的`executor`才能成功调用`resolve`或`reject`并改变状态。

```js
let myPromise = new Promise((resolve,reject) => {
  resolve('成功')//resolve内部会改变状态由pending变resolve
  resolve('成功2')//这三行执行已经没有反应
  reject('失败')
  throw new Error('抛出异常')
})
```

6.`then`方法返回一个**新的**`promise`，因此可以链式调用；回调的返回值会作为下一个`then`的入参传递下去。

```js
new Promise((resolve) => resolve(1))
  .then((data) => data + 1) //返回2
  .then((data) => console.log(data)) //打印2
```

7.`then`的回调是**异步**执行的(属于微任务)，永远晚于当前同步代码。

```js
console.log('start')
Promise.resolve().then(() => console.log('then'))
console.log('end')
//输出顺序: start -> end -> then
```

8.`catch`用于捕获失败，等价于`then(null, onRejected)`；链路中任意环节的错误会一直向下冒泡，直到被`catch`捕获。

```js
new Promise((resolve, reject) => reject('失败'))
  .then((data) => console.log(data)) //跳过
  .catch((err) => console.log('catch---', err)) //捕获到'失败'
```

9.`finally`无论成功还是失败都会执行，常用于收尾(如关闭 loading)；它不接收结果，也不改变向下传递的值。

```js
fetchData()
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
  .finally(() => console.log('无论如何都执行'))
```

10.**值穿透/错误穿透**：`then`不传对应回调时，结果会自动透传给下一个`then`/`catch`。

```js
Promise.resolve('值')
  .then() //未传onFulfilled，值穿透
  .then((data) => console.log(data)) //仍能拿到'值'
```

11.静态方法`Promise.resolve()`/`Promise.reject()`可快速生成一个已确定状态的`promise`。

```js
Promise.resolve('直接成功').then((data) => console.log(data))
Promise.reject('直接失败').catch((err) => console.log(err))
```

12.组合方法处理多个`promise`：

```js
//全部成功才成功，有一个失败就立即失败，结果为结果数组
Promise.all([p1, p2, p3]).then((arr) => console.log(arr))

//等所有都结束(不短路)，返回每项的状态与结果
Promise.allSettled([p1, p2]).then((arr) => console.log(arr))

//谁先改变状态(无论成败)就用谁的结果
Promise.race([p1, p2]).then((data) => console.log(data))

//第一个成功的就成功，全部失败才失败
Promise.any([p1, p2]).then((data) => console.log(data))
```

## async / await 与 Promise 的关系

`async/await`是基于`Promise`的**语法糖**，本质还是`Promise`，只是让异步代码写起来像同步。

13.`async`函数总是返回一个`promise`：`return`的值会成为`resolve`的值，抛出的错误会成为`reject`的原因。

```js
async function fn() {
  return '成功' //等价于 return Promise.resolve('成功')
}
fn().then((data) => console.log(data)) //打印'成功'
```

14.`await`后面跟一个`promise`，它会**暂停**函数执行，直到该`promise`改变状态，再取出`resolve`的值；相当于`then`的同步写法。

```js
async function fn() {
  const data = await Promise.resolve('值') //等价于 .then(data => ...)
  console.log(data) //打印'值'
}
```

15.`await`的`promise`若`reject`，会在`await`处**抛出异常**，用`try/catch`捕获，替代`.catch()`。

```js
async function fn() {
  try {
    await Promise.reject('失败')
  } catch (err) {
    console.log('catch---', err) //捕获到'失败'
  }
}
```

16.多个无依赖的异步任务，仍应配合`Promise.all`并发，避免`await`逐个串行等待。

```js
//串行：耗时 = t1 + t2
const a = await p1
const b = await p2

//并发：耗时 = max(t1, t2)
const [a, b] = await Promise.all([p1, p2])
```
