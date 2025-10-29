# DRL 规则引擎编辑器

[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.11-409EFF.svg)](https://element-plus.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38B2AC.svg)](https://tailwindcss.com/)

一个现代化的可视化 DRL (Drools Rule Language) 规则编辑器，基于 Vue 3 + TypeScript 构建。

## ✨ 特性

- 🎨 **现代化 UI** - 使用 Element Plus 和 Tailwind CSS 打造的美观界面
- 📝 **可视化编辑** - 通过表单配置生成标准的 DRL 规则文件
- 🔄 **实时预览** - 编辑即时生成 DRL 代码预览
- 💾 **多种导出** - 支持下载文件和复制到剪贴板
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🚀 **开发体验** - 基于 Vite 的极速开发和构建
- 📦 **组件化** - 模块化设计，易于扩展和维护

## 🖼️ 功能预览

### 主要功能

- **全局配置管理**
  - 包名（Package）配置
  - Java 类导入（Import）
  - 全局变量（Global）定义
  - 类型声明（Declare）

- **规则编辑**
  - 规则创建、编辑、删除
  - 规则启用/禁用
  - 优先级设置（Salience）
  - No-Loop 和 Lock-On-Active 选项
  - When 条件配置
  - Then 动作配置

- **代码操作**
  - 实时 DRL 代码预览
  - 下载 DRL 文件
  - 复制代码到剪贴板
  - 加载示例规则

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+ (推荐) 或 npm/yarn

### 安装

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd rule-engine-web

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 项目将在 http://localhost:5173 运行
```

### 构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📚 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript 5.9+
- **构建工具**: Vite 7+
- **UI 组件库**: Element Plus 2.11+
- **CSS 框架**: Tailwind CSS 4.1+
- **图标库**: Lucide Vue Next
- **工具库**: VueUse

## 📁 项目结构

```
rule-engine-web/
├── docs/                    # 文档目录
│   └── QUICK_START.md      # 快速开始指南
├── src/
│   ├── components/          # Vue 组件
│   │   ├── DrlEditor.vue   # DRL 编辑器主组件
│   │   └── RuleFlow.vue    # 规则流程组件
│   ├── styles/              # 样式文件
│   │   └── tailwind.css    # Tailwind CSS 配置
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── single-web/             # 原单 HTML 文件（参考）
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目配置
└── README.md              # 项目说明
```

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件位于 `vite.config.ts`：

- 自动导入 Vue API
- 自动注册 Element Plus 组件
- 路径别名配置 (`@` -> `src`)
- Tailwind CSS 集成

### TypeScript 配置

- 严格模式开启
- 完整的类型检查
- 自动类型声明生成

## 📖 使用文档

详细使用说明请查看：
- [快速开始指南](docs/QUICK_START.md)
- [重构说明](MIGRATION.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 License

本项目采用 MIT 协议开源。

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drools](https://www.drools.org/)
