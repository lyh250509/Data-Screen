<template>
  <div class="cesium-scene-wrapper">
    <div ref="cesiumContainer" class="cesium-container"></div>
    <DataIndicator />
    <SceneIndicator />

    <!-- 视角切换按钮 -->
    <div class="view-controls">
      <button @click="switchTo2D" :class="{ active: viewMode === '2d' }">2D地图</button>
      <button @click="switchTo3D" :class="{ active: viewMode === '3d' }">3D场景</button>
      <button @click="switchToColumbus" :class="{ active: viewMode === 'columbus' }">2.5D</button>
    </div>

    <!-- 操作提示 -->
    <div class="control-tips">
      <div class="tip-item">🖱️ 左键拖拽：360°旋转</div>
      <div class="tip-item">🖱️ 滚轮：缩放</div>
      <div class="tip-item">🖱️ 右键拖拽：平移</div>
      <div class="tip-item">👆 点击建筑：查看详情</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Cesium from 'cesium'
import { useCesiumStore } from '@/stores/cesium'
import { useMapStore } from '@/stores/map'
import DataIndicator from '@/components/Common/DataIndicator.vue'
import SceneIndicator from '@/components/Common/SceneIndicator.vue'

const cesiumContainer = ref<HTMLDivElement>()
const cesiumStore = useCesiumStore()
const mapStore = useMapStore()

let viewer: Cesium.Viewer | null = null
let selectedEntity: Cesium.Entity | null = null
const viewMode = ref<'2d' | '3d' | 'columbus'>('3d')

// 建筑物实体映射
const buildingEntities = new Map<string, Cesium.Entity>()
const dataPointEntities = new Map<string, Cesium.Entity>()

// 初始化 Cesium 场景
function initCesium() {
  if (!cesiumContainer.value) return

  // 使用 OpenStreetMap 作为底图（无需 Token，免费使用）
  const osmProvider = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  })

  // 创建 Viewer（简化配置，不使用 Cesium Ion）
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    // 使用 OSM 底图
    imageryProvider: osmProvider,
    // 不使用地形（避免加载在线资源）
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    // UI 控件
    timeline: false,
    animation: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: true,
    sceneModePicker: false,
    selectionIndicator: true,
    navigationHelpButton: false,
    baseLayerPicker: false,
    // 性能优化
    requestRenderMode: false, // 改为持续渲染，确保显示
    maximumRenderTimeChange: Infinity,
  })

  // 设置场景样式
  viewer.scene.globe.enableLighting = false // 关闭光照，避免过暗
  viewer.scene.globe.depthTestAgainstTerrain = false
  viewer.scene.backgroundColor = new Cesium.Color(0.02, 0.05, 0.15, 1.0)

  // 移除版权信息
  if (viewer.cesiumWidget.creditContainer) {
    viewer.cesiumWidget.creditContainer.style.display = 'none'
  }

  // 保存到 store
  cesiumStore.setViewer(viewer)

  // 设置初始视角 - 确保园区在画布中央
  const [lng, lat] = cesiumStore.center

  // 使用 lookAt 方法，明确指定相机看向园区中心
  const center = Cesium.Cartesian3.fromDegrees(lng, lat, 0) // 地面中心点
  const heading = Cesium.Math.toRadians(0)   // 正北
  const pitch = Cesium.Math.toRadians(-60)   // 60度俯视
  const range = 3500                          // 距离中心点3500米

  viewer.camera.lookAt(
    center,
    new Cesium.HeadingPitchRange(heading, pitch, range)
  )

  // 必须调用 lookAtTransform 解锁相机，否则无法交互
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)

  console.log('✅ Cesium 场景初始化完成 - 园区居中显示')

  // 允许完整的 360° 旋转，不限制角度
  viewer.scene.screenSpaceCameraController.enableRotate = true
  viewer.scene.screenSpaceCameraController.enableZoom = true
  viewer.scene.screenSpaceCameraController.enableTilt = true
  viewer.scene.screenSpaceCameraController.enableLook = true

  // 移除角度限制，允许从任意角度观察（包括地下和上方）
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 20
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000

  // 添加园区边界
  addParkBoundary()

  // 添加建筑物
  addBuildings()

  // 添加点击事件
  setupClickHandler()

  // 添加鼠标移动高亮效果
  setupHoverHandler()
}

