import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { getCurrentWindow } from '@tauri-apps/api/window'

// 仅在 Tauri 环境渲染；浏览器预览时隐藏（浏览器有自己的标签栏）
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

// 图标悬停微动画：最小化横条下沉、最大化方框放大、关闭叉旋转
function IconMinimize({ hovered }: { hovered: boolean }) {
  return (
    <motion.svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden
      animate={hovered ? { y: 1.5, scaleX: 1.15 } : { y: 0, scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <rect x="0" y="4.5" width="10" height="1" />
    </motion.svg>
  )
}
function IconMaximize({ hovered }: { hovered: boolean }) {
  return (
    <motion.svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" aria-hidden
      animate={hovered ? { scale: 1.15, rotate: 3 } : { scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <rect x="0.5" y="0.5" width="9" height="9" />
    </motion.svg>
  )
}
function IconRestore({ hovered }: { hovered: boolean }) {
  return (
    <motion.svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" aria-hidden
      animate={hovered ? { scale: 1.12, x: -0.5, y: 0.5 } : { scale: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <rect x="0.5" y="2.5" width="7" height="7" />
      <path d="M2.5 2.5V0.5H9.5V7.5H7.5" />
    </motion.svg>
  )
}
function IconClose({ hovered }: { hovered: boolean }) {
  return (
    <motion.svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden
      animate={hovered ? { rotate: 90, scale: 1.15 } : { rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      <path d="M1 1l8 8M9 1l-8 8" />
    </motion.svg>
  )
}

type WinButtonProps = {
  title: string
  onClick: () => void
  close?: boolean
  children: (hovered: boolean) => React.ReactNode
}

function WinButton({ title, onClick, close, children }: WinButtonProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      title={title}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 600, damping: 20 }}
      className={`no-drag relative flex w-12 items-center justify-center text-neutral-500 dark:text-neutral-400 ${
        close ? 'hover:text-white' : 'hover:text-neutral-900 dark:hover:text-white'
      }`}
    >
      {/* 背景 spring 弹入（关闭为红，其余浅灰） */}
      <motion.span
        aria-hidden
        className={`absolute inset-0 ${close ? 'bg-red-500' : 'bg-black/10 dark:bg-white/10'}`}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <span className="relative">{children(hovered)}</span>
    </motion.button>
  )
}

export default function WindowControls() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!isTauri) return
    const win = getCurrentWindow()
    win.isMaximized().then(setMaximized).catch(() => {})
    const unlisten = win.onResized(() => {
      win.isMaximized().then(setMaximized).catch(() => {})
    })
    return () => {
      void unlisten.then((fn) => fn()).catch(() => {})
    }
  }, [])

  if (!isTauri) return null

  const win = getCurrentWindow()
  const act = (fn: () => Promise<void>) => () => void fn().catch(() => {})

  return (
    <div className="fixed top-0 right-0 z-50 flex h-12 items-stretch" data-tauri-drag-region>
      <WinButton title="最小化" onClick={act(() => win.minimize())}>
        {(h) => <IconMinimize hovered={h} />}
      </WinButton>
      <WinButton title={maximized ? '还原' : '最大化'} onClick={act(() => win.toggleMaximize())}>
        {(h) => (maximized ? <IconRestore hovered={h} /> : <IconMaximize hovered={h} />)}
      </WinButton>
      <WinButton title="关闭" onClick={act(() => win.close())} close>
        {(h) => <IconClose hovered={h} />}
      </WinButton>
    </div>
  )
}
