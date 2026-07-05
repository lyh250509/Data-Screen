import { defineStore } from 'pinia'
import type { Map as OLMap } from 'ol'

export interface MapPoint {
  id: string
  name: string
  position: [number, number] // [lng, lat]
  type: 'personnel' | 'vehicle' | 'device'
  status: 'normal' | 'warning' | 'danger'
  data?: any
}

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null as OLMap | null,
    center: [113.264, 23.129] as [number, number], // 广州坐标
    zoom: 15,
    points: [] as MapPoint[],
    selectedPointId: null as string | null,
    heatmapData: [] as Array<{ position: [number, number]; weight: number }>,
    fenceAlerts: [] as Array<{ id: string; message: string; position: [number, number] }>,
  }),

  getters: {
    selectedPoint: (state) => {
      return state.points.find((p) => p.id === state.selectedPointId)
    },
  },

  actions: {
    setMap(map: OLMap) {
      this.map = map
    },

    setCenter(center: [number, number]) {
      this.center = center
    },

    setZoom(zoom: number) {
      this.zoom = zoom
    },

    addPoint(point: MapPoint) {
      const index = this.points.findIndex((p) => p.id === point.id)
      if (index >= 0) {
        this.points[index] = point
      } else {
        this.points.push(point)
      }
    },

    removePoint(id: string) {
      const index = this.points.findIndex((p) => p.id === id)
      if (index >= 0) {
        this.points.splice(index, 1)
      }
    },

    selectPoint(id: string | null) {
      this.selectedPointId = id
    },

    updateHeatmap(data: Array<{ position: [number, number]; weight: number }>) {
      this.heatmapData = data
    },

    addFenceAlert(alert: { id: string; message: string; position: [number, number] }) {
      this.fenceAlerts.push(alert)
    },

    clearFenceAlerts() {
      this.fenceAlerts = []
    },
  },
})
