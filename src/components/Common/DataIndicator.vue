<template>
  <div class="data-indicator">
    <div class="indicator-header">
      <div class="indicator-icon">📍</div>
      <h4>实时数据分布</h4>
    </div>
    <div class="indicator-list">
      <div class="indicator-item" v-for="item in indicators" :key="item.type">
        <div class="item-dot" :style="{ background: item.color }"></div>
        <div class="item-info">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-count">{{ item.count }}</span>
        </div>
      </div>
    </div>
    <div class="indicator-footer">
      <div class="coverage-info">
        <span class="coverage-label">数据覆盖区域：</span>
        <span class="coverage-value">广州园区 (113.26°E, 23.13°N)</span>
      </div>
      <div class="update-info">
        <span class="update-dot"></span>
        <span class="update-text">实时更新中</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()

const indicators = computed(() => {
  const personnel = mapStore.points.filter((p) => p.type === 'personnel')
  const vehicles = mapStore.points.filter((p) => p.type === 'vehicle')
  const devices = mapStore.points.filter((p) => p.type === 'device')

  return [
    {
      type: 'personnel',
      label: '人员位置',
      count: personnel.length,
      color: '#43e97b',
    },
    {
      type: 'vehicle',
      label: '车辆位置',
      count: vehicles.length,
      color: '#667eea',
    },
    {
      type: 'device',
      label: '设备位置',
      count: devices.length,
      color: '#4facfe',
    },
  ]
})
</script>

<style lang="scss" scoped>
.data-indicator {
  position: absolute;
  top: 0.15rem;
  right: 0.15rem;
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(58, 134, 255, 0.3);
  border-radius: 8px;
  padding: 0.15rem;
  min-width: 2.5rem;
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

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  margin-bottom: 0.12rem;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.06rem;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(58, 134, 255, 0.1);
  }

  .item-dot {
    width: 0.1rem;
    height: 0.1rem;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
    animation: pulse 2s infinite;
  }

  .item-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-label {
      font-size: 0.12rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .item-count {
      font-size: 0.14rem;
      font-weight: 600;
      color: #fff;
      font-family: 'Arial', sans-serif;
    }
  }
}

.indicator-footer {
  padding-top: 0.1rem;
  border-top: 1px solid rgba(58, 134, 255, 0.2);

  .coverage-info {
    display: flex;
    flex-direction: column;
    gap: 0.04rem;
    margin-bottom: 0.08rem;

    .coverage-label {
      font-size: 0.11rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .coverage-value {
      font-size: 0.11rem;
      color: #3a86ff;
      font-family: 'Courier New', monospace;
    }
  }

  .update-info {
    display: flex;
    align-items: center;
    gap: 0.06rem;

    .update-dot {
      width: 0.08rem;
      height: 0.08rem;
      border-radius: 50%;
      background: #43e97b;
      animation: blink 1.5s infinite;
    }

    .update-text {
      font-size: 0.11rem;
      color: #43e97b;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #43e97b;
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 4px #43e97b;
  }
}
</style>
