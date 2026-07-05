import { defineStore } from 'pinia'
import type { Scene, Camera, Object3D } from 'three'

export interface Building3D {
  id: string
  name: string
  position: [number, number, number]
  mesh?: Object3D
  data?: any
}

export const useSceneStore = defineStore('scene', {
  state: () => ({
    scene: null as Scene | null,
    camera: null as Camera | null,
    buildings: [] as Building3D[],
    selectedBuildingId: null as string | null,
    isAnimating: false,
  }),

  getters: {
    selectedBuilding: (state) => {
      return state.buildings.find((b) => b.id === state.selectedBuildingId)
    },
  },

  actions: {
    setScene(scene: Scene) {
      this.scene = scene
    },

    setCamera(camera: Camera) {
      this.camera = camera
    },

    addBuilding(building: Building3D) {
      const index = this.buildings.findIndex((b) => b.id === building.id)
      if (index >= 0) {
        this.buildings[index] = building
      } else {
        this.buildings.push(building)
      }
    },

    selectBuilding(id: string | null) {
      this.selectedBuildingId = id
    },

    setAnimating(value: boolean) {
      this.isAnimating = value
    },
  },
})
