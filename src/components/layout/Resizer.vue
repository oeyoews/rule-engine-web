<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

interface Props {
  direction: 'horizontal' | 'vertical'
  minSize?: number
  maxSize?: number
  defaultSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  minSize: 100,
  maxSize: 800,
  defaultSize: 250
})

const emit = defineEmits<{
  resize: [size: number]
}>()

const isDragging = ref(false)
const size = ref(props.defaultSize)

// 监听 defaultSize 变化
watch(() => props.defaultSize, (newSize) => {
  size.value = newSize
}, { immediate: true })

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
  e.stopPropagation()
}

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  let newSize: number
  if (props.direction === 'vertical') {
    // 垂直调整：使用鼠标 X 坐标
    newSize = e.clientX
  } else {
    // 水平调整：使用鼠标 Y 坐标（从底部计算）
    newSize = window.innerHeight - e.clientY
  }

  newSize = Math.max(props.minSize, Math.min(props.maxSize, newSize))
  size.value = newSize
  emit('resize', newSize)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  stopDrag()
})

defineExpose({
  size
})
</script>

<template>
  <div
    :class="[
      'resizer',
      direction === 'vertical' ? 'resizer-vertical' : 'resizer-horizontal',
      isDragging ? 'resizing' : ''
    ]"
    @mousedown="startDrag"
  >
    <div class="resizer-handle" />
  </div>
</template>

<style scoped>
.resizer {
  position: relative;
  flex-shrink: 0;
  cursor: col-resize;
  z-index: 10;
}

.resizer-vertical {
  width: 0;
  cursor: col-resize;
}

.resizer-horizontal {
  height: 0;
  cursor: row-resize;
}

.resizer-handle {
  position: absolute;
  transition: background-color 0.15s ease;
}

.resizer-vertical .resizer-handle {
  width: 4px;
  height: 100%;
  left: -2px;
  top: 0;
  background-color: transparent;
}

.resizer-horizontal .resizer-handle {
  width: 100%;
  height: 4px;
  top: -2px;
  left: 0;
  background-color: transparent;
}

.resizer-vertical:hover .resizer-handle,
.resizer-vertical.resizing .resizer-handle {
  background-color: rgba(64, 126, 201, 0.5);
}

.resizer-horizontal:hover .resizer-handle,
.resizer-horizontal.resizing .resizer-handle {
  background-color: rgba(64, 126, 201, 0.5);
}
</style>

