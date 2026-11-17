# Capacitor：把 Web 应用打包成 Android 应用

在已跑通的 Vite React 工程根目录执行，前端代码零改动。

## 环境前置（Windows）

1. **Android Studio**：`winget install Google.AndroidStudio`，首次启动装 SDK（API 35 左右）+ 接受 licenses
2. 环境变量：`ANDROID_HOME` 指向 SDK 目录（默认 `%LOCALAPPDATA%\Android\Sdk`），`PATH` 加 `platform-tools`
3. JDK 17：Android Studio 自带 JBR，无需单独装

## 初始化

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "应用名" com.example.app --web-dir=dist
npm run build
npx cap add android
npx cap sync        # 每次前端重新 build 后都要 sync
```

## 开发与调试

```bash
npx cap open android                    # 打开 Android Studio
# Android Studio 里选模拟器或真机（USB 调试）→ Run ▶
# 前端热更新调试：
npx cap run android --livereload --external
```

Chrome 检查：`chrome://inspect` 可远程调试 WebView 里的页面（控制台、断点齐全）。

## 出包

- **Debug APK**（自测/分发内测）：Android Studio → Build → Build APK，或 `./gradlew assembleDebug`，产物 `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release AAB**（上架 Play）：`./gradlew bundleRelease`，先配 `android/app/build.gradle` 的签名（keystore 用 `keytool` 生成）

## 原生能力（需要机密密钥时）

写 Capacitor 插件或在 `android/app/src/main/java` 里加方法，前端通过 `Capacitor.Plugins` 桥接调用；不要写进前端代码。

## 验证

- debug APK 装到模拟器 + 一台真机各跑一遍核心流程
- `cap sync` 后再测（不同步会拿到旧前端包）
- 检查 AndroidManifest 权限与实际使用一致，不多申请

## 常见坑

- `npx cap add android` 报 SDK 找不到 → `ANDROID_HOME` 没设或没重开终端
-  livereload 连不上 → 电脑和手机不在同一网段，或防火墙挡了 Vite 端口
-  Web 端用了 Node 专属 API（`fs`、`path`）→ 打包后在手机上白屏， Capacitor 是 WebView 环境
- **Gradle 报 `Unsupported class file major version 69`** → 机器 JDK 太新（v69 = Java 25），而 Capacitor 模板自带 Gradle 8.x 最高只支持到 Java 17-24。解法：装 JDK 17/21（推荐清华 Adoptium 镜像 `https://mirrors.tuna.tsinghua.edu.cn/Adoptium/<version>/jdk/x64/windows/`，GitHub 直连会被重置），构建脚本里 `set JAVA_HOME=...` 指向它，不要依赖系统默认 JDK
- **`services.gradle.org` 下载 Gradle 被重置** → 改 `android/gradle/wrapper/gradle-wrapper.properties` 的 `distributionUrl` 为腾讯镜像：`https\://mirrors.cloud.tencent.com/gradle/gradle-<ver>-all.zip`，同时把 `networkTimeout` 调大到 60000
- **AGP/依赖从 dl.google.com / mavenCentral 下载失败** → 在 `android/build.gradle` 的 `buildscript` 和 `allprojects` 两个 `repositories` 块最前面加：`maven { url 'https://maven.aliyun.com/repository/google' }`、`maven { url 'https://maven.aliyun.com/repository/central' }`、`maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }`（注意放原仓库之前才生效优先）
- **沙箱里构建进程可能"假挂"**（Gradle client 已断开、bash 管道不退出）→ 判完成与否看产物目录 `android/app/build/outputs/apk/debug/app-debug.apk` 和日志文件，不要只看退出码；超时果断停掉任务重来，Gradle 缓存可复用，重试成本低
- JDK 下载解包后即可用（zip 解压，无需安装程序）；JDK 21 + AGP 8.13 + Gradle 8.14 组合已验证可出 debug APK
- 桌面端为错开自绘窗口按钮而下移的悬浮导航/灵动岛，**不要带进原生 App**：用 `Capacitor.isNativePlatform()` 判断，原生下导航贴顶，同时不渲染 Tauri 的 `data-tauri-drag-region` 拖拽层（会吞掉触摸事件）
