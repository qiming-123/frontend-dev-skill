// 灵动岛式悬浮导航 + 顶部拖拽区 + 自绘窗口按钮（无边框窗口配套）
// 依赖：motion、@tauri-apps/api；Tauri 配置见 references/frameless-window.md
// 跨平台定位：仅 Tauri 桌面端下移避让窗口按钮；Web 预览与 Capacitor 原生端保持贴顶

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import WindowControls from './WindowControls'

const links = [
  { label: '产品', href: '#top' },
  { label: '特性', href: '#特性' },
  { label: '数据', href: '#数据' },
  { label: '联系', href: '#联系' },
]

// 下移避让仅针对桌面端（Tauri 自绘窗口按钮）；Web 预览与原生 App 都保持灵动岛贴顶
const isNative =
  typeof window !== 'undefined' && Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.())
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* 全宽滚动进度条 */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-sky-400 to-indigo-500"
        style={{ scaleX: progress }}
      />
      {/* 顶部整条可拖拽移动窗口（灵动岛外的空白区也是抓手）；原生 App 无窗口概念，不渲染以免挡住触摸 */}
      {!isNative && <div data-tauri-drag-region className="fixed inset-x-0 top-0 z-40 h-32" />}
      {/* 悬浮灵动岛导航：原生 App 贴顶，桌面端下移避让窗口按钮 */}
      <header className={`pointer-events-none fixed inset-x-0 z-50 px-4 ${isTauri ? 'top-10' : 'top-3'}`}>
        <nav
          className={`pointer-events-auto mx-auto flex h-12 max-w-4xl items-center justify-between rounded-2xl border px-5 backdrop-blur-xl transition-all duration-500 ${
            scrolled
              ? 'border-black/10 bg-white/75 shadow-lg shadow-black/10 dark:border-white/15 dark:bg-neutral-900/75 dark:shadow-black/40'
              : 'border-white/40 bg-white/40 shadow-sm dark:border-white/10 dark:bg-neutral-900/40'
          }`}
        >
          <a href="#top" className="text-sm font-semibold tracking-tight">
            Spring
          </a>
          <ul className="hidden items-center gap-8 text-sm text-neutral-600 sm:flex dark:text-neutral-300">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="transition-colors hover:text-neutral-900 dark:hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <motion.a
            href="#联系"
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            开始使用
          </motion.a>
        </nav>
      </header>
      {/* 自绘窗口按钮：右上角，与灵动岛同高 */}
      <WindowControls />
    </>
  )
}
