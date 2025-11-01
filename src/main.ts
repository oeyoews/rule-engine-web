import { createApp } from 'vue'
import '@/styles/tailwind.css';
import App from '@/App.vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
