import { createApp } from 'vue'
import { createPinia } from 'pinia'

import persist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
import 'animate.css'

const app = createApp(App)

app.use(createPinia().use(persist))
app.use(router)

app.mount('#app')
