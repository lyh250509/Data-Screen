import { defineStore } from 'pinia'
import type { Viewer, Entity, Cartesian3 } from 'cesium'

export interface Building {
  id: string
  name: string
  position: Cartesian3
  height: number
  width: number
  depth: number
  entity?: Entity
  data?: any
}

export interface DataPoint {
  id: string
  name: string
  position: Cartesian3
  type: 'personnel' | 'vehicle' | 'device'
  status: 'normal' | 'warning' | 'danger'
  entity?: Entity
  data?: any
}

export const useCesiumStore = defineStore('cesium', {
  state: () => ({
    viewer: null as Viewer | null,
    center: [113.264, 23.129] as [number, number], // 广州坐标 [lng, lat]
    buildings: [] as Building[],
    dataPoints: [] as DataPoint[],
    selectedBuildingId: null as string | null,
    selectedPointId: null as string | null,
    isAnimating: false,
    heatmapData: [] as Array<{ position: [number, number]; weight: number }>,
  }),

  getters: {
    selectedBuilding: (state) => {
      return state.buildings.find((b) => b.id === state.selectedBuildingId)
    },
    selectedPoint: (state) => {
      return state.dataPoints.find((p) => p.id === state.selectedPointId)
    },
  },

  actions: {
    setViewer(viewer: Viewer) {
      this.viewer = viewer
    },

    setCenter(center: [number, number]) {
      this.center = center
    },

    addBuilding(building: Building) {
      const index = this.buildings.findIndex((b) => b.id === building.id)
      if (index >= 0) {
        this.buildings[index] = building
      } else {
        this.buildings.push(building)
      }
    },

    addDataPoint(point: DataPoint) {
      const index = this.dataPoints.findIndex((p) => p.id === point.id)
      if (index >= 0) {
        this.dataPoints[index] = point
      } else {
        this.dataPoints.push(point)
      }
    },

    removeDataPoint(id: string) {
      const index = this.dataPoints.findIndex((p) => p.id === id)
      if (index >= 0) {
        this.dataPoints.splice(index, 1)
      }
    },

    selectBuilding(id: string | null) {
      this.selectedBuildingId = id
    },

    selectPoint(id: string | null) {
      this.selectedPointId = id
    },

    setAnimating(value: boolean) {
      this.isAnimating = value
    },

    updateHeatmap(data: Array<{ position: [number, number]; weight: number }>) {
      this.heatmapData = data
    },

    clearDataPoints() {
      this.dataPoints = []
    },
  },
})
