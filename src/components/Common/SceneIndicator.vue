<template>
  <div class="scene-indicator">
    <div class="indicator-header">
      <div class="indicator-icon">🏢</div>
      <h4>3D场景信息</h4>
    </div>
    <div class="indicator-content">
      <div class="building-count">
        <span class="label">建筑数量：</span>
        <span class="value">{{ buildingCount }}</span>
      </div>
      <div v-if="selectedBuilding" class="selected-info">
        <div class="selected-title">已选择</div>
        <div class="selected-name">{{ selectedBuilding.name }}</div>
      </div>
      <div v-else class="hint">
        <span>💡 点击建筑查看详情</span>
      </div>
    </div>
    <div class="indicator-footer">
      <div class="linkage-info">
        <span class="linkage-icon">🔗</span>
        <span class="linkage-text">二三维联动</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/stores/scene'

const sceneStore = useSceneStore()

const buildingCount = computed(() => sceneStore.buildings.length)
const selectedBuilding = computed(() => sceneStore.selectedBuilding)
</script>

<style lang="scss" scoped>
.scene-indicator {
  position: absolute;
  top: 0.15rem;
  left: 0.15rem;
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(58, 134, 255, 0.3);
  border-radius: 8px;
  padding: 0.15rem;
  min-width: 2.2rem;
  backdrop-filter: blur(10px);
  z-index: 1001; // 提高层级，确保不被其他元素遮挡
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.indicator-header {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  margin-bottom: 0.12rem;
  padding-bottom: 0.1rem;
  border-bottom: 1px solid rgba(58, 134, 255, 0.2);

  .indicator-icon {
    font-size: 0.18rem;
  }

  h4 {
    font-size: 0.14rem;
    color: #fff;
    margin: 0;
    font-weight: 600;
  }
}

.indicator-content {
  margin-bottom: 0.12rem;

  .building-count {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.08rem;
    background: rgba(58, 134, 255, 0.1);
    border-radius: 4px;
    margin-bottom: 0.08rem;

    .label {
      font-size: 0.12rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .value {
      font-size: 0.16rem;
      font-weight: 600;
      color: #3a86ff;
      font-family: 'Arial', sans-serif;
    }
  }

  .selected-info {
    padding: 0.08rem;
    background: rgba(67, 233, 123, 0.1);
    border: 1px solid rgba(67, 233, 123, 0.3);
    border-radius: 4px;
    animation: slideIn 0.3s ease;

    .selected-title {
      font-size: 0.11rem;
      color: rgba(67, 233, 123, 0.8);
      margin-bottom: 0.04rem;
    }

    .selected-name {
      font-size: 0.14rem;
      font-weight: 600;
      color: #43e97b;
    }
  }

  .hint {
    padding: 0.08rem;
    text-align: center;
    font-size: 0.11rem;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }
}

.indicator-footer {
  padding-top: 0.1rem;
  border-top: 1px solid rgba(58, 134, 255, 0.2);

  .linkage-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.06rem;

    .linkage-icon {
      font-size: 0.14rem;
      animation: rotate 3s linear infinite;
    }

    .linkage-text {
      font-size: 0.11rem;
      color: #3a86ff;
      font-weight: 500;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
