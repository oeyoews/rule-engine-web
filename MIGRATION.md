# DRL 规则编辑器 - 重构说明

## 项目重构概述

本项目已从单HTML文件成功重构为标准的Vue 3项目。

### 重构内容

#### 1. 文件迁移
- **原文件**: `single-web/drl-editor.html` 和 `single-web/drl-editor.js`
- **新组件**: `src/components/DrlEditor.vue`

#### 2. 主要改进

##### 技术栈升级
- ✅ 使用 Vue 3 Composition API (`<script setup>`)
- ✅ TypeScript 支持（类型安全）
- ✅ 模块化组件结构
- ✅ Vite 构建工具（更快的开发体验）

##### 代码优化
- ✅ 使用 `ref` 替代 `data()`
- ✅ 使用 TypeScript 接口定义数据结构
- ✅ 导入具体的 Element Plus 组件和图标
- ✅ 使用 `lucide-vue-next` 替代 CDN 引入的图标库

#### 3. 项目结构

```
rule-engine-web/
├── src/
│   ├── components/
│   │   ├── DrlEditor.vue      # DRL编辑器主组件
│   │   └── RuleFlow.vue        # 规则流程组件（原有）
│   ├── styles/
│   │   └── tailwind.css        # Tailwind CSS配置
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 应用入口
├── single-web/                 # 原单HTML文件（保留作为参考）
│   ├── drl-editor.html
│   └── drl-editor.js
└── package.json
```

## 运行项目

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览构建结果
```bash
pnpm preview
```

## 功能特性

### 全局配置
- 包名（Package）配置
- Java类导入（Import）
- 全局变量（Global）定义
- 类型声明（Declare）

### 规则管理
- ✅ 添加/删除规则
- ✅ 规则启用/禁用
- ✅ 优先级设置（Salience）
- ✅ No-Loop 选项
- ✅ Lock-On-Active 选项
- ✅ When 条件配置
- ✅ Then 动作配置

### 代码操作
- ✅ 实时代码预览
- ✅ 下载 DRL 文件
- ✅ 复制代码到剪贴板
- ✅ 加载示例规则

## 技术栈

- **框架**: Vue 3.5+
- **构建工具**: Vite 7+
- **UI库**: Element Plus 2.11+
- **样式**: Tailwind CSS 4+
- **图标**: Lucide Vue Next
- **语言**: TypeScript 5.9+

## 依赖说明

### 核心依赖
- `vue` - Vue 3框架
- `element-plus` - Element Plus UI组件库
- `lucide-vue-next` - Lucide图标库（Vue 3版本）
- `tailwindcss` - Tailwind CSS框架
- `@vueuse/core` - Vue组合式工具库

### 开发依赖
- `vite` - 构建工具
- `typescript` - TypeScript支持
- `unplugin-auto-import` - 自动导入
- `unplugin-vue-components` - 组件自动注册

## 注意事项

1. **Element Plus**: 已在 `main.ts` 中全局注册，并配置了中文语言包
2. **Tailwind CSS**: 使用最新的 Tailwind CSS 4.x 语法
3. **TypeScript**: 所有组件都使用 TypeScript，提供类型安全
4. **自动导入**: Vue API 会自动导入，无需手动 import

## 下一步计划

- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 添加规则验证功能
- [ ] 支持规则导入功能
- [ ] 添加规则模板库
- [ ] 支持暗黑模式

## 原始文件

原始的单HTML文件已保留在 `single-web/` 目录下，可作为参考或备份使用。

