<script setup>
import TestDisabledEmptyString from '@/component/TestDisabledEmptyString.vue'
import TestVBindObject from '@/component/TestVBindObject.vue'
</script>

<template>
  <div style="padding:16px;">
    <router-link to="/dialog-demo">👉 业务弹窗 Demo</router-link>
  </div>
  <TestDisabledEmptyString />
  <TestVBindObject />
</template>
