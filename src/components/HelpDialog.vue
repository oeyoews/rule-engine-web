<script setup lang="ts">
import {
  Package,
  Import,
  Globe,
  Target,
  RefreshCw,
  Lock,
  HelpCircle,
  Zap,
  Info
} from 'lucide-vue-next'
import SectionTitle from './common/SectionTitle.vue'

const visible = defineModel<boolean>()

// 帮助信息数据
const helpItems = [
  {
    icon: Package,
    title: '包名',
    description: '定义规则所属的Java包路径',
    example: 'com.example.rules',
    colors: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200 hover:border-blue-300',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    }
  },
  {
    icon: Import,
    title: '导入',
    description: '导入需要的Java类和依赖',
    example: 'import com.example.model.Person;',
    colors: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200 hover:border-purple-300',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100'
    }
  },
  {
    icon: Globe,
    title: '全局变量',
    description: '定义全局对象，可在所有规则中使用',
    example: 'global org.slf4j.Logger logger;',
    colors: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200 hover:border-green-300',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    }
  },
  {
    icon: Target,
    title: '优先级',
    description: '规则执行优先级，数值越大越先执行',
    example: 'salience 10',
    colors: {
      bg: 'from-orange-50 to-orange-100',
      border: 'border-orange-200 hover:border-orange-300',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    }
  },
  {
    icon: RefreshCw,
    title: '循环控制',
    description: '防止规则在同一次激活中循环执行',
    example: 'no-loop true',
    colors: {
      bg: 'from-cyan-50 to-cyan-100',
      border: 'border-cyan-200 hover:border-cyan-300',
      icon: 'text-cyan-600',
      iconBg: 'bg-cyan-100'
    }
  },
  {
    icon: Lock,
    title: '锁定状态',
    description: '锁定规则的激活状态，避免重复触发',
    example: 'lock-on-active true',
    colors: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-200 hover:border-red-300',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    }
  },
  {
    icon: HelpCircle,
    title: '条件 (when)',
    description: '定义规则触发的条件，使用LHS语法',
    example: '$p: Person(age >= 18)',
    colors: {
      bg: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200 hover:border-indigo-300',
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    }
  },
  {
    icon: Zap,
    title: '动作 (then)',
    description: '条件满足时执行的操作，使用Java代码',
    example: '$p.setAdult(true); update($p);',
    colors: {
      bg: 'from-rose-50 to-pink-100',
      border: 'border-rose-200 hover:border-pink-300',
      icon: 'text-rose-600',
      iconBg: 'bg-rose-100'
    }
  }
]
</script>

<template>
  <el-dialog
    v-model="visible"
    title="使用帮助"
    width="90%"
    :close-on-click-modal="true"
    class="max-w-7xl"
  >
    <div class="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2">
      <!-- 顶部说明 -->
      <div class="pb-3 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
            <Info :size="28" class="text-blue-600" />
          </div>
          <div>
            <SectionTitle class="mb-1 font-bold! text-gray-800!">DRL 规则编辑器使用指南</SectionTitle>
            <p class="text-xs text-gray-500">了解各个配置项的含义和用法</p>
          </div>
        </div>
      </div>

      <!-- 帮助项列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-3">
        <div
          v-for="(item, index) in helpItems"
          :key="index"
          :class="[
            'bg-linear-to-br rounded-lg p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border',
            item.colors.bg,
            item.colors.border
          ]"
        >
          <div class="flex items-center gap-2 mb-2">
            <div :class="['p-1.5 rounded-lg', item.colors.iconBg]">
              <component :is="item.icon" :size="18" :class="['shrink-0', item.colors.icon]" />
            </div>
            <h4 class="text-sm font-semibold text-slate-800 m-0">{{ item.title }}</h4>
          </div>
          <p class="text-xs text-slate-700 mb-2 leading-relaxed">{{ item.description }}</p>
          <div class="bg-white/80 backdrop-blur-sm border border-slate-200 rounded py-1.5 px-2 shadow-sm">
            <code class="font-mono text-[11px] text-emerald-600 break-all leading-tight">{{ item.example }}</code>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <!-- <div class="pt-3 border-t-2 border-gray-200 sticky bottom-0 bg-white">
        <div class="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <AlertTriangle :size="16" class="shrink-0 mt-0.5" />
          <div class="text-xs">
            <p class="font-semibold mb-0.5">温馨提示</p>
            <p>点击"加载示例"可以查看完整的示例规则配置</p>
          </div>
        </div>
      </div> -->
    </div>

  </el-dialog>
</template>
