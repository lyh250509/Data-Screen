# 智慧园区二三维联动GIS数据可视化大屏

## 项目简介

基于 Vue3 + Vite + TypeScript + Three.js + OpenLayers 构建的智慧园区数字孪生可视化大屏系统，实现二维GIS地图与三维园区场景的联动交互。

## 技术栈

- **框架**: Vue 3.4 + TypeScript 5.4
- **构建工具**: Vite 5.2
- **状态管理**: Pinia 2.1
- **样式**: SCSS
- **可视化**:
  - ECharts 5.5 (图表)
  - Three.js 0.162 (3D渲染)
  - OpenLayers 9.1 (GIS地图)
- **实时通信**: WebSocket

## 核心功能

### 1. 二维GIS模块
- ✅ OpenLayers底图加载(OSM/高德/天地图)
- ✅ GeoJSON园区边界绘制
- ✅ 人员/车辆点位标注
- ✅ 热力图展示
- ✅ 点位弹窗信息
- ✅ 电子围栏告警
- ✅ 地图缩放/平移/查询

### 2. Three.js 3D数字孪生
- ✅ 场景/相机/光照系统搭建
- ✅ 楼宇几何体拉伸建模
- ✅ GLTF模型导入
- ✅ 鼠标交互(旋转/缩放)
- ✅ 楼宇点击高亮弹窗
- ✅ 粒子车流特效
- ✅ InstancedMesh实例化渲染优化

### 3. 二三维联动
- ✅ 二维点位点击 → 三维场景自动定位
- ✅ 三维楼宇点击 → 二维地图同步高亮
- ✅ 镜头平滑过渡动画

### 4. 可视化面板
- ✅ 多类型ECharts图表
- ✅ 实时滚动告警列表
- ✅ 顶部总指标卡片
- ✅ 时间筛选器
- ✅ 全屏切换

### 5. 性能优化
- ✅ 自适应缩放方案(scale + rem)
- ✅ WebSocket实时数据流
- ✅ 防抖节流处理
- ✅ 视锥剔除优化
- ✅ 贴图压缩加载
- ✅ 组件懒加载

## 目录结构

```
big_screen/
├── public/
│   ├── models/          # GLTF 3D模型
│   ├── textures/        # 贴图资源
│   └── data/            # GeoJSON数据
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   │   ├── Charts/      # ECharts图表组件
│   │   ├── Map2D/       # 二维GIS组件
│   │   ├── Scene3D/     # 三维场景组件
│   │   └── Common/      # 通用组件
│   ├── views/
│   │   └── Dashboard/   # 大屏主页面
│   ├── stores/          # Pinia状态管理
│   │   ├── map.ts       # 地图状态
│   │   ├── scene.ts     # 3D场景状态
│   │   └── data.ts      # 数据状态
│   ├── utils/           # 工具函数
│   │   ├── three/       # Three.js工具
│   │   ├── openlayers/  # OpenLayers工具
│   │   ├── websocket.ts # WebSocket封装
│   │   └── scale.ts     # 自适应缩放
│   ├── types/           # TypeScript类型定义
│   ├── styles/          # 全局样式
│   ├── router/          # 路由配置
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览构建

```bash
npm run preview
```

## 部署说明

### 1. Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket代理
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Docker 部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 性能优化方案

### 1. 大屏自适应缩放

采用 `scale + rem` 方案，基于1920x1080设计稿：

```typescript
const scale = Math.min(
  window.innerWidth / 1920,
  window.innerHeight / 1080
);
document.documentElement.style.fontSize = `${scale * 100}px`;
```

### 2. Three.js 渲染优化

- 视锥剔除：只渲染可见区域
- InstancedMesh：实例化渲染大量相同模型
- LOD：根据距离切换模型精度
- 纹理压缩：使用Basis/KTX2格式
- 按需渲染：无交互时停止渲染

### 3. WebSocket 数据流

```typescript
// 心跳保活 + 断线重连
class WSManager {
  private heartbeatTimer: number;
  private reconnectTimer: number;
  
  connect() {
    this.ws = new WebSocket(url);
    this.startHeartbeat();
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
  }
  
  private reconnect() {
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000);
  }
}
```

### 4. 防抖节流

```typescript
// 地图缩放防抖
const handleZoom = debounce((zoom: number) => {
  updateViewport(zoom);
}, 300);

// 渲染循环节流
const render = throttle(() => {
  renderer.render(scene, camera);
}, 16); // 60fps
```

## 数据模拟

WebSocket 实时数据由 `src/utils/websocket.ts` 模拟生成，包括：

- 人员/车辆实时位置
- 设备运行状态
- 告警事件推送
- 统计指标更新

生产环境需对接实际后端 WebSocket 接口。

## 浏览器兼容

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

不支持 IE 浏览器。

## 开发注意事项

1. **坐标系转换**：OpenLayers 使用 EPSG:3857，Three.js 使用右手坐标系，需统一转换
2. **性能监控**：使用 `stats.js` 监控 FPS 和内存
3. **资源清理**：Three.js 场景销毁时务必调用 `dispose()` 释放资源
4. **WebGL 上下文**：避免创建多个 Three.js 场景导致上下文丢失

## License

MIT
