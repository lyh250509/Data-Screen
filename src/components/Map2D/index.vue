<template>
  <div class="map-2d-wrapper">
    <div ref="mapContainer" class="map-2d"></div>
    <DataIndicator />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import { Feature } from 'ol'
import { Point, Polygon } from 'ol/geom'
import { Style, Icon, Stroke, Fill, Text } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useMapStore } from '@/stores/map'
import { useSceneStore } from '@/stores/scene'
import DataIndicator from '@/components/Common/DataIndicator.vue'
import 'ol/ol.css'

const mapContainer = ref<HTMLDivElement>()
const mapStore = useMapStore()
const sceneStore = useSceneStore()

let map: Map | null = null
let pointLayer: VectorLayer<VectorSource> | null = null
let boundaryLayer: VectorLayer<VectorSource> | null = null
let buildingLayer: VectorLayer<VectorSource> | null = null // 建筑物图层

// 初始化地图
function initMap() {
  if (!mapContainer.value) return

  // 创建地图
  map = new Map({
    target: mapContainer.value,
    layers: [
      // 底图图层
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat(mapStore.center),
      zoom: mapStore.zoom,
      maxZoom: 20,
      minZoom: 10,
    }),
  })

  // 保存到 store
  mapStore.setMap(map)

  // 创建园区边界图层
  boundaryLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: '#3a86ff',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(58, 134, 255, 0.1)',
      }),
    }),
  })
  map.addLayer(boundaryLayer)

  // 创建建筑物图层
  buildingLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: '#3a86ff',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(58, 134, 255, 0.15)',
      }),
    }),
  })
  map.addLayer(buildingLayer)

  // 创建点位图层
  pointLayer = new VectorLayer({
    source: new VectorSource(),
  })
  map.addLayer(pointLayer)

  // 添加点击事件
  map.on('click', (evt) => {
    const feature = map!.forEachFeatureAtPixel(evt.pixel, (feat) => feat)
    if (feature) {
      const pointId = feature.get('id')
      if (pointId) {
        handlePointClick(pointId)
      }
    }
  })

  // 初始化园区边界
  initParkBoundary()

  // 初始化建筑物位置（模拟）
  initBuildings()
}

// 初始化园区边界
function initParkBoundary() {
  if (!boundaryLayer) return

  // 模拟园区边界坐标（矩形）
  const [centerLng, centerLat] = mapStore.center
  const offset = 0.005

  const coordinates = [
    [centerLng - offset, centerLat - offset],
    [centerLng + offset, centerLat - offset],
    [centerLng + offset, centerLat + offset],
    [centerLng - offset, centerLat + offset],
    [centerLng - offset, centerLat - offset],
  ].map((coord) => fromLonLat(coord))

  const polygon = new Polygon([coordinates])
  const feature = new Feature({ geometry: polygon })

  boundaryLayer.getSource()?.addFeature(feature)
}

// 初始化建筑物（模拟5栋楼的位置）
function initBuildings() {
  if (!buildingLayer) return

  const source = buildingLayer.getSource()
  if (!source) return

  const [centerLng, centerLat] = mapStore.center

  // 建筑信息（与3D场景完全对应）
  // 3D中：size = [width, height, depth]
  const buildings = [
    {
      id: 'building-1',
      name: 'A栋',
      lng: centerLng + (-20) / 10000,
      lat: centerLat + (-20) / 10000,
      width: 15,  // 宽15深10的长方形
      depth: 10,
      height: 30
    },
    {
      id: 'building-2',
      name: 'B栋',
      lng: centerLng + (0) / 10000,
      lat: centerLat + (-20) / 10000,
      width: 10,  // 10x10的正方形
      depth: 10,
      height: 25
    },
    {
      id: 'building-3',
      name: 'C栋',
      lng: centerLng + (20) / 10000,
      lat: centerLat + (-20) / 10000,
      width: 12,  // 宽12深18的长方形
      depth: 18,
      height: 35
    },
    {
      id: 'building-4',
      name: 'D栋',
      lng: centerLng + (-20) / 10000,
      lat: centerLat + (0) / 10000,
      width: 14,  // 14x14的正方形
      depth: 14,
      height: 28
    },
    {
      id: 'building-5',
      name: 'E栋',
      lng: centerLng + (20) / 10000,
      lat: centerLat + (0) / 10000,
      width: 10,  // 宽10深15的长方形
      depth: 15,
      height: 32
    },
  ]

  buildings.forEach((building) => {
    // 根据3D建筑的实际宽度和深度来绘制地图上的形状
    const widthInDegrees = building.width / 10000 / 2   // 宽度的一半
    const depthInDegrees = building.depth / 10000 / 2   // 深度的一半

    const coordinates = [
      [building.lng - widthInDegrees, building.lat - depthInDegrees],
      [building.lng + widthInDegrees, building.lat - depthInDegrees],
      [building.lng + widthInDegrees, building.lat + depthInDegrees],
      [building.lng - widthInDegrees, building.lat + depthInDegrees],
      [building.lng - widthInDegrees, building.lat - depthInDegrees],
    ].map((coord) => fromLonLat(coord))

    const polygon = new Polygon([coordinates])
    const feature = new Feature({ geometry: polygon })
    feature.setId(building.id)
    feature.set('id', building.id)
    feature.set('name', building.name)
    feature.set('type', 'building')
    feature.set('height', building.height)  // 保存高度信息

    source.addFeature(feature)
  })
}

