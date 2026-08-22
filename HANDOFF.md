# 交接文档（HANDOFF）

> 更新时间：2026-08-18 · 写给无上下文的新会话。读完本文即可接手继续开发，无需翻聊天记录。

---

## 一、我们在做什么

**「八桂采鲜·亲子同欢」3D 线上展厅** —— 为广西农业职业技术大学人文与艺术学院视觉传达设计专业「刀马组」创意海报展搭建的可漫游 3D 虚拟展厅。

- **技术栈**：React 18 + TypeScript + Vite 6 + Three.js（@react-three/fiber + @react-three/drei）+ Tailwind CSS + zustand
- **空间设计**：椭圆曲面"洞穴式"展厅——连续弧形白墙（带有机起伏与顶部内收）+ 穹顶椭圆天窗 + 拱形花架门洞；室内为草坪/原木等田园地面，室外是真实天空 + 森林环绕
- **视觉语言**：田园风（宣纸米白 × 稻田绿 × 麦穗金，见 `src/theme.ts` 的 `PASTORAL`）
- **核心交互**：桌面端指针锁定漫游（WASD + 鼠标）、导览模式（点缩略图跳转）、触屏摇杆；点击展板弹出作品详情

## 二、代码地图

| 文件 | 职责 |
|---|---|
| `src/theme.ts` | **几何与配色权威定义**：`HALL`（椭圆展厅尺寸）、`PASTORAL`（色板）、`wallWobble`（墙面起伏）、`wallOutwardNormal`（墙面真法线）、`wallSurfacePoint`（墙面表面点）、`hallPoint`/`hallFacing`/`clampToHall` |
| `src/data/exhibits.ts` | 12 件展品数据；`wallSlot()` 负责把展板摆到墙上（真法线 + 数值间隙求解） |
| `src/components/Scene.tsx` | R3F Canvas、天空（drei `Sky`）、灯光、组件组装 |
| `src/components/GalleryRoom.tsx` | 地面/弧墙/墙裙/穹顶/天窗/横幅/灯带 + `OutdoorWorld`（户外草坪、土路、实例化森林） |
| `src/components/ExhibitFrame.tsx` | 单个展板（画面 + 原木背板画框 + 标签牌 + 射灯 + hover 提示） |
| `src/components/Decorations.tsx` | 田园装饰：四季展台、长椅、绿植竹丛、**大树/蘑菇丛/灌木/花丛/树桩/萤火虫**（`BigTree`/`MushroomCluster`/`Bush` 已 export 供 GalleryRoom 复用） |
| `src/components/PlayerControls.tsx` | 指针锁定漫游（桌面端） |
| `src/components/Entrance.tsx` | 拱形花架门 + 宣纸牌匾 |
| `src/store/useExhibitStore.ts` | zustand 全局状态：选中展品、锁定状态、控制模式、装饰开关等 |
| `src/components/ui/` | InfoPanel（详情）、DecorPanel（装饰设置）、TourBar、ControlHints 等 2D UI |
| `public/exhibits/`、`public/placeholders/` | 真实作品图/视频（放同名文件自动替换占位图） |

## 三、已完成（3 个提交，本地 master，无远程）

| 提交 | 内容 |
|---|---|
| `8343d9a` | 基线版本（复制自 3dzhanting 田园风格展厅） |
| `2c58f62` | ① 点击展品详情时真正 `exitPointerLock()`，修复鼠标卡死；② 南瓜海报移出入口门洞区（96°→110°）；③ 新增大树/蘑菇/灌木/花丛/树桩/萤火虫等森林元素；④ 含此前会话的椭圆洞穴式展厅改造 |
| `e811299` | ① 画框改按椭圆**真法线**定向 + 数值求解离墙间距，12 幅展板全部完整悬浮墙前（背板间隙 7~11cm，已脚本验证无穿插）；② drei `Sky` 真实天空，天窗直接透出；③ 户外大草坪（半径 120m）+ 门口夯土小路 + 70 棵实例化森林树环 + 近景树/蘑菇/灌木 |