// 添加园区边界和地面网格
function addParkBoundary() {
  if (!viewer) return

  const [centerLng, centerLat] = cesiumStore.center
  // 使用与建筑相同的转换系数
  const offset = 0.006 // 恢复原来的范围

  const positions = [
    centerLng - offset, centerLat - offset,
    centerLng + offset, centerLat - offset,
    centerLng + offset, centerLat + offset,
    centerLng - offset, centerLat + offset,
  ]

  // 园区边界
  viewer.entities.add({
    name: '园区边界',
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
      material: Cesium.Color.fromCssColorString('#1a3a5a').withAlpha(0.6),
      outline: true,
      outlineColor: Cesium.Color.CYAN,
      outlineWidth: 4,
      height: 0,
      extrudedHeight: 0,
    },
  })

  // 添加园区地面（深色底板）
  viewer.entities.add({
    name: '园区地面',
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
      material: Cesium.Color.fromCssColorString('#0a0e27').withAlpha(0.8),
      height: -1,
      extrudedHeight: 0,
    },
  })
}

// 添加建筑物
function addBuildings() {
  if (!viewer) return

  const [centerLng, centerLat] = cesiumStore.center

  // 建筑信息：多样化设计 - 有高有低，有简单有复杂，不同颜色
  const buildings = [
    // A栋 - 超高层主楼（复杂）
    { id: 'building-1', name: 'A栋-总部大楼', offset: [-25, -25], width: 22, depth: 22, height: 120, color: Cesium.Color.fromCssColorString('#3a86ff'), type: 'complex' },

    // B栋 - 中层研发楼（简单）
    { id: 'building-2', name: 'B栋-研发中心', offset: [0, -25], width: 16, depth: 16, height: 55, color: Cesium.Color.fromCssColorString('#667eea'), type: 'simple' },

    // C栋 - 高层办公楼（复杂）
    { id: 'building-3', name: 'C栋-办公大楼', offset: [25, -25], width: 18, depth: 20, height: 90, color: Cesium.Color.fromCssColorString('#4a96ff'), type: 'complex' },

    // D栋 - 低层配套楼（简单，扁平）
    { id: 'building-4', name: 'D栋-配套中心', offset: [-25, 0], width: 28, depth: 14, height: 18, color: Cesium.Color.fromCssColorString('#4facfe'), type: 'simple' },

    // E栋 - 中高层数据中心（复杂）
    { id: 'building-5', name: 'E栋-数据中心', offset: [0, 0], width: 16, depth: 22, height: 70, color: Cesium.Color.fromCssColorString('#5a6eff'), type: 'complex' },

    // F栋 - 展示中心（简单，宽扁）
    { id: 'building-6', name: 'F栋-展示中心', offset: [25, 0], width: 32, depth: 16, height: 22, color: Cesium.Color.fromCssColorString('#43e97b'), type: 'simple' },

    // G栋 - 高层公寓（简单，细长）
    { id: 'building-7', name: 'G栋-员工公寓', offset: [-15, 25], width: 12, depth: 26, height: 85, color: Cesium.Color.fromCssColorString('#f093fb'), type: 'simple' },

    // H栋 - 培训楼（复杂）
    { id: 'building-8', name: 'H栋-培训中心', offset: [15, 25], width: 20, depth: 16, height: 48, color: Cesium.Color.fromCssColorString('#feca57'), type: 'complex' },
  ]

  buildings.forEach((building) => {
    // 保持原来的坐标转换系数（原代码的offset数值已经是放大过的）
    const lng = centerLng + building.offset[0] / 10000
    const lat = centerLat + building.offset[1] / 10000

    // 转换宽度和深度到度数（保持原来的系数）
    const widthDegrees = building.width / 11000
    const depthDegrees = building.depth / 11000

    // 根据建筑类型创建不同的形状
    if (building.type === 'complex') {
      // 复杂建筑：创建多个部分组成
      createComplexBuilding(building, lng, lat, widthDegrees, depthDegrees)
    } else {
      // 简单建筑：单一长方体
      createSimpleBuilding(building, lng, lat, widthDegrees, depthDegrees)
    }
  })
}

