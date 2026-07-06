<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo">智慧园区GIS可视化平台</div>
      </div>
      <div class="header-center">
        <h1 class="title glow">园区数字孪生监控中心</h1>
      </div>
      <div class="header-right">
        <div class="datetime">{{ currentTime }}</div>
        <button class="fullscreen-btn" @click="toggleFullscreen">
          {{ dataStore.isFullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 左侧面板 -->
      <aside class="left-panel">
        <TopStatistics />
        <DeviceChart ref="deviceChartRef" />
        <AlertList />
      </aside>

      <!-- 中间融合场景：GIS地图 + 3D一体化 -->
      <main class="center-content">
        <div class="unified-scene-container">
          <CesiumScene />
        </div>
      </main>

      <!-- 右侧面板 -->
      <aside class="right-panel">
        <DatePicker />
        <PersonnelChart ref="personnelChartRef" />
        <VehicleChart ref="vehicleChartRef" />
        <HeatmapLegend />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import { useMapStore } from '@/stores/map'
import { generateHistoricalData, generateHistoricalPersonnelTrend } from '@/utils/mockData'
import CesiumScene from '@/components/CesiumScene/index.vue'
import TopStatistics from '@/components/Charts/TopStatistics.vue'
import DeviceChart from '@/components/Charts/DeviceChart.vue'
import AlertList from '@/components/Charts/AlertList.vue'
import DatePicker from '@/components/Common/DatePicker.vue'
import PersonnelChart from '@/components/Charts/PersonnelChart.vue'
import VehicleChart from '@/components/Charts/VehicleChart.vue'
import HeatmapLegend from '@/components/Common/HeatmapLegend.vue'

const dataStore = useDataStore()
const mapStore = useMapStore()

const currentTime = ref('')
let timeTimer: number | null = null
let cleanupMockWS: (() => void) | null = null

// 图表组件引用
const deviceChartRef = ref<InstanceType<typeof DeviceChart>>()
const personnelChartRef = ref<InstanceType<typeof PersonnelChart>>()
const vehicleChartRef = ref<InstanceType<typeof VehicleChart>>()

// 更新时间
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// 切换全屏
function toggleFullscreen() {
  dataStore.toggleFullscreen()
}

// 加载指定日期的历史数据
function loadHistoricalData(date: Date) {
  console.log('📅 加载历史数据:', date.toLocaleDateString())

  // 停止当前的数据更新定时器
  if (cleanupMockWS) {
    cleanupMockWS()
    cleanupMockWS = null
  }

  // 清空当前地图点位
  mapStore.points = []

  // 生成该日期的历史数据
  const historicalData = generateHistoricalData(date)
  let { personnel, vehicles, devices } = historicalData

  console.log(`📊 ${date.toLocaleDateString()} 数据量:`)
  console.log(`  - 人员: ${personnel.length} (外面约10人，建筑内约15人)`)
  console.log(`  - 车辆: ${vehicles.length} (全部在外面)`)
  console.log(`  - 设备: ${devices.length}`)

  // 更新统计数据
  dataStore.updateStatistics({
    totalPeople: personnel.length,
    totalVehicles: vehicles.length,
    totalDevices: devices.length,
    onlineDevices: devices.filter((d: any) => d.status === 'online').length,
    alertCount: 0,
  })

  // 初始化人员位置到地图
  personnel.forEach((person: any) => {
    mapStore.addPoint({
      id: person.id,
      name: person.name,
      position: [person.position.lng, person.position.lat],
      type: 'personnel',
      status: person.status,
      data: person,
    })
  })

  // 初始化车辆位置到地图
  vehicles.forEach((vehicle: any) => {
    mapStore.addPoint({
      id: vehicle.id,
      name: vehicle.plate,
      position: [vehicle.position.lng, vehicle.position.lat],
      type: 'vehicle',
      status: 'normal',
      data: vehicle,
    })
  })

  // 更新图表数据
  if (deviceChartRef.value) {
    deviceChartRef.value.updateStats({
      online: devices.filter((d: any) => d.status === 'online').length,
      offline: devices.filter((d: any) => d.status === 'offline').length,
      fault: devices.filter((d: any) => d.status === 'fault').length,
    })
  }

  if (vehicleChartRef.value) {
    vehicleChartRef.value.updateStats({
      small: vehicles.filter((v: any) => v.type === 'small').length,
      medium: vehicles.filter((v: any) => v.type === 'medium').length,
      large: vehicles.filter((v: any) => v.type === 'large').length,
      special: vehicles.filter((v: any) => v.type === 'special').length,
    })
  }

  if (personnelChartRef.value) {
    const trendData = generateHistoricalPersonnelTrend(date)
    personnelChartRef.value.updateTrend(trendData)
  }

  // 启动人员位置实时更新（每3秒更新一次，模拟人员走动）
  const personnelUpdateInterval = setInterval(() => {
    import('@/utils/mockData').then((mockData) => {
      // 更新人员位置
      personnel = mockData.updatePersonnelPositions(personnel)

      // 更新地图上的人员位置
      personnel.forEach((person: any) => {
        mapStore.addPoint({
          id: person.id,
          name: person.name,
          position: [person.position.lng, person.position.lat],
          type: 'personnel',
          status: person.status,
          data: person,
        })
      })
    })
  }, 3000)

  // 启动车辆位置实时更新（每2秒更新一次，模拟车辆行驶）
  const vehicleUpdateInterval = setInterval(() => {
    import('@/utils/mockData').then((mockData) => {
      // 更新车辆位置
      vehicles = mockData.updateVehiclePositions(vehicles)

      // 更新地图上的车辆位置
      vehicles.forEach((vehicle: any) => {
        mapStore.addPoint({
          id: vehicle.id,
          name: vehicle.plate,
          position: [vehicle.position.lng, vehicle.position.lat],
          type: 'vehicle',
          status: 'normal',
          data: vehicle,
        })
      })
    })
  }, 2000)

  // 保存清理函数
  cleanupMockWS = () => {
    clearInterval(personnelUpdateInterval)
    clearInterval(vehicleUpdateInterval)
    console.log('🛑 停止数据更新')
  }
}

// 监听日期变化
watch(
  () => dataStore.selectedDate,
  (newDate) => {
    loadHistoricalData(newDate)
  }
)

onMounted(() => {
  // 启动时间更新
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)

  // 加载今天的数据
  loadHistoricalData(dataStore.selectedDate)
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
  if (cleanupMockWS) {
    cleanupMockWS()
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0a0e27 0%, #1a1e3a 100%);
  position: relative;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 20% 50%, rgba(58, 134, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(58, 134, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
}

.dashboard-header {
  height: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.3rem;
  background: rgba(10, 14, 39, 0.9);
  border-bottom: 2px solid rgba(58, 134, 255, 0.3);
  position: relative;
  z-index: 100;

  .header-left,
  .header-right {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .header-right {
    justify-content: flex-end;
    gap: 0.2rem;
  }

  .logo {
    font-size: 0.18rem;
    font-weight: 600;
    color: #3a86ff;
  }

  .title {
    font-size: 0.32rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.04rem;
  }

  .datetime {
    font-size: 0.16rem;
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Courier New', monospace;
  }

  .fullscreen-btn {
    padding: 0.08rem 0.16rem;
    background: rgba(58, 134, 255, 0.2);
    border: 1px solid rgba(58, 134, 255, 0.5);
    border-radius: 4px;
    color: #3a86ff;
    font-size: 0.14rem;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(58, 134, 255, 0.3);
      transform: translateY(-2px);
    }
  }
}

.dashboard-main {
  flex: 1;
  display: flex;
  gap: 0.15rem;
  padding: 0.15rem;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.left-panel,
.right-panel {
  width: 3.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow-y: auto;
}

.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .unified-scene-container {
    flex: 1;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(58, 134, 255, 0.3);
  }
}
</style>
