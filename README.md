# 🎯 DRL 规则引擎可视化编辑器

[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.11-409EFF.svg)](https://element-plus.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Lucide](https://img.shields.io/badge/Lucide-Icons-orange.svg)](https://lucide.dev/)

> 一个功能强大的可视化 DRL (Drools Rule Language) 规则编辑器，让规则配置变得简单直观。

基于 **Vue 3 + TypeScript + Element Plus + Tailwind CSS** 构建，提供完整的可视化和代码编辑双模式。

## ✨ 核心特性

### 🎨 现代化界面
- **精美 UI 设计** - 基于 Element Plus 和 Tailwind CSS 的现代化界面
- **Lucide 图标** - 使用语义化图标系统，界面更直观
- **响应式布局** - 完美适配各种屏幕尺寸
- **主题优化** - 蓝绿配色方案，视觉清晰舒适

### 📝 双模式编辑
- **可视化模式** - 通过表单和构建器配置规则，无需编写代码
- **代码模式** - 直接编辑 DRL 代码，支持语法高亮
- **一键切换** - 模式间无缝切换，数据自动同步
- **实时预览** - 编辑即时生成/解析 DRL 代码

### 🔧 可视化构建器
- **条件构建器 (When)**
  - 表单化配置条件
  - 支持多条件组合（AND/OR）
  - 拖拽调整条件顺序
  - 折叠展开管理

- **动作构建器 (Then)**
  - 可视化配置动作
  - 支持方法调用、对象操作
  - 拖拽调整执行顺序
  - 自动提取 when 中的变量

### 🚀 智能功能
- **自动导入检测** - 智能识别缺失的类导入
- **类型推导** - 根据 Java 类自动推导字段和方法
- **代码生成** - 自动生成标准 DRL 代码
- **代码解析** - 支持导入现有 DRL 文件并解析为可视化

### 💾 便捷操作
- **拖拽排序** - 规则、条件、动作均支持拖拽调整顺序
- **多种导出** - 下载 DRL 文件或复制到剪贴板
- **示例加载** - 内置示例规则，快速上手
- **批量管理** - 支持多规则管理和批量操作

### 🎯 完整配置
- **全局配置** - Package、Import、Global、Declare
- **规则属性** - 名称、优先级、启用状态
- **规则选项** - No-Loop、Lock-On-Active 等高级选项
- **代码统计** - 实时统计规则数量和代码行数

## 🖼️ 功能模块

### 1️⃣ 全局配置管理
- **Package** - 定义规则包名
  - 智能推荐常用包名
  - 图标化标识

- **Import** - Java 类导入
  - 自动检测缺失导入
  - 智能推荐导入项
  - 批量导入管理

- **Global** - 全局变量定义
  - 支持多种数据类型
  - 可视化变量列表

- **Declare** - 类型声明（计划中）

### 2️⃣ 规则管理
- **规则列表**
  - 拖拽调整规则顺序
  - 折叠/展开规则详情
  - 一键删除规则
  - 规则状态标签（启用/优先级/循环控制）

- **规则属性**
  - 🏷️ 规则名称配置
  - ⚙️ 规则配置选项
    - 启用/禁用规则
    - 防止循环（No-Loop）
    - 锁定激活（Lock-On-Active）
  - 🎯 优先级设置（0-999）
  - 🔄 编辑模式切换（可视化/代码）

### 3️⃣ 条件构建器 (When)
- **表单化配置**
  - ① 逻辑操作符（AND/OR）
  - ② 变量名定义
  - ③ 类选择（自动加载）
  - ④ 字段选择（类型感知）
  - ⑤ 操作符选择（==, !=, >, <, contains...）
  - ⑥ 值输入

- **高级功能**
  - 拖拽调整条件顺序
  - 折叠/展开条件详情
  - 多条件组合（AND/OR）
  - 实时代码预览
  - 图标化字段标识

### 4️⃣ 动作构建器 (Then)
- **动作类型**
  - 📞 调用方法 - 调用对象方法
  - 🔄 更新对象（update）
  - ➕ 插入对象（insert）
  - 🗑️ 删除对象（retract）
  - ✏️ 修改对象（modify）
  - ⚡ 调用函数 - 调用工具类方法

- **智能辅助**
  - 自动提取 when 中定义的变量
  - 自动加载类的方法列表
  - 参数类型提示
  - 拖拽调整动作顺序
  - 折叠/展开动作详情

### 5️⃣ 代码操作
- **代码预览**
  - 实时生成 DRL 代码
  - 语法高亮显示
  - 代码统计信息

- **导出功能**
  - 📥 下载 DRL 文件
  - 📋 复制到剪贴板
  - 👁️ 预览对话框

- **导入功能**
  - 📤 上传 DRL 文件
  - 🔍 自动解析规则
  - 💡 加载示例规则

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

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 🏗️ **框架** | Vue 3 | 3.5+ | Composition API + `<script setup>` |
| 📘 **语言** | TypeScript | 5.9+ | 完整类型支持 |
| ⚡ **构建工具** | Vite | 7+ | 极速开发体验 |
| 🎨 **UI 组件库** | Element Plus | 2.11+ | 企业级组件库 |
| 💅 **CSS 框架** | Tailwind CSS | 4.1+ | 原子化 CSS |
| 🎭 **图标库** | Lucide Vue Next | - | 现代化图标系统 |
| 🔧 **工具库** | VueUse | - | Vue Composition 工具集 |
| 🎯 **拖拽库** | vue-draggable-plus | - | 拖拽排序功能 |
| 🔑 **UUID** | uuid | - | 唯一标识生成 |

## 📁 项目结构

```
rule-engine-web/
├── docs/                           # 📚 文档目录
│   ├── QUICK_START.md             # 快速开始指南
│   └── MIGRATION.md               # 重构迁移说明
├── src/
│   ├── components/                 # 🧩 Vue 组件
│   │   ├── DrlEditor.vue          # 主编辑器组件
│   │   ├── RuleConditionBuilder.vue  # 条件构建器
│   │   ├── RuleActionBuilder.vue     # 动作构建器
│   │   ├── HelpDialog.vue         # 帮助对话框
│   │   ├── PreviewDialog.vue      # 预览对话框
│   │   └── CodeStatistics.vue     # 代码统计
│   ├── constants/                  # 📦 常量配置
│   │   ├── drlOptions.ts          # DRL 选项配置
│   │   └── sampleData.ts          # 示例数据
│   ├── utils/                      # 🛠️ 工具函数
│   │   ├── drl.ts                 # DRL 代码生成
│   │   ├── drlParser.ts           # DRL 代码解析
│   │   ├── classImport.ts         # 类导入工具
│   │   └── importDetector.ts      # 导入检测
│   ├── styles/                     # 💅 样式文件
│   │   └── tailwind.css           # Tailwind CSS 配置
│   ├── App.vue                    # 根组件
│   └── main.ts                    # 应用入口
├── public/                         # 🌍 公共资源
│   └── classes.json               # Java 类定义
├── single-web/                     # 📄 原单 HTML 文件（参考）
├── types.d.ts                      # 📘 TypeScript 类型声明
├── index.html                      # HTML 模板
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                   # TypeScript 配置
├── tailwind.config.js              # Tailwind 配置
├── package.json                    # 项目配置
└── README.md                       # 项目说明
```

## 🔧 配置说明

### Vite 配置 (`vite.config.ts`)

```typescript
{
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

### TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

### Tailwind 配置 (`tailwind.config.js`)

```javascript
{
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  }
}
```

## 📖 使用指南

### 基础使用

1. **创建规则**
   - 点击"添加规则"按钮
   - 配置规则名称和属性
   - 选择可视化或代码模式

2. **配置条件 (When)**
   - 在可视化模式下点击"添加条件"
   - 依次选择类、字段、操作符
   - 输入比较值
   - 可添加多个条件并设置逻辑关系

3. **配置动作 (Then)**
   - 点击"添加动作"
   - 选择动作类型
   - 选择对象/方法
   - 填写参数

4. **导出规则**
   - 点击"下载 DRL"下载文件
   - 或使用"复制代码"复制到剪贴板

### 高级功能

- **拖拽排序** - 拖动手柄图标调整顺序
- **折叠管理** - 点击标题展开/折叠详情
- **自动导入** - 开启后自动添加缺失的类导入
- **代码模式** - 关闭可视化模式直接编辑代码

### 更多文档

- 📘 [快速开始指南](docs/QUICK_START.md)
- 🔄 [重构迁移说明](docs/MIGRATION.md)

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

## 🎯 开发计划

- [ ] 支持更多 DRL 语法特性
- [ ] 规则测试和调试功能
- [ ] 规则版本管理
- [ ] 团队协作功能
- [ ] 规则模板库
- [ ] 性能优化和大规模规则支持

## 🐛 问题反馈

如遇到问题或有功能建议，欢迎：
- 提交 [Issue](../../issues)
- 发起 [Pull Request](../../pulls)
- 联系项目维护者

## 🙏 致谢

本项目基于以下优秀的开源项目构建：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 精美的开源图标库
- [Drools](https://www.drools.org/) - 业务规则管理系统

感谢所有贡献者的辛勤付出！💪

---

⭐ 如果这个项目对你有帮助，欢迎给个 Star！
