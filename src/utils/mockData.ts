/**
 * 模拟数据生成器
 * 为数据大屏提供丰富的演示数据
 */

import type { Device, Person, Vehicle, Building } from '@/types'

// 园区坐标范围（广州某区域）
const PARK_CENTER = { lng: 113.264, lat: 23.129 }
const COORDINATE_RANGE = 0.01

// 随机坐标生成
function randomCoordinate() {
  return {
    lng: PARK_CENTER.lng + (Math.random() - 0.5) * COORDINATE_RANGE,
    lat: PARK_CENTER.lat + (Math.random() - 0.5) * COORDINATE_RANGE,
  }
}

// 建筑物名称
const BUILDING_NAMES = [
  'A栋办公楼',
  'B栋研发中心',
  'C栋生产车间',
  'D栋仓储中心',
  '综合服务楼',
  '员工餐厅',
  '展示中心',
  '停车场',
]

// 部门名称
const DEPARTMENTS = [
  '研发部',
  '生产部',
  '质检部',
  '市场部',
  '行政部',
  '财务部',
  '人力资源部',
  '安全部',
  '物流部',
  '技术支持部',
]

// 设备类型
const DEVICE_TYPES = [
  { type: 'camera', name: '监控摄像头' },
  { type: 'sensor', name: '环境传感器' },
  { type: 'access', name: '门禁系统' },
  { type: 'fire', name: '消防设备' },
  { type: 'lighting', name: '智能照明' },
  { type: 'hvac', name: '空调系统' },
  { type: 'energy', name: '能耗监测' },
]

// 告警消息模板
const ALERT_TEMPLATES = [
  { level: 'high', messages: ['火警预警', '入侵检测', '设备故障', '人员未授权进入'] },
  {
    level: 'medium',
    messages: ['温度异常', '湿度超标', '门禁异常', '设备离线', '能耗超限'],
  },
  { level: 'low', messages: ['设备维护提醒', '定期检查提醒', '耗材更换提示', '系统更新通知'] },
]

// 姓氏和名字库
const SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '林']
const GIVEN_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀', '英', '华', '文']

// 车牌前缀
const PLATE_PREFIXES = ['粤A', '粤B', '粤C', '粤D', '粤E', '粤F']

/**
 * 生成随机姓名
 */
function randomName(): string {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  const givenName1 = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)]
  const givenName2 = Math.random() > 0.5 ? GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)] : ''
  return surname + givenName1 + givenName2
}

/**
 * 生成随机车牌
 */
function randomPlate(): string {
  const prefix = PLATE_PREFIXES[Math.floor(Math.random() * PLATE_PREFIXES.length)]
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '0123456789'

  let plate = prefix
  plate += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 4; i++) {
    plate += digits[Math.floor(Math.random() * digits.length)]
  }
  plate += Math.random() > 0.5 ? letters[Math.floor(Math.random() * letters.length)] : digits[Math.floor(Math.random() * digits.length)]

  return plate
}

/**
 * 生成建筑物数据
 */
export function generateBuildings(count: number = 8): Building[] {
  return Array.from({ length: Math.min(count, BUILDING_NAMES.length) }, (_, i) => ({
    id: `building-${i + 1}`,
    name: BUILDING_NAMES[i],
    position: randomCoordinate(),
    height: Math.floor(Math.random() * 50) + 20,
    floors: Math.floor(Math.random() * 15) + 5,
    type: i < 4 ? 'office' : 'service',
  }))
}

/**
 * 生成设备数据
 */
export function generateDevices(count: number = 324): Device[] {
  return Array.from({ length: count }, (_, i) => {
    const deviceType = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)]
    const statusRand = Math.random()
    let status: 'online' | 'offline' | 'fault'

    if (statusRand > 0.96) {
      status = 'fault'
    } else if (statusRand > 0.94) {
      status = 'offline'
    } else {
      status = 'online'
    }

    return {
      id: `device-${i + 1}`,
      name: `${deviceType.name}${String(i + 1).padStart(3, '0')}`,
      type: deviceType.type,
      status,
      position: randomCoordinate(),
    }
  })
}

/**
 * 生成人员数据
 */
export function generatePersonnel(count: number = 156): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `person-${i + 1}`,
    name: randomName(),
    department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    position: randomCoordinate(),
    status: Math.random() > 0.95 ? 'warning' : 'normal',
  }))
}

/**
 * 生成车辆数据
 */
export function generateVehicles(count: number = 89): Vehicle[] {
  const types: Array<'small' | 'medium' | 'large' | 'special'> = ['small', 'medium', 'large', 'special']
  const weights = [0.5, 0.3, 0.15, 0.05] // 各类型概率

  return Array.from({ length: count }, (_, i) => {
    const rand = Math.random()
    let type: 'small' | 'medium' | 'large' | 'special'

    if (rand < weights[0]) {
      type = 'small'
    } else if (rand < weights[0] + weights[1]) {
      type = 'medium'
    } else if (rand < weights[0] + weights[1] + weights[2]) {
      type = 'large'
    } else {
      type = 'special'
    }

    return {
      id: `vehicle-${i + 1}`,
      plate: randomPlate(),
      type,
      position: randomCoordinate(),
      speed: Math.floor(Math.random() * 30) + 5,
    }
  })
}