// 创建简单建筑（单一长方体）
function createSimpleBuilding(building: any, lng: number, lat: number, widthDegrees: number, depthDegrees: number) {
  if (!viewer) return

  const positions = [
    lng - widthDegrees / 2, lat - depthDegrees / 2,
    lng + widthDegrees / 2, lat - depthDegrees / 2,
    lng + widthDegrees / 2, lat + depthDegrees / 2,
    lng - widthDegrees / 2, lat + depthDegrees / 2,
  ]

  const entity = viewer.entities.add({
    id: building.id,
    name: building.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, building.height * 0.75), // 修正：建筑高度 * 1.5 的一半
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
      material: building.color.withAlpha(0.88),
      outline: true,
      outlineColor: Cesium.Color.CYAN,
      outlineWidth: 3,
      height: 0,
      extrudedHeight: building.height * 1.5,
    },
    properties: {
      type: 'building',
      buildingId: building.id,
      height: building.height,
      buildingType: 'simple',
      lng: lng,
      lat: lat,
    },
    description: `
      <div style="padding: 12px; font-family: Arial; background: #0a0e27; color: #fff; border-radius: 8px;">
        <h3 style="color: ${building.color.toCssColorString()}; margin: 0 0 10px 0;">${building.name}</h3>
        <p><strong>建筑高度：</strong>${building.height}米</p>
        <p><strong>占地面积：</strong>${building.width}m × ${building.depth}m</p>
        <p><strong>建筑类型：</strong>标准建筑</p>
        <p><strong>状态：</strong><span style="color: #43e97b;">● 正常运行</span></p>
      </div>
    `,
  })

  buildingEntities.set(building.id, entity)
  cesiumStore.addBuilding({
    id: building.id,
    name: building.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, building.height / 2),
    height: building.height,
    width: building.width,
    depth: building.depth,
    entity,
  })
}

// 创建复杂建筑（多层次、多部分）
function createComplexBuilding(building: any, lng: number, lat: number, widthDegrees: number, depthDegrees: number) {
  if (!viewer) return

  // 主体建筑
  const mainPositions = [
    lng - widthDegrees / 2, lat - depthDegrees / 2,
    lng + widthDegrees / 2, lat - depthDegrees / 2,
    lng + widthDegrees / 2, lat + depthDegrees / 2,
    lng - widthDegrees / 2, lat + depthDegrees / 2,
  ]

  const entity = viewer.entities.add({
    id: building.id,
    name: building.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, building.height * 0.75), // 修正：建筑高度 * 1.5 的一半
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(mainPositions),
      material: building.color.withAlpha(0.88),
      outline: true,
      outlineColor: Cesium.Color.CYAN,
      outlineWidth: 3,
      height: 0,
      extrudedHeight: building.height * 1.5,
    },
    properties: {
      type: 'building',
      buildingId: building.id,
      height: building.height,
      buildingType: 'complex',
      lng: lng,
      lat: lat,
    },
    description: `
      <div style="padding: 12px; font-family: Arial; background: #0a0e27; color: #fff; border-radius: 8px;">
        <h3 style="color: ${building.color.toCssColorString()}; margin: 0 0 10px 0;">${building.name}</h3>
        <p><strong>建筑高度：</strong>${building.height}米</p>
        <p><strong>占地面积：</strong>${building.width}m × ${building.depth}m</p>
        <p><strong>建筑类型：</strong>复合型建筑</p>
        <p><strong>楼层数：</strong>${Math.floor(building.height / 3.5)}层</p>
        <p><strong>状态：</strong><span style="color: #43e97b;">● 正常运行</span></p>
      </div>
    `,
  })

  // 添加裙楼（底部较宽的部分）
  const podiumWidth = widthDegrees * 1.3
  const podiumDepth = depthDegrees * 1.3
  const podiumHeight = building.height * 0.2

  const podiumPositions = [
    lng - podiumWidth / 2, lat - podiumDepth / 2,
    lng + podiumWidth / 2, lat - podiumDepth / 2,
    lng + podiumWidth / 2, lat + podiumDepth / 2,
    lng - podiumWidth / 2, lat + podiumDepth / 2,
  ]

  viewer.entities.add({
    id: `${building.id}-podium`,
    name: `${building.name}-裙楼`,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(podiumPositions),
      material: building.color.withAlpha(0.75),
      outline: true,
      outlineColor: Cesium.Color.CYAN.withAlpha(0.6),
      outlineWidth: 2,
      height: 0,
      extrudedHeight: podiumHeight,
    },
  })

  // 添加顶部装饰（天线、机房等）
  const topWidth = widthDegrees * 0.4
  const topDepth = depthDegrees * 0.4
  const topHeight = building.height * 1.5 + 8

  const topPositions = [
    lng - topWidth / 2, lat - topDepth / 2,
    lng + topWidth / 2, lat - topDepth / 2,
    lng + topWidth / 2, lat + topDepth / 2,
    lng - topWidth / 2, lat + topDepth / 2,
  ]

  viewer.entities.add({
    id: `${building.id}-top`,
    name: `${building.name}-机房`,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(topPositions),
      material: building.color.brighten(0.3, new Cesium.Color()).withAlpha(0.9),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      height: building.height * 1.5,
      extrudedHeight: topHeight,
    },
  })

  buildingEntities.set(building.id, entity)
  cesiumStore.addBuilding({
    id: building.id,
    name: building.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, building.height / 2),
    height: building.height,
    width: building.width,
    depth: building.depth,
    entity,
  })
}