**当前状态**：工作区干净、`npm run build` 通过、dev 服务器运行在 **http://localhost:5176/**（5173~5175 被此前遗留的 dev 服务占用）。用户反馈的三轮问题（鼠标卡死、画框穿墙、缺大树森林）已全部解决并提交。

## 四、当前卡点

**无硬性阻塞**。待用户确认的开放项：

1. **远程仓库未配置**——仓库只有本地 master，用户说有需要再给远程地址推送
2. **遗留 dev 服务器**——5173~5175 端口被旧会话的 vite 进程占用，未清理（清理前先和用户确认）
3. **真实作品素材**——展厅目前用程序生成的宣纸风占位图，真实海报需用户放入 `public/exhibits/`

## 五、下一步计划（按优先级）

1. 用户浏览器实测 5176 端口：确认画框完整可见、门洞外森林天空效果、点击详情后鼠标正常
2. 若满意 → 等用户给远程仓库地址后 `git remote add` + push
3. 引导用户放置真实作品图（README 有说明：放 `public/placeholders/` 同名文件）
4. 可能的后续需求方向：性能优化（当前 bundle 1MB+，可对 three 做 manualChunks 拆分）、更多装饰开关、移动端体验微调

## 六、绝对不要再踩的坑（重要）

1. **画框摆放必须用真法线，不能用径向**。椭圆墙在象限中部（约 30°~60° 等）的真法线与"指向圆心"的径向偏差接近 20°，按径向摆画框必然一侧斜插进墙。必须走 `wallOutwardNormal` + `wallSlot()` 的数值间隙求解，改尺寸时只需调 `FRAME_BACK`/`FRAME_GAP` 常量。

2. **入口缺口 76°~104°（ENTRANCE_SPAN=28°，中心 90° 朝 +Z）没有墙**。任何 thetaDeg 落在此区间的展板都会悬在门洞里与拱门立柱穿插。布展时避开该区间。

3. **卸载 PlayerControls 不会释放浏览器指针锁定**，光标会"卡死"（用户第一轮反馈的核心 bug）。修复方式有三处且缺一不可：
   - `Scene.tsx`：PlayerControls 常驻（不随 selectedExhibit 卸载）
   - `PlayerControls.tsx` / `InfoPanel.tsx`：打开详情时显式调用 `document.exitPointerLock()`
   - `PlayerControls.tsx`：`!isLocked` 时不响应移动键（否则在详情面板按左右键切展品时相机漂移）

4. **不要恢复 drei PointerLockControls 的默认点击锁定**。已用 `selector="#gallery-lock-trigger-none"` 禁用，改为监听自定义 `gallery:enter` 事件（由 ControlHints 的"点击进入展厅"卡片触发）。恢复默认会导致顶栏按钮点击也变成指针锁定，整个 UI 失效。

5. **`wallSurfacePoint()`（theme.ts）必须与 GalleryRoom 的墙体几何严格一致**：相同的 `wallWobble`、相同的顶部内收公式 `shrink = 1 - 0.035 * (y/HEIGHT)²`、相同 lean 参数。任何一方改动都要同步另一方，否则画框间隙计算失真、重新穿墙。

6. **本终端 git 不在 PATH**，用完整路径：`& 'C:\Program Files\Git\cmd\git.exe' <命令>`。

7. **PowerShell 无 `head` 命令**（会报 CommandNotFoundException），用 `Select-Object -First n` 或 `Get-Content`。

8. **git 的 LF→CRLF 警告无害**，不要为此改行尾配置。

9. **User Preferences（用户长期偏好，务必遵守）**：中文沟通；每步改动要有构建/数值验证记录；要求 Git 版本管理；不要伪造数据；改完先本地验证再提交；提交信息用中文、按"类型: 描述"格式（如 `fix: xxx`）。

## 七、常用命令

```powershell
# 开发（注意 5173-5175 可能被占用，vite 会自动换端口）
npm run dev

# 构建验证（tsc -b + vite build，约 45 秒）
npm run build

# git（完整路径）
& 'C:\Program Files\Git\cmd\git.exe' status
& 'C:\Program Files\Git\cmd\git.exe' log --oneline -5
```
