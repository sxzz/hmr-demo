<script setup lang="ts">
import original from './App.vue?raw'
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

const text = ref(original)

watchDebounced(
  text,
  () => {
    import.meta.hot?.send('update-code', text.value)
  },
  {
    debounce: 500,
    immediate: false,
  },
)
</script>

<template>
  <h1>Hello</h1>
  <textarea v-model="text" />
</template>

<style>
textarea {
  width: 90vw;
  height: 60vh;
}
</style>
