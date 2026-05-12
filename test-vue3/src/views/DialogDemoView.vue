<script setup>
import { ref } from 'vue'
import { showBizDialog } from '@/component/BizDialog.vue'

const log = ref([])

async function handleOpen() {
  log.value.push('打开弹窗…')
  try {
    const data = await showBizDialog({
      title: '编辑用户',
      initData: { name: '张三', age: 18 },
    })
    log.value.push(`✅ 拿到数据：${JSON.stringify(data)}`)
  } catch (err) {
    log.value.push(`❌ 用户取消：${err.message}`)
  }
}
</script>

<template>
  <div style="padding: 24px;">
    <h2>业务弹窗 Demo</h2>
    <button @click="handleOpen">打开弹窗</button>
    <pre style="background:#f5f5f5;padding:12px;margin-top:16px;">{{ log.join('\n') }}</pre>
    <router-link to="/">← 回首页</router-link>
  </div>
</template>
