/**
 * WebSocket 管理器
 * 支持心跳保活、断线重连、消息队列
 */

export interface WSMessage {
  type: string
  data: any
  timestamp?: number
}

export interface WSOptions {
  url: string
  heartbeatInterval?: number // 心跳间隔（毫秒）
  reconnectInterval?: number // 重连间隔（毫秒）
  maxReconnectAttempts?: number // 最大重连次数
  onOpen?: () => void
  onMessage?: (data: WSMessage) => void
  onError?: (error: Event) => void
  onClose?: () => void
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private options: Required<WSOptions>
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private isManualClose = false

  constructor(options: WSOptions) {
    this.options = {
      heartbeatInterval: 30000,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      onOpen: () => {},
      onMessage: () => {},
      onError: () => {},
      onClose: () => {},
      ...options,
    }
  }

  /**
   * 连接 WebSocket
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }

    try {
      this.ws = new WebSocket(this.options.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.options.onOpen()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage

          // 处理心跳响应
          if (data.type === 'pong') {
            return
          }

          this.options.onMessage(data)
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.options.onError(error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        this.stopHeartbeat()
        this.options.onClose()

        // 非手动关闭则尝试重连
        if (!this.isManualClose) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.reconnect()
    }
  }

  /**
   * 发送消息
   */
  send(data: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  /**
   * 关闭连接
   */
  close() {
    this.isManualClose = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', data: null })
    }, this.options.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 重新连接
   */
  private reconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }
}

/**
 * 创建模拟 WebSocket 数据源（用于开发和演示环境）
 * 提供丰富的假数据，包括人员、车辆、设备、告警等
 */
export function createMockWebSocket(onMessage: (data: WSMessage) => void) {
  let personnelData: any[] = []
  let vehicleData: any[] = []
  let deviceData: any[] = []

  // 导入模拟数据生成器
  import('./mockData').then((mockData) => {
    // 初始化数据
    personnelData = mockData.generatePersonnel(156)
    vehicleData = mockData.generateVehicles(89)
    deviceData = mockData.generateDevices(324)

    console.log('✅ 模拟数据已生成：')
    console.log(`  - 人员数据：${personnelData.length} 条`)
    console.log(`  - 车辆数据：${vehicleData.length} 条`)
    console.log(`  - 设备数据：${deviceData.length} 条`)

    // 发送初始数据
    onMessage({
      type: 'initial_data',
      data: {
        personnel: personnelData,
        vehicles: vehicleData,
        devices: deviceData,
      },
      timestamp: Date.now(),
    })

    // 设备统计
    const deviceStats = mockData.generateDeviceStats(deviceData)
    onMessage({
      type: 'device_stats',
      data: deviceStats,
      timestamp: Date.now(),
    })

    // 车辆统计
    const vehicleStats = mockData.generateVehicleStats(vehicleData)
    onMessage({
      type: 'vehicle_stats',
      data: vehicleStats,
      timestamp: Date.now(),
    })

    // 人员流量趋势
    const personnelTrend = mockData.generatePersonnelTrend()
    onMessage({
      type: 'personnel_trend',
      data: personnelTrend,
      timestamp: Date.now(),
    })
  })

  // 定时更新人员位置（每3秒）
  const personnelUpdateInterval = setInterval(() => {
    if (personnelData.length === 0) return

    import('./mockData').then((mockData) => {
      // 更新人员位置
      personnelData = mockData.updatePersonnelPositions(personnelData)

      // 发送部分人员更新（模拟实时追踪）
      const updateCount = Math.floor(Math.random() * 10) + 5
      const updates = personnelData.slice(0, updateCount)

      onMessage({
        type: 'personnel_update',
        data: updates,
        timestamp: Date.now(),
      })
    })
  }, 3000)

  // 定时更新车辆位置（每2秒）
  const vehicleUpdateInterval = setInterval(() => {
    if (vehicleData.length === 0) return

    import('./mockData').then((mockData) => {
      // 更新车辆位置和速度
      vehicleData = mockData.updateVehiclePositions(vehicleData)

      // 发送部分车辆更新
      const updateCount = Math.floor(Math.random() * 8) + 3
      const updates = vehicleData.slice(0, updateCount)

      onMessage({
        type: 'vehicle_update',
        data: updates,
        timestamp: Date.now(),
      })
    })
  }, 2000)

  // 随机生成告警（每5-15秒）
  let alertInterval: number
  const scheduleNextAlert = () => {
    const delay = Math.floor(Math.random() * 10000) + 5000 // 5-15秒
    alertInterval = window.setTimeout(() => {
      import('./mockData').then((mockData) => {
        const alert = mockData.generateRandomAlert()
        onMessage({
          type: 'alert',
          data: alert,
          timestamp: Date.now(),
        })
        scheduleNextAlert()
      })
    }, delay)
  }
  scheduleNextAlert()

  // 设备状态变化（每10秒）
  const deviceUpdateInterval = setInterval(() => {
    if (deviceData.length === 0) return

    // 随机改变1-3个设备的状态
    const changeCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < changeCount; i++) {
      const randomIndex = Math.floor(Math.random() * deviceData.length)
      const device = deviceData[randomIndex]

      // 状态转换概率
      if (device.status === 'fault' && Math.random() > 0.3) {
        device.status = 'online' // 故障恢复
      } else if (device.status === 'offline' && Math.random() > 0.5) {
        device.status = 'online' // 重新上线
      } else if (device.status === 'online' && Math.random() > 0.98) {
        device.status = Math.random() > 0.5 ? 'offline' : 'fault' // 偶尔离线或故障
      }
    }

    import('./mockData').then((mockData) => {
      const deviceStats = mockData.generateDeviceStats(deviceData)
      onMessage({
        type: 'device_stats',
        data: deviceStats,
        timestamp: Date.now(),
      })
    })
  }, 10000)

  // 清理函数
  return () => {
    clearInterval(personnelUpdateInterval)
    clearInterval(vehicleUpdateInterval)
    clearInterval(deviceUpdateInterval)
    if (alertInterval) {
      clearTimeout(alertInterval)
    }
    console.log('🛑 模拟数据源已停止')
  }
}
