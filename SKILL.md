---
name: frontend-dev
description: 跨平台前端应用开发：一套 React/TypeScript 代码交付 Web、Windows 桌面（Tauri）、Android（Capacitor）、微信小程序（Taro）。构建、修改和调试现代前端应用（React + TypeScript + Vite + Tailwind CSS 默认栈，含 Vue 3 / 纯 HTML 替代路径）。当用户要求做网页、Web 应用、落地页、dashboard、组件、Windows 桌面应用、安卓 App、Android 应用、微信小程序、跨平台应用、修复前端 bug、重构前端代码、添加 CSS/JS 动画动效、实现响应式或暗色模式时使用。触发词：前端、网页、网站、web app、桌面应用、Windows 应用、安卓、Android、小程序、跨平台、React、Vue、组件、动画、动效、落地页。
---

# 跨平台前端开发

## 平台路由（先确定交付目标，再选技术路径）

| 用户要的目标 | 技术路径 | 参考文件 |
|---|---|---|
| Web 应用 / 网页 / 落地页 | Vite + React + TS + Tailwind | 本文件 + references/quality-checklist.md |
| Windows 桌面应用 | 同上 + **Tauri 2** 套壳 | references/tauri.md |
| Android 应用 | 同上 + **Capacitor** 套壳 | references/capacitor.md |
| 微信小程序 | **Taro 4（React 模式）** 独立工程 | references/taro.md |
| 多个目标同时要 | 以 Web 工程为主干，按需叠加 Tauri / Capacitor；小程序用 Taro 另起工程，复用组件逻辑 | 对应参考文件 |

注意：Tauri 和 Capacitor 都复用同一套 React 前端代码，只是打包壳不同；Taro 因为小程序平台限制（无 DOM、专用组件标签），工程结构不同，但组件逻辑、hooks、状态管理可大部分复用。

## 通用工作流

1. **明确需求**：用途、目标平台、核心功能、有无设计稿。信息足够时直接开工，不要追问。
2. **选栈**：按上表路由；对库版本不确定时用 Context7 查官方文档当前版本，不要凭记忆写已废弃 API。
3. **脚手架**：
   - Web/桌面/Android 主路径：`python <skill>/scripts/scaffold.py <目标目录> --name <项目名>`，然后 `npm install`
   - 小程序路径：按 references/taro.md 初始化
4. **实现**：按功能拆组件；数据与 UI 分离；复杂动效见 references/animation.md（小程序端用 Taro 的 createAnimation 或 CSS 动画，见 taro.md）。
5. **验证**：`npm run build` 必须通过；浏览器实测交互；桌面/Android 端按对应参考文件的「验证」一节执行；按 references/quality-checklist.md 自检。
6. **交付**：本地 Web 应用按客户端规则给预览链接；桌面/Android 交付安装包路径与运行方式；小程序交付工程目录与上传指引。

## 模板结构（assets/react-vite-template）

- Tailwind CSS v4（`@tailwindcss/vite` 插件，CSS 中 `@import 'tailwindcss'`），无 tailwind.config 文件
- TS 严格模式，`tsc -b && vite build` 双重检查
- 暗色模式：根节点加 `.dark` class（模板 CSS 已配 `@custom-variant`）
- `npm run dev` 自动转发 CLI 的 `--host`/`--port` 参数

## 关键规则

- 不要引入 UI 组件库除非用户要求；手写 Tailwind 组件可控性更好。
- 状态管理：单页用 `useState`/`useReducer` + Context；跨页共享再上 Zustand 等轻量库，不上 Redux。
- 路由：react-router-dom v7（模板已含）。数据请求：原生 `fetch` + `useEffect` 足够；复杂缓存再用 TanStack Query。
- 环境变量：Vite 用 `import.meta.env.VITE_*`。**浏览器里的密钥永远公开**：任何「需要保密」的密钥必须放桌面/Android 壳的原生侧（Tauri 命令、Capacitor 插件），不能放前端代码。
- 动效：遵循 animation.md 的性能规则；动 `transform`/`opacity`，尊重 `prefers-reduced-motion`。
- 移动端：先按 375px 设计，再扩展；测试三档宽度。

## 参考文件

- **references/tauri.md** — Windows 桌面应用打包（Tauri 2 初始化、构建、调试、签名分发）
- **references/frameless-window.md** — 无边框窗口配方（自绘标题栏、灵动岛导航、窗口按钮；模板在 assets/frameless-window/）
- **references/capacitor.md** — Android 应用打包（Capacitor 初始化、APK/AAB 构建、真机调试）
- **references/taro.md** — 微信小程序开发（Taro 4 工程、与 Web 代码的差异、上传发布）
- **references/animation.md** — 动画技术选型、弹簧参数速查、性能与无障碍规则
- **references/quality-checklist.md** — 交付前自检清单（功能/响应式/视觉/工程/无障碍）
