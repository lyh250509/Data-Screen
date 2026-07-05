<template>
  <div class="heatmap-legend card">
    <h3 class="section-title">
      <span class="title-icon">🔥</span>
      人流密度热力图
    </h3>
    <div class="legend-content">
      <!-- 渐变条 -->
      <div class="gradient-bar">
        <div class="gradient-fill"></div>
      </div>

      <!-- 图例标签 -->
      <div class="legend-labels">
        <div class="legend-item" v-for="item in legendData" :key="item.label">
          <div class="legend-dot" :style="{ background: item.color, boxShadow: `0 0 8px ${item.color}` }"></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="heat-stats">
        <div class="stat-item">
          <span class="stat-label">当前峰值</span>
          <span class="stat-value">{{ peakDensity }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均密度</span>
          <span class="stat-value">{{ avgDensity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const legendData = [
  { label: '极高密度', color: '#ff0844', value: '> 100人/区' },
  { label: '高密度', color: '#ff6600', value: '50-100人/区' },
  { label: '中密度', color: '#ffcc00', value: '20-50人/区' },
  { label: '低密度', color: '#00ff88', value: '5-20人/区' },
  { label: '极低密度', color: '#00d4ff', value: '< 5人/区' },
]

const peakDensity = ref('126人/区')
const avgDensity = ref('38人/区')

// 模拟动态数据更新
onMounted(() => {
  setInterval(() => {
    const peak = Math.floor(Math.random() * 50) + 100
    const avg = Math.floor(Math.random() * 20) + 30
    peakDensity.value = `${peak}人/区`
    avgDensity.value = `${avg}人/区`
  }, 5000)
})

</script>

<style lang="scss" scoped>
.heatmap-legend {
  padding: 0.15rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.08rem;

  .title-icon {
    font-size: 0.18rem;
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.legend-content {
  margin-top: 0.12rem;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

// 渐变条
.gradient-bar {
  width: 100%;
  height: 0.2rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

  .gradient-fill {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(
      to right,
      #00d4ff 0%,
      #00ff88 25%,
      #ffcc00 50%,
      #ff6600 75%,
      #ff0844 100%
    );
    box-shadow: 0 0 10px rgba(255, 100, 100, 0.5);
  }
}

// 图例标签
.legend-labels {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.06rem 0.08rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(3px);
  }

  .legend-dot {
    width: 0.12rem;
    height: 0.12rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-label {
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    flex: 1;
  }

  .legend-value {
    font-size: 0.11rem;
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Courier New', monospace;
  }
}

// 统计信息
.heat-stats {
  margin-top: 0.08rem;
  padding-top: 0.12rem;
  border-top: 1px solid rgba(58, 134, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.06rem 0.08rem;
  background: rgba(58, 134, 255, 0.1);
  border-radius: 4px;
  border-left: 3px solid #3a86ff;

  .stat-label {
    font-size: 0.12rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .stat-value {
    font-size: 0.14rem;
    color: #43e97b;
    font-weight: 600;
    font-family: 'Courier New', monospace;
  }
}
</style>
