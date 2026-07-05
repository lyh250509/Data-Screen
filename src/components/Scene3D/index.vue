<template>
  <div class="scene-3d-wrapper">
    <div ref="sceneContainer" class="scene-3d"></div>
    <SceneIndicator />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneStore } from '@/stores/scene'
import { useMapStore } from '@/stores/map'
import { throttle } from '@/utils/common'
import SceneIndicator from '@/components/Common/SceneIndicator.vue'

const sceneContainer = ref<HTMLDivElement>()
const sceneStore = useSceneStore()
const mapStore = useMapStore()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2
let animationId: number
let selectedMesh: THREE.Mesh | null = null
let markerMeshes: Map<string, THREE.Mesh> = new Map() // 存储标记对象

// 初始化场景
function initScene() {
  if (!sceneContainer.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e27)
  scene.fog = new THREE.Fog(0x0a0e27, 50, 200)

  // 创建相机
  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(50, 60, 50)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  sceneContainer.value.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2.2
  controls.minDistance = 20
  controls.maxDistance = 150

  // 光照
  initLights()

  // 添加地面
  addGround()

  // 添加楼宇
  addBuildings()

  // 添加粒子车流特效
  addParticleTraffic()

  // Raycaster 用于鼠标交互
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // 保存到 store
  sceneStore.setScene(scene)
  sceneStore.setCamera(camera)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 监听鼠标点击
  renderer.domElement.addEventListener('click', handleClick)

  // 开始渲染
  animate()
}

// 初始化光照
function initLights() {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 平行光（太阳光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(50, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 200
  scene.add(directionalLight)

  // 半球光
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x0a0e27, 0.4)
  scene.add(hemisphereLight)
}

// 添加地面
function addGround() {
  const geometry = new THREE.PlaneGeometry(200, 200)
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1e3a,
    roughness: 0.8,
    metalness: 0.2,
  })
  const ground = new THREE.Mesh(geometry, material)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 网格线
  const gridHelper = new THREE.GridHelper(200, 40, 0x3a86ff, 0x1a3a5a)
  gridHelper.position.y = 0.1
  scene.add(gridHelper)
}

// 添加楼宇
function addBuildings() {
  const buildings = [
    { id: 'building-1', name: 'A栋', position: [-20, 0, -20], size: [15, 30, 10], color: 0x3a86ff },  // 宽15深10的长方形
    { id: 'building-2', name: 'B栋', position: [0, 0, -20], size: [10, 25, 10], color: 0x3a86ff },    // 10x10的正方形
    { id: 'building-3', name: 'C栋', position: [20, 0, -20], size: [12, 35, 18], color: 0x3a86ff },   // 宽12深18的长方形
    { id: 'building-4', name: 'D栋', position: [-20, 0, 0], size: [14, 28, 14], color: 0x3a86ff },    // 14x14的正方形
    { id: 'building-5', name: 'E栋', position: [20, 0, 0], size: [10, 32, 15], color: 0x3a86ff },     // 宽10深15的长方形
  ]

  buildings.forEach((building) => {
    const [w, h, d] = building.size
    const geometry = new THREE.BoxGeometry(w, h, d)
    const material = new THREE.MeshStandardMaterial({
      color: building.color,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.7,
      emissive: building.color,
      emissiveIntensity: 0.2,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(building.position[0], h / 2, building.position[2])
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { id: building.id, name: building.name, type: 'building' }

    // 楼宇边框
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    mesh.add(wireframe)

    scene.add(mesh)

    // 保存到 store
    sceneStore.addBuilding({
      id: building.id,
      name: building.name,
      position: [building.position[0], h / 2, building.position[2]],
      mesh,
    })
  })
}

// 添加粒子车流特效
function addParticleTraffic() {
  const particleCount = 100
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = 1
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100

    colors[i * 3] = 1
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = 0
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 动画更新位置
  function updateParticles() {
    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.02
      positions[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.02

      // 边界检测
      if (Math.abs(positions[i * 3]) > 50) positions[i * 3] *= -1
      if (Math.abs(positions[i * 3 + 2]) > 50) positions[i * 3 + 2] *= -1
    }
    particles.geometry.attributes.position.needsUpdate = true
  }

  // 添加到渲染循环
  const originalAnimate = animate
  animate = function () {
    updateParticles()
    originalAnimate()
  }
}

// 处理点击事件 - 联动到地图
function handleClick(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    const object = intersects[0].object as THREE.Mesh
    if (object.userData.type === 'building') {
      highlightBuilding(object)
      sceneStore.selectBuilding(object.userData.id)
      console.log('🏢 3D场景点击楼宇，通知地图:', object.userData.name)

      // 可以触发地图联动，显示该楼宇对应的区域
    }
  } else {
    clearHighlight()
    sceneStore.selectBuilding(null)
  }
}

// 高亮楼宇
function highlightBuilding(mesh: THREE.Mesh) {
  clearHighlight()
  selectedMesh = mesh
  const material = mesh.material as THREE.MeshStandardMaterial
  material.emissiveIntensity = 0.8
}

// 清除高亮
function clearHighlight() {
  if (selectedMesh) {
    const material = selectedMesh.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 0.2
    selectedMesh = null
  }
}

// 添加点位标记到3D场景
function addMarker(id: string, position: { x: number; z: number }, type: string, name: string) {
  // 如果标记已存在，先移除
  if (markerMeshes.has(id)) {
    const oldMarker = markerMeshes.get(id)
    if (oldMarker) {
      scene.remove(oldMarker)
    }
  }

  // 创建标记几何体（圆柱体，像图钉）
  const geometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8)
  const color = type === 'personnel' ? 0x43e97b : type === 'vehicle' ? 0x667eea : 0x4facfe
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  })

  const marker = new THREE.Mesh(geometry, material)
  marker.position.set(position.x, 1, position.z)
  marker.castShadow = true
  marker.userData = { id, name, type: 'marker' }

  // 添加顶部球体
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16)
  const sphere = new THREE.Mesh(sphereGeometry, material)
  sphere.position.y = 1.5
  marker.add(sphere)

  scene.add(marker)
  markerMeshes.set(id, marker)

  // 添加标记动画（上下浮动）
  animateMarker(marker)

  return marker
}