/**
 * 生成随机告警
 */
export function generateRandomAlert() {
  const category = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)]
  const message = category.messages[Math.floor(Math.random() * category.messages.length)]
  const location = BUILDING_NAMES[Math.floor(Math.random() * BUILDING_NAMES.length)]

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    level: category.level as 'high' | 'medium' | 'low',
    message,
    location,
    timestamp: Date.now(),
  }
}

/**
 * 生成人员流量趋势数据（24小时）
 */
export function generatePersonnelTrend(): number[] {
  // 模拟真实的人员流量：早高峰、午休、晚高峰
  return Array.from({ length: 24 }, (_, hour) => {
    let base = 30

    // 早高峰 (7-9点)
    if (hour >= 7 && hour <= 9) {
      base = 100 + Math.random() * 50
    }
    // 工作时间 (9-12点, 14-18点)
    else if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)) {
      base = 120 + Math.random() * 30
    }
    // 午休 (12-14点)
    else if (hour >= 12 && hour < 14) {
      base = 80 + Math.random() * 20
    }
    // 晚高峰 (18-19点)
    else if (hour >= 18 && hour < 19) {
      base = 90 + Math.random() * 40
    }
    // 夜间 (19-7点)
    else {
      base = 10 + Math.random() * 20
    }

    return Math.floor(base)
  })
}

/**
 * 生成设备状态分布数据
 */
export function generateDeviceStats(devices: Device[]) {
  const online = devices.filter((d) => d.status === 'online').length
  const offline = devices.filter((d) => d.status === 'offline').length
  const fault = devices.filter((d) => d.status === 'fault').length

  return { online, offline, fault }
}

/**
 * 生成车辆类型统计数据
 */
export function generateVehicleStats(vehicles: Vehicle[]) {
  const small = vehicles.filter((v) => v.type === 'small').length
  const medium = vehicles.filter((v) => v.type === 'medium').length
  const large = vehicles.filter((v) => v.type === 'large').length
  const special = vehicles.filter((v) => v.type === 'special').length

  return { small, medium, large, special }
}

/**
 * 随机更新人员位置（模拟移动）- 室外人员移动更频繁
 */
export function updatePersonnelPositions(personnel: Person[]): Person[] {
  return personnel.map((person) => {
    // 室外人员：30%概率移动（走动的人）
    if (person.location === 'outdoor' && Math.random() < 0.3) {
      return {
        ...person,
        position: {
          lng: person.position.lng + (Math.random() - 0.5) * 0.0008, // 移动距离更大
          lat: person.position.lat + (Math.random() - 0.5) * 0.0008,
        },
      }
    }
    // 室内人员：10%概率移动（在建筑内小范围走动）
    else if (person.location !== 'outdoor' && Math.random() < 0.1) {
      return {
        ...person,
        position: {
          lng: person.position.lng + (Math.random() - 0.5) * 0.0003, // 建筑内小范围移动
          lat: person.position.lat + (Math.random() - 0.5) * 0.0003,
        },
      }
    }
    return person
  })
}

/**
 * 随机更新车辆位置和速度（模拟行驶）
 */
export function updateVehiclePositions(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map((vehicle) => {
    // 车辆持续移动
    const speedFactor = vehicle.speed / 100000
    return {
      ...vehicle,
      position: {
        lng: vehicle.position.lng + (Math.random() - 0.5) * speedFactor,
        lat: vehicle.position.lat + (Math.random() - 0.5) * speedFactor,
      },
      speed: Math.max(5, Math.min(50, vehicle.speed + (Math.random() - 0.5) * 5)),
    }
  })
}

/**
 * 根据日期生成历史数据（支持3天内的数据）
 * @param date 日期对象
 * @returns 该日期的模拟数据
 */
export function generateHistoricalData(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // 计算天数差异（0=今天，1=昨天，2=前天）
  const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))

  // 根据天数差异调整数据量（总数减少到25人左右）
  const personnelMultiplier = 1 - daysDiff * 0.15
  const vehicleMultiplier = 1 - daysDiff * 0.12
  const deviceMultiplier = 1 - daysDiff * 0.05

  // 生成人员数据：外面10个，建筑里15个，总计25人
  const outdoorPersonnel = generateOutdoorPersonnel(Math.floor(10 * personnelMultiplier))
  const indoorPersonnel = generateIndoorPersonnel(Math.floor(15 * personnelMultiplier))
  const personnel = [...outdoorPersonnel, ...indoorPersonnel]

  // 车辆数据：8辆左右，都在外面（不在建筑里）
  const vehicles = generateOutdoorVehicles(Math.floor(8 * vehicleMultiplier))

  // 设备数据保持不变
  const devices = generateDevices(Math.floor(324 * deviceMultiplier))

  return {
    personnel,
    vehicles,
    devices,
    date: targetDate,
    daysDiff,
  }
}