// 添加数据点（人员/车辆/设备）
function addDataPoint(point: any) {
  if (!viewer) return

  // 移除旧的实体
  if (dataPointEntities.has(point.id)) {
    const oldEntity = dataPointEntities.get(point.id)
    if (oldEntity) {
      viewer.entities.remove(oldEntity)
    }
  }

  const [lng, lat] = point.position

  // 根据类型选择颜色和图标
  const colorMap = {
    personnel: Cesium.Color.fromCssColorString('#43e97b'),
    vehicle: Cesium.Color.fromCssColorString('#667eea'),
    device: Cesium.Color.fromCssColorString('#4facfe'),
  }

  const color = colorMap[point.type as keyof typeof colorMap] || Cesium.Color.WHITE

  const entity = viewer.entities.add({
    id: `point-${point.id}`,
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, 2), // 高度2米
    point: {
      pixelSize: 12,
      color: color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
    label: {
      text: point.name,
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -15),
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
    properties: {
      type: 'dataPoint',
      pointId: point.id,
      dataType: point.type,
      status: point.status,
    },
    description: `
      <div style="padding: 10px; font-family: Arial;">
        <h3 style="color: ${color.toCssColorString()}; margin: 0 0 10px 0;">${point.name}</h3>
        <p><strong>类型：</strong>${point.type === 'personnel' ? '人员' : point.type === 'vehicle' ? '车辆' : '设备'}</p>
        <p><strong>状态：</strong><span style="color: #43e97b;">${point.status}</span></p>
        <p><strong>位置：</strong>${lng.toFixed(6)}, ${lat.toFixed(6)}</p>
      </div>
    `,
  })

  dataPointEntities.set(point.id, entity)

  // 保存到 store
  cesiumStore.addDataPoint({
    id: point.id,
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(lng, lat, 2),
    type: point.type,
    status: point.status,
    entity,
    data: point.data,
  })
}

