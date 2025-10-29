# 变更日志

本文档记录了项目的所有重要变更。

## [1.0.0] - 2025-10-29

### ✨ 新增功能

- 🎉 将单 HTML 文件重构为标准 Vue 3 项目
- 📦 创建 `DrlEditor.vue` 组件，使用 Composition API
- 🎨 集成 Element Plus 和 Tailwind CSS
- 🔧 添加 TypeScript 支持，提供完整的类型定义
- 📝 添加完整的项目文档（README、QUICK_START、MIGRATION）
- 🚀 使用 Vite 构建工具提升开发体验

### 🔄 改进

- ✅ 使用 `<script setup>` 语法简化组件代码
- ✅ 使用 `lucide-vue-next` 替代 CDN 图标库
- ✅ 添加接口定义 (`Config`, `Rule`) 提升代码可维护性
- ✅ 优化代码结构，提高可读性
- ✅ 使用 Tailwind CSS 4.x 最新语法

### 📚 文档

- 📖 创建详细的 README.md
- 📖 添加快速开始指南（QUICK_START.md）
- 📖 添加重构说明文档（MIGRATION.md）
- 📖 添加变更日志（CHANGELOG.md）

### 🔧 技术栈

- Vue 3.5.22
- TypeScript 5.9.3
- Vite 7.1.7
- Element Plus 2.11.5
- Tailwind CSS 4.1.12
- Lucide Vue Next 0.548.0

### 📦 文件结构

```
新增文件：
- src/components/DrlEditor.vue  # 主编辑器组件
- docs/QUICK_START.md           # 快速开始指南
- MIGRATION.md                  # 重构说明
- CHANGELOG.md                  # 变更日志

保留文件：
- single-web/drl-editor.html    # 原始 HTML 文件（参考）
- single-web/drl-editor.js      # 原始 JS 文件（参考）

修改文件：
- src/App.vue                   # 更新为使用 DrlEditor 组件
- index.html                    # 更新标题和语言
- README.md                     # 完全重写项目说明
```

### 🐛 修复

- 修复 Tailwind CSS 警告（使用新语法）
  - `bg-gradient-to-br` → `bg-linear-to-br`
  - `bg-gradient-to-r` → `bg-linear-to-r`
  - `flex-shrink-0` → `shrink-0`

### 🔒 安全性

- ✅ 所有依赖使用最新稳定版本
- ✅ TypeScript 严格模式开启

## [0.1.0] - 初始版本

### 特性

- 单 HTML 文件实现的 DRL 规则编辑器
- 基本的规则创建、编辑功能
- DRL 代码生成和预览
- 文件下载和代码复制功能

---

## 版本说明

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

版本格式：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

