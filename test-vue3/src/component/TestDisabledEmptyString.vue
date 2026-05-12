<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'

const isButtonDisabled = ref('')
const btnRef = useTemplateRef('btnRef')

onMounted(() => {
  console.log('[disabled-test] outerHTML =', btnRef.value?.outerHTML)
  console.log('[disabled-test] hasAttribute(disabled) =', btnRef.value?.hasAttribute('disabled'))
  console.log('[disabled-test] dom.disabled =', btnRef.value?.disabled)
})
</script>

<template>
  <button ref="btnRef" :disabled="isButtonDisabled">Button</button>
</template>
