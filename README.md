# 田园展厅 · 广西农业职业技术大学 3D 线上虚拟展厅



## 项目结构

```
3dzhanting/
├── public/placeholders/   # 真实作品图片/视频放这里（现由程序占位）
├── src/
│   ├── components/
│   │   ├── Scene.tsx           # 3D 场景与光照
│   │   ├── GalleryRoom.tsx     # 展厅房间（地板/墙面/横幅/梯田画/竹灯）
│   │   ├── ExhibitFrame.tsx    # 展品画框与交互
│   │   ├── Entrance.tsx        # 入口木坊与牌匾
│   │   ├── Decorations.tsx     # 四季展台/长椅/绿植等装饰
│   │   ├── PlayerControls.tsx  # 电脑键鼠漫游
│   │   ├── TouchControls.tsx   # 手机摇杆 + 拖动视角
│   │   ├── TouchCameraRig.tsx  # 手机漫游相机
│   │   ├── TourCameraRig.tsx   # 导览飞行相机
│   │   └── ui/                 # 顶栏/详情面板/留言板/导览条等 UI
│   ├── data/exhibits.ts        # 展品数据（在这里增删改作品）
│   ├── store/useExhibitStore.ts# 全局状态
│   ├── theme.ts                # 田园色板/房间尺寸/学校文案
│   └── config/giscus.ts        # 留言板配置
└── .github/workflows/deploy.yml# GitHub Pages 自动部署
```

## 技术栈

React 18 · TypeScript · Vite 6 · Three.js · @react-three/fiber · @react-three/drei · zustand · Tailwind CSS
