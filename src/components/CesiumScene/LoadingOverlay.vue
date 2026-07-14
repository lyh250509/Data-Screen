<template>
  <transition name="fade">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const loading = ref(true)
const progress = ref(0)
const loadingStage = ref('init')

const loadingText = computed(() => {
  switch (loadingStage.value) {
    case 'init': return '正在初始化3D引擎...'
    case 'terrain': return '正在加载地形数据...'
    case 'buildings': return '正在构建园区建筑...'
    case 'complete': return '加载完成'
    default: return '加载中...'
  }
})

function updateProgress(stage: string, value: number) {
  loadingStage.value = stage
  progress.value = value
}

function hide() {
  loading.value = false
}

defineExpose({
  updateProgress,
  hide
})
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1e3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border: 4px solid rgba(58, 134, 255, 0.3);
  border-top-color: #3a86ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  margin-bottom: 20px;
  color: #3a86ff;
}

.loading-progress {
  width: 300px;
  height: 6px;
  background: rgba(58, 134, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3a86ff, #43e97b);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
