// ============ 调用区：想调试哪个就把其他注释掉 ============
example01_executorSync()
example02_resolveReject()
example03_throwAsReject()
example04_threeStatesThen()
example05_changeStateOnce()
example06_thenChain()
example07_thenIsAsync()
example08_catchBubble()
example09_finally()
example10_valuePassThrough()
example11_staticResolveReject()
example12_combinators()
example13_asyncReturnsPromise()
example14_awaitGetValue()
example15_awaitTryCatch()
example16_serialVsConcurrent()

// ============ 工具函数 ============
// 延迟 ms 后 resolve 一个值
function delay(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ============ 例子定义 ============

// 1. executor 函数立即同步执行
function example01_executorSync() {
  console.log('[01] executor 执行前')
  new Promise(() => {
    console.log('[01] executor 内部（同步执行）')
  })
  console.log('[01] executor 执行后')
}

// 2. executor 接收 resolve / reject 两个方法
function example02_resolveReject() {
  const myPromise = new Promise((resolve, reject) => {
    resolve('[02] 成功') // 也可调用 reject('失败')
  })
  myPromise.then((data) => console.log(data))
}

// 3. executor 内部抛异常 -> 相当于执行 reject
function example03_throwAsReject() {
  new Promise((resolve, reject) => {
    throw new Error('[03] 抛出异常')
  }).catch((err) => console.log('[03] 被捕获:', err.message))
}

// 4. 三状态 + then（onFulfilled / onRejected）
function example04_threeStatesThen() {
  new Promise((resolve, reject) => {
    resolve('[04] 成功')
  }).then(
    (data) => console.log('then resolve---', data),
    (err) => console.log('then reject---', err)
  )
}

// 5. 只有 pending 状态才能改变，且只能改一次
function example05_changeStateOnce() {
  new Promise((resolve, reject) => {
    resolve('[05] 成功') // 这一行生效
    resolve('成功2') // 之后均无反应
    reject('失败')
    throw new Error('抛出异常')
  }).then((data) => console.log(data))
}

// 6. then 返回新 promise，可链式调用，返回值向下传递
function example06_thenChain() {
  new Promise((resolve) => resolve(1))
    .then((data) => data + 1) // 返回 2
    .then((data) => console.log('[06] 链式结果:', data)) // 打印 2
}

// 7. then 回调是异步执行（微任务），晚于同步代码
function example07_thenIsAsync() {
  console.log('[07] start')
  Promise.resolve().then(() => console.log('[07] then'))
  console.log('[07] end')
  // 输出顺序: start -> end -> then
}

// 8. catch 捕获失败，错误沿链向下冒泡
function example08_catchBubble() {
  new Promise((resolve, reject) => reject('[08] 失败'))
    .then((data) => console.log(data)) // 跳过
    .catch((err) => console.log('catch---', err))
}

// 9. finally 无论成败都执行
function example09_finally() {
  delay('[09] 数据', 0)
    .then((data) => console.log(data))
    .catch((err) => console.log(err))
    .finally(() => console.log('[09] 无论如何都执行'))
}

// 10. 值穿透：then 不传回调时结果自动透传
function example10_valuePassThrough() {
  Promise.resolve('[10] 值')
    .then() // 未传 onFulfilled，值穿透
    .then((data) => console.log('穿透后拿到:', data))
}

// 11. 静态方法 Promise.resolve / Promise.reject
function example11_staticResolveReject() {
  Promise.resolve('[11] 直接成功').then((data) => console.log(data))
  Promise.reject('[11] 直接失败').catch((err) => console.log(err))
}

// 12. 组合方法：all / allSettled / race / any
function example12_combinators() {
  const p1 = delay('p1', 10)
  const p2 = delay('p2', 20)
  const p3 = delay('p3', 30)

  Promise.all([p1, p2, p3]).then((arr) => console.log('[12] all:', arr))
  Promise.allSettled([p1, Promise.reject('x')]).then((arr) =>
    console.log('[12] allSettled:', arr)
  )
  Promise.race([p1, p2]).then((data) => console.log('[12] race:', data))
  Promise.any([Promise.reject('e'), p2]).then((data) =>
    console.log('[12] any:', data)
  )
}

// 13. async 函数总是返回一个 promise
function example13_asyncReturnsPromise() {
  async function fn() {
    return '[13] 成功' // 等价于 return Promise.resolve(...)
  }
  fn().then((data) => console.log(data))
}

// 14. await 暂停函数，取出 resolve 的值（then 的同步写法）
function example14_awaitGetValue() {
  ;(async () => {
    const data = await Promise.resolve('[14] 值')
    console.log('await 拿到:', data)
  })()
}

// 15. await 的 promise reject 时在 await 处抛异常，用 try/catch 捕获
function example15_awaitTryCatch() {
  ;(async () => {
    try {
      await Promise.reject('[15] 失败')
    } catch (err) {
      console.log('catch---', err)
    }
  })()
}

// 16. 无依赖任务应用 Promise.all 并发，而非 await 串行
function example16_serialVsConcurrent() {
  ;(async () => {
    const p1 = () => delay('a', 50)
    const p2 = () => delay('b', 50)

    // 并发：耗时 ≈ max(t1, t2)
    const start = Date.now()
    const [a, b] = await Promise.all([p1(), p2()])
    console.log('[16] 并发结果:', a, b, '耗时≈', Date.now() - start, 'ms')
  })()
}
