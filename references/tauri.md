# Tauri 2：把 Web 应用打包成 Windows 桌面应用

在已跑通的 Vite React 工程根目录执行，前端代码零改动。

## 环境前置（Windows）

1. **Rust**：`winget install Rustlang.Rustup`（或 https://rustup.rs），装完重开终端
2. **Visual Studio Build Tools**：`winget install Microsoft.VisualStudio.2022.BuildTools`，勾选「使用 C++ 的桌面开发」工作负载（WebView2 和 MSVC 链接器需要）
3. WebView2 Runtime：Windows 11 已内置；Windows 10 一般也已随 Edge 安装

## 初始化与运行

```bash
npm install -D @tauri-apps/cli@^2
npx tauri init          # 交互式回答：前端 dev 命令 npm run dev，构建命令 npm run build，输出目录 ../dist
npx tauri dev           # 开发模式：起 Vite + 开桌面窗口，改代码热更新
npx tauri build         # 产出安装包：src-tauri/target/release/bundle/
```

产物位置：
- **MSI 安装包**：`src-tauri/target/release/bundle/msi/*.msi`
- **NSIS 安装包**（更常见）：`src-tauri/target/release/bundle/nsis/*.exe`
- 免安装单 exe：`src-tauri/target/release/*.exe`（调试版，未签名）

## 原生能力（需要机密密钥时）

把敏感操作放进 Rust 侧，前端通过 `invoke` 调用：

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn get_api_key() -> String { std::env::var("API_KEY").unwrap_or_default() }
```

```ts
import { invoke } from '@tauri-apps/api/core'
const key = await invoke<string>('get_api_key')
```

窗口配置、单实例、托盘、自动更新（`@tauri-apps/plugin-updater`）都在 `src-tauri/tauri.conf.json`。

## 验证

- `npx tauri build` 成功且 MSI 能双击安装运行
- 安装后窗口功能与浏览器版一致（测一遍 quality-checklist.md）
- 打包体积应在 3–10 MB（远小于 Electron）；若超 30 MB 检查是否误打包了 node_modules 进资源

## 常见坑

- **Kimi Work 内嵌 node 的 argv0 是宿主程序**（如 Kimi.exe），`@tauri-apps/cli` 的 `tauri.js` 包装器会把它误当子命令而报 `unrecognized subcommand`。绕过：写一个小 .cjs 直接 `require('@tauri-apps/cli').run(args, 'npm run tauri')`，之后所有命令走这个入口。
- crates.io / GitHub 在本机网络下 SSL 频繁被重置：在 `src-tauri/.cargo/config.toml` 配 rsproxy 镜像（`sparse+https://rsproxy.cn/index/`）+ `retry = 5`，并用「检查产物目录是否出现」的循环重试，别依赖退出码（tauri CLI 失败时退出码不可靠）。
- WiX（MSI 打包器）需从 GitHub 下载，网络不通时会一直卡 `timeout: global` —— 此时改交付免安装 exe：`src-tauri/target/release/<name>.exe` 已是完整可用程序（本例 8.6 MB）。
- `identifier` 不要用 `xxx.app` 结尾（和 macOS bundle 扩展名冲突）。
- **无边框窗口（像 Kimi Work 那样自绘标题栏）**：完整配方（decorations 配置、权限、拖拽、自绘按钮、快速出 exe）见 [frameless-window.md](frameless-window.md)，可直接复用的组件模板在 `assets/frameless-window/`。
- **Tauri 2 权限系统（最常踩的坑）**：`core:default` 权限集**不含**任何窗口操作 API，自绘按钮和拖拽会全部静默失灵。必须在 `src-tauri/capabilities/default.json` 的 `permissions` 里显式追加：`core:window:allow-minimize`、`core:window:allow-toggle-maximize`、`core:window:allow-close`、`core:window:allow-is-maximized`、`core:window:allow-start-dragging`。症状就是「按钮点了没反应 + 拖不动窗口」。

- 构建报 linker 错误 → MSVC Build Tools 没装或没选 C++ 工作负载
- 首次 build 很慢（Rust 编译整个依赖树），属正常，别中断
- 路径含中文/空格偶发触发 Rust 工具链问题，工程目录尽量英文无空格
