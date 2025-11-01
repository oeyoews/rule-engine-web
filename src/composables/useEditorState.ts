/**
 * @deprecated 此文件已废弃，请使用 @/stores/editorStore 替代
 * 保留此文件仅为向后兼容，新代码请使用 useEditorStore
 */

// 重新导出 store，以保持向后兼容
export { useEditorStore as useEditorState, useEditorStore } from '@/stores/editorStore'

// 为了保持兼容性，提供一个 createEditorState 函数（实际上什么都不做）
export function createEditorState() {
  // 此函数已不再需要，状态由 Pinia store 管理
  // 保留仅为避免破坏现有代码
  console.warn('createEditorState 已废弃，状态由 Pinia store 管理，无需手动创建')
}
