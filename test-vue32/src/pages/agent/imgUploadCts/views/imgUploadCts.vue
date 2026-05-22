<template>
  <a-layout style="padding: 24px; min-height: 100vh;">
    <h2>Agent / ImgUploadCts</h2>
    <p>这是一个简单 demo 页面</p>
    <div>
      <a-button type="primary" @click="onClick">点击</a-button>
      <span style="margin-left: 12px;">计数：{{ count }}</span>
    </div>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
const onClick = () => { count.value++ }
</script>