// 设置点击事件
function setupClickHandler() {
  if (!viewer) return

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  handler.setInputAction((click: any) => {
    const pickedObject = viewer!.scene.pick(click.position)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id as Cesium.Entity
      const properties = entity.properties

      if (properties && properties.type) {
        const type = properties.type.getValue()

        if (type === 'building') {
          const buildingId = properties.buildingId.getValue()
          highlightBuilding(buildingId)
          cesiumStore.selectBuilding(buildingId)
          console.log('🏢 点击建筑:', entity.name)
        } else if (type === 'dataPoint') {
          const pointId = properties.pointId.getValue()
          cesiumStore.selectPoint(pointId)
          flyToEntity(entity)
          console.log('📍 点击数据点:', entity.name)
        }
      }
    } else {
      clearHighlight()
      cesiumStore.selectBuilding(null)
      cesiumStore.selectPoint(null)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

// 设置鼠标悬停效果
function setupHoverHandler() {
  if (!viewer) return

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  handler.setInputAction((movement: any) => {
    const pickedObject = viewer!.scene.pick(movement.endPosition)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id as Cesium.Entity
      if (entity.properties && entity.properties.type) {
        document.body.style.cursor = 'pointer'
      }
    } else {
      document.body.style.cursor = 'default'
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
}

// 高亮建筑
function highlightBuilding(buildingId: string) {
  clearHighlight()

  const entity = buildingEntities.get(buildingId)
  if (entity && entity.polygon) {
    selectedEntity = entity
    entity.polygon.material = Cesium.Color.fromCssColorString('#43e97b').withAlpha(0.8)
    entity.polygon.outlineColor = Cesium.Color.fromCssColorString('#43e97b')
    entity.polygon.outlineWidth = new Cesium.ConstantProperty(4)

    // 飞到建筑
    flyToEntity(entity, 300)
  }
}

// 清除高亮
function clearHighlight() {
  if (selectedEntity && selectedEntity.polygon) {
    selectedEntity.polygon.material = Cesium.Color.fromCssColorString('#3a86ff').withAlpha(0.7)
    selectedEntity.polygon.outlineColor = Cesium.Color.CYAN
    selectedEntity.polygon.outlineWidth = new Cesium.ConstantProperty(2)
    selectedEntity = null
  }
}

// 飞到实体
function flyToEntity(entity: Cesium.Entity, height: number = 200) {
  if (!viewer || !entity) return

  // 使用 Cesium 自带的 flyTo 方法，自动计算最佳观察位置
  // 这样避免手动计算坐标偏移的复杂性和错误
  viewer.flyTo(entity, {
    duration: 1.0,  // 飞行时长1秒
    offset: new Cesium.HeadingPitchRange(
      viewer.camera.heading,  // 保持当前朝向，不旋转
      viewer.camera.pitch,    // 保持当前俯仰角
      height * 2              // 距离：根据传入的高度参数调整
    )
  })
}

// 视角切换
function switchTo2D() {
  if (!viewer) return
  viewer.scene.mode = Cesium.SceneMode.SCENE2D
  viewMode.value = '2d'
}

function switchTo3D() {
  if (!viewer) return
  viewer.scene.mode = Cesium.SceneMode.SCENE3D
  viewMode.value = '3d'
}

function switchToColumbus() {
  if (!viewer) return
  viewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW
  viewMode.value = 'columbus'
}

// 监听 mapStore 的点位变化（从 WebSocket 接收数据）
watch(
  () => mapStore.points,
  (points) => {
    points.forEach((point) => {
      addDataPoint(point)
    })
  },
  { deep: true }
)

// 监听建筑选择变化
watch(
  () => cesiumStore.selectedBuildingId,
  (buildingId) => {
    if (buildingId) {
      highlightBuilding(buildingId)
    } else {
      clearHighlight()
    }
  }
)

onMounted(() => {
  initCesium()
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style lang="scss" scoped>
.cesium-scene-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.cesium-container {
  width: 100%;
  height: 100%;

  :deep(.cesium-viewer) {
    width: 100%;
    height: 100%;
  }

  :deep(.cesium-viewer-bottom) {
    display: none; // 隐藏底部版权信息
  }

  :deep(.cesium-infoBox) {
    background: rgba(10, 14, 39, 0.95);
    border: 1px solid rgba(58, 134, 255, 0.5);
    border-radius: 8px;

    .cesium-infoBox-title {
      background: rgba(58, 134, 255, 0.3);
      color: #fff;
    }
  }
}

.view-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;

  button {
    padding: 10px 20px;
    background: rgba(10, 14, 39, 0.9);
    border: 1px solid rgba(58, 134, 255, 0.5);
    border-radius: 6px;
    color: #3a86ff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(58, 134, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      background: rgba(58, 134, 255, 0.4);
      border-color: #43e97b;
      color: #43e97b;
    }
  }
}

.control-tips {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background: rgba(10, 14, 39, 0.85);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(58, 134, 255, 0.3);

  .tip-item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.4;
  }
}
</style>
