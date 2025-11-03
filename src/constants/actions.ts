/**
 * 动作类型常量配置
 */
import {
  Phone,
  RefreshCw,
  PlusCircle,
  Trash2,
  Edit,
  Zap
} from 'lucide-vue-next'

/**
 * 动作类型选项
 */
export const actionTypes = [
  { label: '调用方法', value: 'method', icon: Phone, color: 'text-blue-600' },
  { label: '更新对象 (update)', value: 'update', icon: RefreshCw, color: 'text-green-600' },
  { label: '插入对象 (insert)', value: 'insert', icon: PlusCircle, color: 'text-cyan-600' },
  { label: '删除对象 (retract)', value: 'retract', icon: Trash2, color: 'text-red-600' },
  { label: '修改对象 (modify)', value: 'modify', icon: Edit, color: 'text-orange-600' },
  { label: '调用函数', value: 'function', icon: Zap, color: 'text-purple-600' }
]

