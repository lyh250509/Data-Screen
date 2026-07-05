<template>
  <div id="app" class="smart-park-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { setScreenScale } from '@/utils/scale'

onMounted(() => {
  // 设置大屏自适应
  setScreenScale()
  window.addEventListener('resize', setScreenScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', setScreenScale)
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