// 高亮建筑物
function highlightBuilding(buildingId: string) {
  if (!buildingLayer) return

  const source = buildingLayer.getSource()
  if (!source) return

  // 重置所有建筑样式到默认
  source.getFeatures().forEach((feature) => {
    feature.setStyle(undefined) // 使用图层默认样式
  })

  // 高亮选中的建筑
  const feature = source.getFeatureById(buildingId)
  if (feature) {
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#43e97b',
          width: 4,
        }),
        fill: new Fill({
          color: 'rgba(67, 233, 123, 0.4)',
        }),
      })
    )
  }
}

// 清除建筑高亮
function clearBuildingHighlight() {
  if (!buildingLayer) return

  const source = buildingLayer.getSource()
  if (!source) return

  // 重置所有建筑样式
  source.getFeatures().forEach((feature) => {
    feature.setStyle(undefined)
  })
}

// 地图飞行到指定位置
function flyToLocation(lng: number, lat: number, zoom: number = 18) {
  if (!map) return

  const view = map.getView()
  view.animate({
    center: fromLonLat([lng, lat]),
    zoom: zoom,
    duration: 1000,
  })
}

// 更新点位
function updatePoints() {
  if (!pointLayer) return

  const source = pointLayer.getSource()
  if (!source) return

  source.clear()

  mapStore.points.forEach((point) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat(point.position)),
    })

    feature.setId(point.id)
    feature.set('id', point.id)
    feature.set('data', point)

    // 根据类型和状态设置图标
    const iconColor = {
      normal: '#00ff00',
      warning: '#ffaa00',
      danger: '#ff0000',
    }[point.status]

    feature.setStyle(
      new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="${iconColor}" stroke="#fff" stroke-width="2"/>
            </svg>
          `),
          scale: 1,
        }),
        text: new Text({
          text: point.name,
          offsetY: 20,
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: '#000', width: 3 }),
          font: '14px sans-serif',
        }),
      })
    )

    source.addFeature(feature)
  })
}

// 处理点位点击 - 联动3D场景
function handlePointClick(pointId: string) {
  mapStore.selectPoint(pointId)

  const point = mapStore.points.find((p) => p.id === pointId)
  if (point) {
    console.log('🗺️ 地图点击点位，通知3D场景:', point.name)

    // 触发3D场景联动：根据2D坐标计算3D位置
    // 映射公式（直接映射）：
    //   x = (lng - center[0]) * 10000
    //   z = (lat - center[1]) * 10000
    const x = (point.position[0] - mapStore.center[0]) * 10000
    const z = (point.position[1] - mapStore.center[1]) * 10000

    // 通知3D场景定位到该点
    sceneStore.selectBuilding(null) // 清除建筑选择，聚焦到点位
    console.log('📍 计算的3D坐标:', { x, z, type: point.type })
  }
}

// 监听3D场景的建筑选择 - 反向联动
watch(
  () => sceneStore.selectedBuildingId,
  (buildingId) => {
    if (buildingId) {
      const building = sceneStore.buildings.find((b) => b.id === buildingId)
      if (building) {
        console.log('🏢 3D场景选择建筑，地图联动高亮:', building.name)

        // 高亮建筑
        highlightBuilding(buildingId)

        // 根据建筑3D坐标精确反推地图坐标
        // 3D坐标系：building.position = [x, y, z]
        // 映射公式（直接映射，无偏移）：
        //   lng = center[0] + x / 10000
        //   lat = center[1] + z / 10000
        const lng = mapStore.center[0] + building.position[0] / 10000
        const lat = mapStore.center[1] + building.position[2] / 10000

        // 地图飞到该位置
        flyToLocation(lng, lat, 17)

        console.log('📍 地图定位到建筑:', { lng, lat, name: building.name })
      }
    } else {
      // 取消选择时，清除建筑高亮
      clearBuildingHighlight()
      console.log('🔄 取消建筑选择，清除高亮')
    }
  }
)

// 监听点位变化
watch(
  () => mapStore.points,
  () => {
    updatePoints()
  },
  { deep: true }
)

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.dispose()
    map = null
  }
})
</script>

<style lang="scss" scoped>
.map-2d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-2d {
  width: 100%;
  height: 100%;
  background: #0a0e27;

  :deep(.ol-viewport) {
    border-radius: 8px;
  }

  :deep(.ol-control) {
    background: rgba(10, 14, 39, 0.9);
    border: 1px solid rgba(58, 134, 255, 0.3);

    button {
      background: rgba(58, 134, 255, 0.2);
      color: #3a86ff;

      &:hover {
        background: rgba(58, 134, 255, 0.3);
      }
    }
  }
}
</style>
