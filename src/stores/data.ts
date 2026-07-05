import { defineStore } from 'pinia'

export interface Alert {
  id: string
  level: 'high' | 'medium' | 'low'
  message: string
  location: string
  timestamp: number
}

export interface Statistics {
  totalPeople: number
  totalVehicles: number
  totalDevices: number
  onlineDevices: number
  alertCount: number
}

export const useDataStore = defineStore('data', {
  state: () => ({
    statistics: {
      totalPeople: 0,
      totalVehicles: 0,
      totalDevices: 0,
      onlineDevices: 0,
      alertCount: 0,
    } as Statistics,
    alerts: [] as Alert[],
    isFullscreen: false,
    selectedDate: new Date(),
  }),

  actions: {
    updateStatistics(data: Partial<Statistics>) {
      this.statistics = { ...this.statistics, ...data }
    },

    addAlert(alert: Alert) {
      this.alerts.unshift(alert)
      // 保留最近 50 条告警
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(0, 50)
      }
      this.statistics.alertCount = this.alerts.length
    },

    clearAlerts() {
      this.alerts = []
      this.statistics.alertCount = 0
    },

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        this.isFullscreen = true
      } else {
        document.exitFullscreen()
        this.isFullscreen = false
      }
    },

    setSelectedDate(date: Date) {
      this.selectedDate = date
    },
  },
})
