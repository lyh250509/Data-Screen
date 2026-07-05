<template>
  <div class="device-chart card">
    <h3 class="section-title">设备状态分布</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 设备统计数据
const deviceStats = ref({
  online: 312,
  offline: 8,
  fault: 4,
})

function updateChart() {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 14, 39, 0.9)',
      borderColor: '#3a86ff',
      textStyle: { color: '#fff' },
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#fff' },
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a0e27',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: deviceStats.value.online, name: '在线', itemStyle: { color: '#43e97b' } },
          { value: deviceStats.value.offline, name: '离线', itemStyle: { color: '#fa709a' } },
          { value: deviceStats.value.fault, name: '故障', itemStyle: { color: '#fee140' } },
        ],
      },
    ],
  }

  chartInstance.setOption(option)
}

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 暴露更新方法供外部调用
defineExpose({
  updateStats: (stats: { online: number; offline: number; fault: number }) => {
    deviceStats.value = stats
    updateChart()
  },
})

// 监听数据变化
watch(deviceStats, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.device-chart {
  padding: 0.15rem;
  height: 3.5rem;
}

.chart-container {
  width: 100%;
  height: calc(100% - 0.4rem);
}
</style>
