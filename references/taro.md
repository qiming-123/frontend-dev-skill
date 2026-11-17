# Taro 4（React 模式）：微信小程序开发

小程序平台无 DOM、组件标签受限（view/text/image 而非 div/span），必须用专门工程；但 hooks、状态管理、业务逻辑与 Web 端 React 代码大部分可复用。

## 初始化

```bash
npm install -g @tarojs/cli@^4
taro init my-miniprogram   # 选择：React + TypeScript + Sass + npm，模板选「默认模板」
cd my-miniprogram && npm install
```

工程关键目录：

```
src/
├── app.config.ts      # 全局配置：页面注册、tabBar、窗口样式
├── app.tsx            # 入口
├── pages/             # 每个页面一个文件夹：index.tsx + index.config.ts
└── components/        # 跨页面复用组件
```

## 开发

```bash
npm run dev:weapp      # 编译并监听，产出 dist/
```

微信开发者工具 → 导入 `dist/` 目录（AppID 选测试号即可）→ 预览/真机调试。改代码自动重新编译，开发者工具内可打断点、看组件树。

## 与 Web React 的核心差异

| Web | 小程序 |
|---|---|
| `<div>` `<span>` | `<View>` `<Text>`（Taro 组件库导入） |
| `react-router` | `Taro.navigateTo({ url: '/pages/detail/index?id=1' })` |
| `window/localStorage` | `Taro.getStorageSync/setStorageSync` |
| `fetch` | `Taro.request` |
| CSS 动画/gesture | CSS 动画可用；复杂动效用 `Taro.createAnimation`（旧）或 CSS keyframes |
| Tailwind | 可用（@tailwindcss/小程序适配），但样式大小写和伪类支持有差异，简单样式推荐 Sass 或内联 style |

页面配置：每个页面文件夹里的 `index.config.ts` 控制导航栏标题、背景色；全局 tabBar 在 `app.config.ts`。

## 发布流程

1. `npm run build:weapp`（生产构建）
2. 微信开发者工具上传（需要真实 AppID，测试号不能上传）
3. 微信公众平台 mp.weixin.qq.com → 版本管理 → 提审 → 发布

## 验证

- 开发者工具模拟器 + 真机预览（扫码）各过一遍核心流程
- 检查包体积：主包 ≤ 2MB，超限用分包（`app.config.ts` 里 `subPackages`）
- iOS 与 Android 双端真机各测一遍（渲染差异真实存在）

## 常见坑

- **`taro init` 在无 TTY 的沙箱里必崩**（inquirer 报 ERR_USE_AFTER_CLOSE，CI 环境变量也救不了）→ 手工脚手架：按官方模板 package.json（可从 GitHub `NervJS/taro` 仓库 `packages/taro-cli/templates/default/package.json.tmpl` 获取）写 package.json + config/index.ts + src/app.config.ts/app.tsx + project.config.json，然后 `npm install --legacy-peer-deps`（peer 冲突必须用 legacy）。
- **版本必须和官方模板对齐**：Vite 编译器用 `vite@^4` + `@vitejs/plugin-react@^4`（vite 5 会报 `./internal` not exported）；依赖一个不能少——`@tarojs/react`、`@tarojs/vite-runner`、`@babel/core`、`babel-preset-taro`、`terser` 都是运行时按需 require 的，缺了才报错，最好一次性按模板装全。
- 微信小程序 production 包 300 KB 左右属正常（Taro 运行时占大头），无需优化。

- 循环列表必须用组件自带 key，且别用 index 当 key 后再动态增删
- `useEffect` 里直接操作 DOM 会报错——小程序没有 DOM
- 组件事件是 `onTap` 不是 `onClick`（Taro 已做映射，但自定义事件按小程序规范写）

## 自定义顶部导航（灵动岛/胶囊对齐）

- 小程序顶部有微信原生胶囊按钮，自定义悬浮导航**不要硬编码 top**，用 `Taro.getMenuButtonBoundingClientRect()` 取胶囊的 `top`/`height` 来定位，天然适配各机型状态栏高度
- 原生 App/桌面端需要下移避让系统窗口按钮，小程序不需要——下移是桌面无边框专属处理
- 微信小程序不支持 `backdrop-filter` 毛玻璃，半透明背景 + 滚动后加深即可
