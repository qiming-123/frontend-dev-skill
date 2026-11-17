# 无边框窗口：自绘标题栏完整配方（Tauri 2 + React）

经实战验证的完整流程，目标是 Kimi Work 式的「应用头部和窗口融为一体」效果：去掉系统标题栏，悬浮导航（灵动岛）可拖拽移动窗口，右上角自绘最小化/最大化/关闭按钮。

## 配置（3 处必改，缺一不可）

**1. `src-tauri/tauri.conf.json`** — 窗口加无边框：

```json
"windows": [{ "decorations": false }]
```

**2. `src-tauri/capabilities/default.json`** — 授权窗口 API（漏了会静默失灵：按钮没反应 + 拖不动）：

```json
"permissions": [
  "core:default",
  "core:window:allow-minimize",
  "core:window:allow-toggle-maximize",
  "core:window:allow-close",
  "core:window:allow-is-maximized",
  "core:window:allow-start-dragging"
]
```

**3. `npm install @tauri-apps/api`**

## 组件

把 `assets/frameless-window/` 里的两个组件复制进项目的 `src/components/`，按项目调整导航链接即可。核心要点：

- **拖拽**：任何带 `data-tauri-drag-region` 的元素都可拖动窗口。实用模式：灵动岛外的整条顶部放一个透明的 `fixed inset-x-0 top-0 h-32 z-40` 层做抓手；灵动岛本身 `pointer-events-none` + 内部 `pointer-events-auto`，保证岛外区域可拖、岛上元素可点。
- **窗口按钮**：右上角 `fixed top-0 right-0 z-50`，只在 Tauri 环境渲染（判断 `'__TAURI_INTERNALS__' in window`），浏览器预览时隐藏。最大化状态用 `win.onResized` + `win.isMaximized()` 实时跟踪，图标在最大化/还原间切换。
- **关闭按钮 hover 必须变红**（Windows 用户肌肉记忆）。
- 浏览器预览环境没有这三个按钮，属正常，不是 bug。
- **跨平台复用这个组件时**（同一工程还要出 Android/Web）：导航贴顶不下移、不渲染 `data-tauri-drag-region` 层（会吞触摸）。用 `'__TAURI_INTERNALS__' in window` 判断 Tauri 才下移，用 `Capacitor.isNativePlatform()` 判断原生端；详见 capacitor.md「常见坑」最后一条。

## 快速出 exe（不打包 MSI）

WiX/NSIS 需联网下载，网络受限时直接出免安装 exe：

```bash
# build-exe.bat：VsDevCmd 初始化 MSVC 环境 + cargo 进 PATH
node tauri-run.cjs build --no-bundle
# 产物：src-tauri/target/release/<name>.exe（约 8–10 MB）
```

`tauri-run.cjs`（绕过内嵌 node argv0 问题）和 `build-exe.bat` 见 references/tauri.md「常见坑」。程序在运行时 exe 被占用无法覆盖，输出用版本号文件名（如 `App v2.exe`）。