/**
 * 生成室外人员（园区外围、道路上）
 */
function generateOutdoorPersonnel(count: number): Person[] {
  const personnel: Person[] = []
  const offset = 0.008 // 园区范围

  for (let i = 0; i < count; i++) {
    // 在园区外围生成（边缘区域）
    const angle = (Math.random() * 360 * Math.PI) / 180
    const distance = 0.003 + Math.random() * 0.004 // 在外围圈

    personnel.push({
      id: `person-outdoor-${i}`,
      name: randomName(),
      department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
      position: {
        lng: PARK_CENTER.lng + Math.cos(angle) * distance,
        lat: PARK_CENTER.lat + Math.sin(angle) * distance,
      },
      status: Math.random() > 0.9 ? 'warning' : 'normal',
      location: 'outdoor', // 标记为室外
    })
  }

  return personnel
}

/**
 * 生成室内人员（建筑物内部）
 */
function generateIndoorPersonnel(count: number): Person[] {
  const personnel: Person[] = []

  // 8栋建筑的位置偏移（与Cesium场景中的建筑对应）
  const buildingOffsets = [
    { id: 'building-1', name: 'A栋', offset: [-25, -25] },
    { id: 'building-2', name: 'B栋', offset: [0, -25] },
    { id: 'building-3', name: 'C栋', offset: [25, -25] },
    { id: 'building-4', name: 'D栋', offset: [-25, 5] },
    { id: 'building-5', name: 'E栋', offset: [0, 0] },
    { id: 'building-6', name: 'F栋', offset: [25, 0] },
    { id: 'building-7', name: 'G栋', offset: [-15, 25] },
    { id: 'building-8', name: 'H栋', offset: [15, 25] },
  ]

  for (let i = 0; i < count; i++) {
    // 随机选择一栋建筑
    const building = buildingOffsets[Math.floor(Math.random() * buildingOffsets.length)]

    // 在建筑范围内随机位置（建筑内部）
    const randomOffsetX = (Math.random() - 0.5) * 0.001 // 建筑内小范围
    const randomOffsetY = (Math.random() - 0.5) * 0.001

    personnel.push({
      id: `person-indoor-${i}`,
      name: randomName(),
      department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
      position: {
        lng: PARK_CENTER.lng + building.offset[0] / 10000 + randomOffsetX,
        lat: PARK_CENTER.lat + building.offset[1] / 10000 + randomOffsetY,
      },
      status: Math.random() > 0.95 ? 'warning' : 'normal',
      location: building.name, // 标记所在建筑
      buildingId: building.id,
    })
  }

  return personnel
}

/**
 * 生成室外车辆（道路、停车场，不在建筑内）
 */
function generateOutdoorVehicles(count: number): Vehicle[] {
  const vehicles: Vehicle[] = []

  for (let i = 0; i < count; i++) {
    // 车辆在道路和停车场（园区外围）
    const angle = (Math.random() * 360 * Math.PI) / 180
    const distance = 0.002 + Math.random() * 0.005 // 道路和停车区域

    vehicles.push({
      id: `vehicle-${i}`,
      plate: randomPlate(),
      type: ['small', 'medium', 'large', 'special'][Math.floor(Math.random() * 4)] as any,
      position: {
        lng: PARK_CENTER.lng + Math.cos(angle) * distance,
        lat: PARK_CENTER.lat + Math.sin(angle) * distance,
      },
      speed: 5 + Math.random() * 30,
      status: 'normal',
    })
  }

  return vehicles
}

/**
 * 根据日期生成人员流量趋势（考虑历史因素）
 * @param date 日期对象
 * @returns 24小时人员流量数据
 */
export function generateHistoricalPersonnelTrend(date: Date): number[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
  const factor = 1 - daysDiff * 0.1 // 历史数据衰减系数

  // 模拟真实的人员流量：早高峰、午休、晚高峰
  return Array.from({ length: 24 }, (_, hour) => {
    let base = 30

    // 早高峰 (7-9点)
    if (hour >= 7 && hour <= 9) {
      base = 100 + Math.random() * 50
    }
    // 工作时间 (9-12点, 14-18点)
    else if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)) {
      base = 120 + Math.random() * 30
    }
    // 午休 (12-14点)
    else if (hour >= 12 && hour < 14) {
      base = 80 + Math.random() * 20
    }
    // 晚高峰 (18-19点)
    else if (hour >= 18 && hour < 19) {
      base = 90 + Math.random() * 40
    }
    // 夜间 (19-7点)
    else {
      base = 10 + Math.random() * 20
    }

    return Math.floor(base * factor)
  })
}

