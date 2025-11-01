import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // 布局状态
  const activeView = ref<string>('rules') // 当前活动的侧边栏视图
  const sidebarWidth = ref<number>(250) // 侧边栏宽度
  const panelHeight = ref<number>(0) // 底部面板高度（0表示隐藏）
  const activePanel = ref<string>('') // 当前活动的底部面板

  // EditorGroup 引用（用于组件间通信）
  const editorGroupRef = ref<any>(null)

  // 从 localStorage 加载面板大小
  const loadPanelSizes = () => {
    const savedSidebarWidth = localStorage.getItem('vscode-sidebar-width')
    if (savedSidebarWidth) {
      sidebarWidth.value = parseInt(savedSidebarWidth, 10)
    }
    const savedPanelHeight = localStorage.getItem('vscode-panel-height')
    if (savedPanelHeight) {
      panelHeight.value = parseInt(savedPanelHeight, 10)
    }
  }

  // 保存面板大小到 localStorage
  const saveSidebarWidth = (width: number) => {
    sidebarWidth.value = width
    localStorage.setItem('vscode-sidebar-width', width.toString())
  }

  const savePanelHeight = (height: number) => {
    panelHeight.value = height
    if (height > 0) {
      localStorage.setItem('vscode-panel-height', height.toString())
    }
  }

  // 切换侧边栏视图
  const setActiveView = (view: string) => {
    activeView.value = view
  }

  // 切换底部面板
  const togglePanel = (panel: string) => {
    if (activePanel.value === panel && panelHeight.value > 0) {
      panelHeight.value = 0
      activePanel.value = ''
    } else {
      activePanel.value = panel
      panelHeight.value = panelHeight.value || 200
    }
  }

  // 初始化时加载保存的大小
  loadPanelSizes()

  return {
    // 状态
    activeView,
    sidebarWidth,
    panelHeight,
    activePanel,
    editorGroupRef,
    // 方法
    setActiveView,
    togglePanel,
    saveSidebarWidth,
    savePanelHeight,
    loadPanelSizes
  }
})

