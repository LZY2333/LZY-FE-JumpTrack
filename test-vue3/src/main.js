import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setAppContext } from '@/utils/imperativeDialog'

const app = createApp(App)

app.use(router)

setAppContext(app._context)
app.mount('#app')
