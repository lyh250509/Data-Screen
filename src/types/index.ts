# TypeScript 类型定义

export interface Position {
  lng: number
  lat: number
}

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Building {
  id: string
  name: string
  position: Position
  height: number
  floors: number
  type: string
}

export interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'fault'
  position: Position
}

export interface Person {
  id: string
  name: string
  department: string
  position: Position
  status: 'normal' | 'warning'
}

export interface Vehicle {
  id: string
  plate: string
  type: 'small' | 'medium' | 'large' | 'special'
  position: Position
  speed: number
}
