<template>
  <div class="top-statistics card">
    <div class="stat-item" v-for="item in statistics" :key="item.key">
      <div class="stat-icon" :style="{ background: item.color }">
        <div class="icon-bg"></div>
      </div>
      <div class="stat-info">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const statistics = computed(() => [
  {
    key: 'people',
    label: '在园人员',
    value: dataStore.statistics.totalPeople,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'vehicle',
    label: '在园车辆',
    value: dataStore.statistics.totalVehicles,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    key: 'device',
    label: '设备总数',
    value: dataStore.statistics.totalDevices,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    key: 'online',
    label: '在线设备',
    value: dataStore.statistics.onlineDevices,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    key: 'alert',
    label: '告警数量',
    value: dataStore.statistics.alertCount,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
])
</script>

<style lang="scss" scoped>
.top-statistics {
  display: flex;
  gap: 0.12rem;
  padding: 0.15rem;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.12rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .icon-bg {
      width: 0.3rem;
      height: 0.3rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
    }
  }

  .stat-info {
    flex: 1;
  }

  .stat-label {
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.05rem;
  }

  .stat-value {
    font-size: 0.24rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Arial', sans-serif;
  }
}
</style>
