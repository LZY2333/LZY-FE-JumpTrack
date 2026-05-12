<script>
import { createImperativeDialog } from '@/utils/imperativeDialog'
import Self from './BizDialog.vue'
export const showBizDialog = createImperativeDialog(Self)
</script>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '请填写信息' },
  initData: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['resolve', 'reject'])

const visible = ref(true)
const loading = ref(false)
const form = reactive({ name: '', age: '', ...props.initData })
const errors = reactive({ name: '', age: '' })

function validate() {
  errors.name = form.name.trim() ? '' : '姓名必填'
  errors.age = /^\d+$/.test(String(form.age)) && +form.age > 0 ? '' : '年龄必须为正整数'
  return !errors.name && !errors.age
}

async function onConfirm() {
  if (!validate()) return
  loading.value = true
  try {
    await new Promise((r) => setTimeout(r, 600))
    emit('resolve', { name: form.name.trim(), age: +form.age })
    visible.value = false
  } finally {
    loading.value = false
  }
}
function onCancel() {
  emit('reject', new Error('user cancelled'))
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="biz-mask" @click.self="onCancel">
    <div class="biz-dialog">
      <div class="biz-header">
        <span>{{ title }}</span>
        <button class="biz-close" @click="onCancel">×</button>
      </div>
      <div class="biz-body">
        <div class="row">
          <label>姓名</label>
          <input v-model="form.name" placeholder="请输入姓名" />
          <span class="err">{{ errors.name }}</span>
        </div>
        <div class="row">
          <label>年龄</label>
          <input v-model="form.age" placeholder="请输入年龄" />
          <span class="err">{{ errors.age }}</span>
        </div>
      </div>
      <div class="biz-footer">
        <button :disabled="loading" @click="onCancel">取消</button>
        <button class="primary" :disabled="loading" @click="onConfirm">
          {{ loading ? '提交中…' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.biz-mask { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.biz-dialog { background: #fff; width: 380px; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.2); font-size: 14px; }
.biz-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: 600; }
.biz-close { border: none; background: transparent; font-size: 20px; cursor: pointer; }
.biz-body { padding: 16px; }
.row { display: flex; align-items: center; margin-bottom: 12px; gap: 8px; }
.row label { width: 48px; }
.row input { flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; }
.err { color: #e74c3c; min-width: 100px; font-size: 12px; }
.biz-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #eee; }
.biz-footer button { padding: 6px 14px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.biz-footer button.primary { background: #409eff; color: #fff; border-color: #409eff; }
.biz-footer button:disabled { opacity: .6; cursor: not-allowed; }
</style>
