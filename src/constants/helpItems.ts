/**
 * 帮助信息常量配置
 */
import {
  Package,
  Import,
  Globe,
  Target,
  RefreshCw,
  Lock,
  HelpCircle,
  Zap
} from 'lucide-vue-next'

/**
 * 帮助项数据
 */
export const helpItems = [
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

