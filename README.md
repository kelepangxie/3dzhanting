# 田园展厅 · 广西农业职业技术大学 3D 线上虚拟展厅

以「清新稻田」田园风格呈现的 3D 虚拟展厅，展示视觉传达设计专业师生作品。
基于 React + Three.js（@react-three/fiber）构建，支持 **电脑键鼠漫游** 与 **手机摇杆漫游 / 热点导览** 两种浏览方式，内置 giscus 留言板。

- 校训：**厚德明志 · 勤耕笃行**
- 办学理念：立德树人 · 强农兴农 · 德技并修 · 耕读传家 · 服务“三农” · 乡村振兴
- 展厅主题：以美育人，以设计耕耘乡土

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 本地开发，浏览器打开提示的地址（默认 http://localhost:5173）
npm run build   # 构建生产版本到 dist/
```

## 浏览方式

| 设备 | 漫游模式 | 导览模式 |
| --- | --- | --- |
| 电脑 | 点击画面进入 → WASD 移动、鼠标转视角、点击展品看详情、ESC 退出 | 点击顶栏「导览」→ 底部缩略条切换展品，相机会飞到展品面前 |
| 手机 | 顶栏切换「漫游」→ 左下摇杆移动、拖动屏幕转视角、点按展品看详情 | 默认模式 → 底部缩略条切换展品，再点一次查看详情 |

## 替换真实作品

所有展品目前使用程序生成的宣纸风占位图。替换为真实作品只需两步：

1. 把作品文件放到 `public/placeholders/` 目录（文件名与代码中一致）：
   - 图片：`exhibit-1.jpg`、`exhibit-3.jpg` ……（尺寸建议 1200px 以上）
   - 视频：`exhibit-2.mp4`、`exhibit-4.mp4` ……（建议 1080p 以内，单个 < 50MB）
2. 需要改标题/作者/描述时，编辑 `src/data/exhibits.ts` 中对应展品的字段即可。

文件放好后**无需改代码**，展厅画框和详情面板会自动加载真实图片/视频。

## 留言板配置（giscus）

留言板基于 [giscus](https://giscus.app/zh-CN)，使用 GitHub Discussions 存储评论，免费且无需后端服务器。开通步骤：

1. GitHub 仓库 → **Settings → General → Features** → 勾选 **Discussions**
2. 安装 [giscus App](https://github.com/apps/giscus)，并授予本仓库权限
3. 打开 [giscus.app/zh-CN](https://giscus.app/zh-CN)：
   - 仓库名填 `你的用户名/3dzhanting`
   - 映射方式选 `pathname`，分类选 `Announcements`（或 `General`）
   - 页面下方会生成代码，从中复制 `data-repo-id` 和 `data-category-id`
4. 把四个值填入 `src/config/giscus.ts`，提交推送即可开放留言

访客用 GitHub 账号即可留言、点赞和回复，无需注册新账号。

## 发布到 GitHub Pages

本项目已配置自动部署工作流（`.github/workflows/deploy.yml`）：

```bash
# 在本目录（3dzhanting）下执行，仓库已是独立 git 仓库
git remote add origin https://github.com/你的用户名/3dzhanting.git
git push -u origin main
```

然后在 GitHub 仓库 → **Settings → Pages** → Source 选择 **GitHub Actions**。
之后每次 `git push`，Actions 会自动构建并发布，网站地址为
`https://你的用户名.github.io/3dzhanting/`。

> 提示：仓库需要设为 **Public**，他人才能访问；Actions 对公开仓库免费。

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
