import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './style.css'

// Set initial html lang attribute for font styling
const savedLocale = localStorage.getItem('mealmate_locale') || 'vi'
document.documentElement.setAttribute('lang', savedLocale)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
