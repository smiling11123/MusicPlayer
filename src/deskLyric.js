import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import deskLyric from './deskLyric.vue'
import router from './router'
import naive from 'naive-ui'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(deskLyric)
app.config.globalProperties.$host = 'http://localhost:3000'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(naive)
app.mount('#deskLyric')
