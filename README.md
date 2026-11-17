# frontend-dev — 跨平台前端开发 Skill

一套 **React/TypeScript** 代码交付四个平台：**Web、Windows 桌面（Tauri 2）、Android（Capacitor）、微信小程序（Taro 4）**。

所有平台路径均经过实战验证（含构建踩坑记录），可直接给 AI agent（Kimi Work / Claude Code / Codex 等支持 SKILL.md 的宿主）使用，也可作为人类开发者速查手册。

## 平台路由

| 目标 | 技术路径 | 参考文件 |
|---|---|---|
| Web 应用 / 落地页 | Vite + React + TS + Tailwind | [SKILL.md](SKILL.md) + [references/quality-checklist.md](references/quality-checklist.md) |
| Windows 桌面应用 | 同上 + Tauri 2 套壳 | [references/tauri.md](references/tauri.md) |
| Android 应用 | 同上 + Capacitor 套壳 | [references/capacitor.md](references/capacitor.md) |
| 微信小程序 | Taro 4（React 模式）独立工程 | [references/taro.md](references/taro.md) |

Tauri 与 Capacitor 复用同一套前端代码；Taro 因小程序平台限制需另起工程，但组件逻辑/hooks 可大部分复用。

## 目录结构

```
frontend-dev/
├── SKILL.md                    # 平台路由 + 通用工作流 + 关键规则
├── scripts/scaffold.py         # React+Vite+TS+Tailwind 脚手架
├── assets/
│   ├── react-vite-template/    # 完整可跑的模板（Tailwind v4、暗色模式）
│   └── frameless-window/       # 灵动岛导航 + 自绘窗口按钮组件（Kimi Work 风格无边框窗口）
└── references/                 # 六份实战参考：tauri / frameless-window / capacitor / taro / animation / quality-checklist
```

## 安装

**Kimi Work**：将整个 `frontend-dev/` 文件夹复制到 skills 目录，或在客户端中导入 `.skill` 包。

**其他 AI agent**：把 `SKILL.md` 作为 skill 入口，保持目录结构不变即可。

**人类使用**：直接读 `references/` 下对应平台的文件，每份都是独立完整的操作手册。

## 亮点（实战踩坑沉淀）

- Tauri 内嵌 node argv0 误判的 `.cjs` 绕过方案
- Tauri 2 窗口权限 `core:window:allow-*` 静默失灵问题
- Capacitor 构建：JDK 25 与 Gradle 8.x 不兼容的完整解法、国内镜像三件套
- Taro：`taro init` 无 TTY 崩溃的手工脚手架方案、版本对齐清单
- 无边框窗口灵动岛导航的跨平台定位规则（Windows 下移 / Web+Android 贴顶 / 小程序对齐胶囊）

## 许可

MIT