// 标记浮动动画
function animateMarker(marker: THREE.Mesh) {
  const startY = marker.position.y
  const amplitude = 0.3
  const speed = 0.002

  const animate = () => {
    if (!scene.children.includes(marker)) return // 标记被移除则停止动画

    const offset = Math.sin(Date.now() * speed) * amplitude
    marker.position.y = startY + offset
    marker.rotation.y += 0.02 // 旋转效果

    requestAnimationFrame(animate)
  }

  animate()
}

// 相机飞行到指定位置
function flyToPosition(targetX: number, targetZ: number, duration: number = 1500) {
  const startPosition = camera.position.clone()
  const startTarget = controls.target.clone()

  // 计算目标相机位置（在目标点上方和侧面）
  const endPosition = new THREE.Vector3(targetX + 15, 25, targetZ + 15)
  const endTarget = new THREE.Vector3(targetX, 0, targetZ)

  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const eased = easeInOutCubic(progress)

    // 插值相机位置
    camera.position.lerpVectors(startPosition, endPosition, eased)
    controls.target.lerpVectors(startTarget, endTarget, eased)
    controls.update()

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// 缓动函数
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// 监听地图的点位选择 - 反向联动
watch(
  () => mapStore.selectedPointId,
  (pointId) => {
    if (pointId) {
      const point = mapStore.points.find((p) => p.id === pointId)
      if (point) {
        console.log('🗺️ 地图选择点位，3D场景响应:', point.name)

        // 计算3D坐标（从经纬度映射到3D空间）
        const x = (point.position[0] - mapStore.center[0]) * 10000 - 20
        const z = (point.position[1] - mapStore.center[1]) * 10000 - 20

        // 添加或更新标记
        addMarker(point.id, { x, z }, point.type, point.name)

        // 相机飞到该位置
        flyToPosition(x, z)

        console.log('📍 3D场景定位到坐标:', { x, z, name: point.name })
      }
    }
  }
)

// 窗口大小变化
const handleResize = throttle(() => {
  if (!sceneContainer.value) return

  const width = sceneContainer.value.clientWidth
  const height = sceneContainer.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}, 300)

// 渲染循环
function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (renderer) {
    renderer.domElement.removeEventListener('click', handleClick)
    renderer.dispose()
  }
  if (controls) {
    controls.dispose()
  }
})
</script>

<style lang="scss" scoped>
.scene-3d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.scene-3d {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;

  canvas {
    display: block;
  }
}
</style>
