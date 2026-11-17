# 动画与交互动效指南

## 选择动画技术

| 场景 | 技术 |
|---|---|
| 简单悬停/开关状态 | CSS `transition` |
| 关键帧循环效果 | CSS `@keyframes` |
| 滚动驱动、复杂编排、手势跟随 | `motion`（Framer Motion）`useScroll`/`useTransform`/`useSpring` |
| 数字/路径插值 | CSS `@property` + transition，或 motion 的 `animate` |
| Canvas 粒子/大规模图形 | Canvas 2D / WebGL，避免大量 DOM 节点动画 |

原则：能用 CSS 就不用 JS；JS 动画必须 60fps 且只动 `transform` 和 `opacity`。

## 弹簧参数速查（Apple "Designing Fluid Interfaces" 风格）

damping（阻尼）与 response/stiffness（响应）两维调节：

| 交互 | damping | 感受 |
|---|---|---|
| 导航切换、标签切换 | 1.0（无回弹） | 干脆、商务 |
| 抽屉/面板弹出 | 0.8–0.85 | 轻微回弹、有生气 |
| 手势投掷 | 0.7–0.8 | 活泼、跟随动量 |
| 点赞/徽章弹跳 | 0.5–0.6 | Q 弹、俏皮 |

motion（Framer Motion）示例：

```tsx
import { motion } from 'motion/react'

<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
/>
```

CSS 弹簧回退（无库依赖）：

```css
.animated { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
```

## 性能规则

- 只动画 `transform` / `opacity`，避免触发布局（width/height/top/left）和绘制（box-shadow 动画）。
- 动画元素多时加 `will-change: transform`，结束后移除。
- 列表进场用 stagger（`transition={{ delay: i * 0.05 }}`），避免同时进场抖动。
- 用 `prefers-reduced-motion` 尊重系统减弱动效设置：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- 滚动触发动画用 IntersectionObserver（或 motion 的 `whileInView`），勿用 scroll 事件高频触发 setState。

## 桌面窗口按钮微动画（无边框窗口）

经实战调优的参数组合，完整组件见 `assets/frameless-window/WindowControls.tsx`：

- **背景弹入**：hover 背景色块从 scale 0.6 弹到 1（spring 500/28），关闭按钮红色、其余浅灰——比 CSS 过渡更有「浮出」感
- **图标微动效**：最小化横条下沉 + 拉长（y:1.5, scaleX:1.15）；最大化方框放大 + 转 3°；关闭叉旋转 90° + 放大
- **按压**：whileTap scale 0.88（spring 600/20），松手回弹
- 图标动效用 `animate={hovered ? ... : ...}` 受控切换，比 CSS hover 动画更容易调参
