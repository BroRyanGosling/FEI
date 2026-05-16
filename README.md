# 电影影评记录应用

一个现代化的电影影评记录与展示应用，使用 React + TypeScript + Tailwind CSS 构建。

## 功能特性

- 📷 **图片上传** - 支持拖拽或点击上传电影票、剧照等照片
- ✍️ **文本编辑** - 输入电影名称和观影感受
- 👁️ **实时预览** - 左侧编辑，右侧即时预览效果
- 🎨 **深色主题** - 影院风格的深色界面设计

## 技术栈

- **React 18 + TypeScript
- **Vite** - 快速的开发构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Zustand** - 轻量级状态管理
- **Lucide React** - 精美的图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # React 组件
│   ├── EditorSection.tsx   # 编辑区组件
│   ├── PreviewSection.tsx # 预览区组件
│   └── ImageUploader.tsx  # 图片上传组件
├── hooks/         # 自定义 Hooks
│   └── useReviewStore.ts  # Zustand 状态管理
├── pages/         # 页面组件
│   └── Home.tsx            # 主页
├── App.tsx       # 根组件
├── main.tsx      # 应用入口
└── index.css     # 全局样式
```

## 使用说明

1. 在左侧编辑区上传图片
2. 输入电影名称和观影感受
3. 在右侧预览区查看实时预览效果
4. 享受记录你的观影体验！

