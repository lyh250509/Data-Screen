<template>
  <div class="vehicle-chart card">
    <h3 class="section-title">车辆类型统计</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 车辆统计数据
const vehicleStats = ref({
  small: 45,
  medium: 28,
  large: 12,
  special: 4,
})

function updateChart() {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(10, 14, 39, 0.9)',
      borderColor: '#3a86ff',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '15%',
      right: '5%',
      bottom: '10%',
      top: '10%',
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#3a86ff' } },
      axisLabel: { color: '#fff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(58, 134, 255, 0.1)' } },
    },
    yAxis: {
      type: 'category',
      data: ['小型车', '中型车', '大型车', '特种车'],
      axisLine: { lineStyle: { color: '#3a86ff' } },
      axisLabel: { color: '#fff', fontSize: 12 },
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          vehicleStats.value.small,
          vehicleStats.value.medium,
          vehicleStats.value.large,
          vehicleStats.value.special,
        ],
        barWidth: '50%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ]),
          borderRadius: [0, 5, 5, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#fff',
          fontSize: 12,
        },
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
  updateStats: (stats: { small: number; medium: number; large: number; special: number }) => {
    vehicleStats.value = stats
    updateChart()
  },
})

// 监听数据变化
watch(vehicleStats, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.vehicle-chart {
  padding: 0.15rem;
  height: 2.8rem;
}

.chart-container {
  width: 100%;
  height: calc(100% - 0.4rem);
}
</style>
