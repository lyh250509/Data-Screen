<template>
  <div class="personnel-chart card">
    <h3 class="section-title">人员流量趋势</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
const trendData = ref<number[]>(hours.map(() => Math.floor(Math.random() * 100 + 50)))

function updateChart() {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 14, 39, 0.9)',
      borderColor: '#3a86ff',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#3a86ff' } },
      axisLabel: { color: '#fff', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#3a86ff' } },
      axisLabel: { color: '#fff', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(58, 134, 255, 0.1)' } },
    },
    series: [
      {
        name: '人员数量',
        type: 'line',
        smooth: true,
        data: trendData.value,
        lineStyle: { color: '#43e97b', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(67, 233, 123, 0.5)' },
            { offset: 1, color: 'rgba(67, 233, 123, 0.1)' },
          ]),
        },
        itemStyle: { color: '#43e97b' },
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
  updateTrend: (data: number[]) => {
    trendData.value = data
    updateChart()
  },
})

// 监听数据变化
watch(trendData, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.personnel-chart {
  padding: 0.15rem;
  height: 3rem;
}

.chart-container {
  width: 100%;
  height: calc(100% - 0.4rem);
}
</style>
