<script setup lang="ts">
const int = MAGIC_FN()

function trigger() {
  import.meta.hot?.send('inc')
}
</script>

<template>
  <div>
    <button @click="trigger">trigger update</button>
    {{ int }}
  </div>
</template>
