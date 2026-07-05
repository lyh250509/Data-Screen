<template>
  <div class="alert-list card">
    <h3 class="section-title">实时告警</h3>
    <div class="alert-scroll">
      <transition-group name="alert-item">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-item"
          :class="`level-${alert.level}`"
        >
          <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
          <div class="alert-content">
            <div class="alert-level">
              <span class="level-badge">{{ levelText[alert.level] }}</span>
              <span class="alert-location">{{ alert.location }}</span>
            </div>
            <div class="alert-message">{{ alert.message }}</div>
          </div>
        </div>
      </transition-group>
      <div v-if="alerts.length === 0" class="empty">暂无告警信息</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const alerts = computed(() => dataStore.alerts)

const levelText = {
  high: '高',
  medium: '中',
  low: '低',
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<style lang="scss" scoped>
.alert-list {
  padding: 0.15rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alert-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.05rem;
}

.alert-item {
  display: flex;
  gap: 0.1rem;
  padding: 0.12rem;
  margin-bottom: 0.1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid;
  transition: all 0.3s;

  &.level-high {
    border-left-color: #ff4757;
  }

  &.level-medium {
    border-left-color: #ffa502;
  }

  &.level-low {
    border-left-color: #1e90ff;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .alert-time {
    font-size: 0.12rem;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
  }

  .alert-content {
    flex: 1;
  }

  .alert-level {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    margin-bottom: 0.05rem;

    .level-badge {
      padding: 0.02rem 0.08rem;
      border-radius: 3px;
      font-size: 0.11rem;
      background: rgba(255, 255, 255, 0.2);
    }

    .alert-location {
      font-size: 0.12rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .alert-message {
    font-size: 0.13rem;
    color: #fff;
  }
}

.empty {
  text-align: center;
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.14rem;
}

// 动画
.alert-item-enter-active,
.alert-item-leave-active {
  transition: all 0.5s;
}

.alert-item-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.alert-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
