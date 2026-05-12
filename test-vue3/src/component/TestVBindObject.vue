<script setup>
import { onMounted, useTemplateRef } from 'vue'

const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color:green',
}

const boxRef = useTemplateRef('boxRef')

onMounted(() => {
  console.log('[v-bind-object] outerHTML =', boxRef.value?.outerHTML)
  console.log('[v-bind-object] id =', boxRef.value?.id)
  console.log('[v-bind-object] className =', boxRef.value?.className)
  console.log('[v-bind-object] style.backgroundColor =', boxRef.value?.style.backgroundColor)
})
</script>

<template>
  <div ref="boxRef" :="objectOfAttrs">v-bind object test</div>
</template>
