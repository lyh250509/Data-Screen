# 数字孪生底座架构升级说明

## 📋 升级概述

将原本分离的 **2D 地图（OpenLayers）** 和 **3D 场景（Three.js）** 合二为一，升级为基于 **Cesium.js** 的统一三维 GIS 可视化场景，实现"地上一体、虚实映射"的数字孪生底座。

## 🎯 核心改进

### 1. 架构统一
- **原架构**：Dashboard 分为上下两个独立容器
  - 上半部分：OpenLayers 2D 地图
  - 下半部分：Three.js 3D 场景
  - 通过 store 进行数据联动

- **新架构**：单一 Cesium 场景
  - 统一的三维 GIS 场景
  - 真实地理坐标系统（WGS84）
  - 2D/2.5D/3D 视角无缝切换
  - 原生支持地图影像 + 3D 建筑 + 实时数据叠加

### 2. 技术栈变化

| 组件 | 原技术 | 新技术 | 优势 |
|------|--------|--------|------|
| 地图底图 | OpenLayers | Cesium + ArcGIS 影像 | 真实卫星影像，3D地形 |
| 3D 渲染 | Three.js | Cesium | 专业 GIS 引擎，性能更优 |
| 坐标系统 | 自定义映射 | WGS84 标准坐标 | 精确地理定位 |
| 视角控制 | 分离的相机 | 统一相机控制 | 流畅的交互体验 |

### 3. 功能增强

#### 三维一体化
- ✅ 真实 GIS 地理底图（卫星影像）
- ✅ 3D 建筑群立体渲染（挤出式建筑）
- ✅ 实时数据流叠加（人员/车辆/设备标记）
- ✅ 2D/2.5D/3D 视角自由切换
- ✅ 点击交互、信息面板展示
- ✅ 相机飞行动画、高亮特效

#### 数字孪生能力
- 🌍 真实地理坐标映射
- 🏢 建筑物参数化建模（高度、占地面积）
- 📍 IoT 数据点实时渲染
- 🎨 状态可视化（颜色编码）
- 📊 信息面板详情展示
- 🎯 精确定位与飞行

## 📁 文件变更

### 新增文件
```
src/
├── stores/
│   └── cesium.ts                    # Cesium 统一状态管理
└── components/
    └── CesiumScene/
        └── index.vue                # Cesium 三维场景组件
```

### 修改文件
```
vite.config.ts                       # 添加 vite-plugin-cesium
src/views/Dashboard/index.vue        # 替换为 CesiumScene
package.json                         # 添加 cesium 依赖
```

### 保留文件（向后兼容）
```
src/components/Map2D/               # 保留原 2D 地图组件
src/components/Scene3D/             # 保留原 3D 场景组件
src/stores/map.ts                   # 复用数据接口
src/stores/scene.ts                 # 保留（备用）
```

## 🚀 使用说明

### 启动项目
```bash
npm run dev
```

### 视角切换
- **3D 视角**：默认视角，可自由旋转、缩放
- **2D 视角**：传统平面地图模式
- **2.5D 视角**：哥伦布视图（Columbus），平面 + 透视

### 交互操作
- **点击建筑**：高亮显示、弹出信息面板、相机飞行
- **点击数据点**：选中标记、展示详细信息
- **鼠标拖拽**：旋转视角
- **滚轮**：缩放场景
- **右键拖拽**：平移视角

## 🎨 可视化特性

### 建筑物渲染
- 基于真实 GIS 坐标的 3D 挤出建筑
- 半透明材质 + 边框线条
- 高亮选中效果（绿色发光）
- 信息面板展示（高度、面积、状态）

### 数据点标记
- 圆点 + 文字标签
- 颜色区分类型：
  - 🟢 人员：绿色 (#43e97b)
  - 🔵 车辆：紫蓝色 (#667eea)
  - 🔵 设备：浅蓝色 (#4facfe)
- 贴地高度（2米）

### 园区边界
- 半透明多边形区域
- 青色边框高亮

## 📊 数据流整合

### WebSocket 实时数据
保持原有的 WebSocket 数据流不变，通过 `mapStore` 接收数据，`CesiumScene` 监听并渲染：

```typescript
// Dashboard 接收 WebSocket 数据
mapStore.addPoint({ id, name, position: [lng, lat], type, status })

// CesiumScene 自动监听并渲染到 3D 场景
watch(() => mapStore.points, (points) => {
  points.forEach(point => addDataPoint(point))
})
```

## 🔧 技术细节

### Cesium Ion Token
当前使用默认公共令牌，**生产环境需要替换**：
1. 注册 [Cesium Ion](https://ion.cesium.com/)
2. 创建 Access Token
3. 替换 `CesiumScene/index.vue` 中的 `Cesium.Ion.defaultAccessToken`

### 坐标转换
- **输入**：经纬度 [lng, lat]
- **Cesium**：自动转换为 Cartesian3 三维坐标
- **优势**：无需手动映射，精确地理定位

### 性能优化
- `requestRenderMode: true` - 按需渲染
- 建筑物使用多边形挤出而非独立模型
- 数据点复用 Entity 系统

## 🎯 下一步扩展

### 建议增强
1. **真实建筑模型**：加载 3D Tiles / glTF 模型替代简单挤出
2. **地形数据**：加载高精度地形（当前使用 Cesium World Terrain）
3. **热力图**：使用 Cesium 的 Primitive 渲染热力分布
4. **轨迹回放**：基于时间轴的历史轨迹动画
5. **实时监控**：集成视频监控流（billboard + video texture）
6. **分析工具**：测距、测面、剖面分析

### API 集成
- 天气数据叠加（云层、降雨）
- 交通流量动画
- 能耗数据可视化
- 环境监测传感器

## 📚 参考文档

- [Cesium 官方文档](https://cesium.com/docs/)
- [Cesium Sandcastle 示例](https://sandcastle.cesium.com/)
- [vite-plugin-cesium](https://github.com/nshen/vite-plugin-cesium)

---

**升级完成时间**：2026-07-05  
**技术负责人**：Kiro AI
