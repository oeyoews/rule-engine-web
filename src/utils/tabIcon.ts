import {
  Settings,
  ClipboardList,
  Code2,
  Eye,
  FolderTree,
  Search,
  HelpCircle,
  Terminal,
  AlertCircle,
  FileText
} from 'lucide-vue-next'
import type { Component } from 'vue'

// 统一的图标映射（相同图标使用同一个键名）
const iconMap: Record<string, Component> = {
  // 通用图标
  config: Settings,
  rule: ClipboardList,
  rules: ClipboardList,
  advanced: Code2,
  preview: Eye,
  explorer: FolderTree,
  search: Search,
  help: HelpCircle,
  problems: AlertCircle,
  output: FileText,
  terminal: Terminal
}

/**
 * 获取图标组件
 * @param key 图标键名（如 'config', 'search', 'preview', 'rule', 'rules' 等）
 * @returns 图标组件或 null
 */
export function getIcon(key: string): Component | null {
  return iconMap[key] || null
}

