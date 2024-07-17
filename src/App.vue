<script setup lang="ts">
declare function MAGIC_FN(): number

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
  <input />
</template>
