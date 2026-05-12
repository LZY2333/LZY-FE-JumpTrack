import { createApp, h } from 'vue'

/**
 * ============================================================
 *  事件 ↔ 回调 ↔ Promise 联系链路
 * ============================================================
 *
 *  约定：被包装的弹窗组件需 emits: ['resolve', 'reject']
 *    - 确认成功 → emit('resolve', data)
 *    - 取消/关闭 → emit('reject', reason)
 *
 *  ── 命名映射（Vue 规则）──────────────────────────────────
 *    子组件事件名         父级 prop 回调名
 *      'resolve'    →      onResolve     (camelCase + on 前缀)
 *      'reject'     →      onReject
 *
 *  ── 完整数据流 ────────────────────────────────────────────
 *    用户点"确定"
 *          ↓
 *    emit('resolve', data)            ← 子组件发事件
 *          ↓ (Vue 把事件名映射成 onResolve)
 *    props.onResolve(data) 被调用      ← 工厂在 h() 时挂上去
 *          ↓
 *    Promise 的 resolve(data) 执行     ← 闭包里捕获到的
 *          ↓
 *    await showXxx() 拿到 data        ← 调用方
 *
 *  ── 三层"resolve"的真实身份 ──────────────────────────────
 *    层级                       resolve 是什么
 *    子组件 emit('resolve',x)   事件名字符串（Vue 自定义事件）
 *    父组件 onResolve: fn       prop 形式的回调（Vue 自动映射）
 *    工厂 new Promise(resolve)  Promise 状态机方法（JS 原生）
 *  三者同名只为语义一致；改名为 ok/cancel 等同样能工作。
 *
 *  ── 调用示例 ──────────────────────────────────────────────
 *    // 1) 给某个弹窗组件做命令式封装
 *    export const showMyConfirm = createImperativeDialog(MyConfirm)
 *
 *    // 2) 业务侧
 *    try {
 *      const data = await showMyConfirm({ message: '确定删除？' })
 *    } catch (err) {
 *      // 用户取消
 *    }
 * ============================================================
 */

let _appContext = null
/** 在主应用 main.js 里调用：setAppContext(app._context) */
export function setAppContext(ctx) { _appContext = ctx }
export function getAppContext() { return _appContext }

/**
 * 通用工厂：把任意 emit('resolve' | 'reject') 的弹窗组件包装成命令式调用。
 * 返回 (props) => Promise<resolveValue>
 */
export function createImperativeDialog(Component) {
  return function open(props = {}) {
    return new Promise((resolve, reject) => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      let settled = false

      const cleanup = () => {
        setTimeout(() => {
          app.unmount()
          container.remove()
        }, 0)
      }

      const app = createApp({
        render: () =>
          h(Component, {
            ...props,
            onResolve: (val) => {
              if (settled) return
              settled = true
              resolve(val)
              cleanup()
            },
            onReject: (err) => {
              if (settled) return
              settled = true
              reject(err)
              cleanup()
            },
          }),
      })

      const ctx = _appContext
      if (ctx) {
        app._context.components = { ...ctx.components, ...app._context.components }
        app._context.directives = { ...ctx.directives, ...app._context.directives }
        app._context.provides = { ...ctx.provides, ...app._context.provides }
      }

      app.mount(container)
    })
  }
}

/** 一次性直接调用，等价于 createImperativeDialog(Component)(props) */
export function showDialog(Component, props) {
  return createImperativeDialog(Component)(props)
}
