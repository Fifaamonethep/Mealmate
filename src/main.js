import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './style.css'

// Set initial theme (dark by default)
const savedTheme = localStorage.getItem('mealmate_theme') || 'dark'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
  document.documentElement.classList.remove('light')
} else {
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
}

// Set initial html lang attribute for font styling
const savedLocale = localStorage.getItem('mealmate_locale') || 'lo'
document.documentElement.setAttribute('lang', savedLocale)

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('⚠️ Vue Global Error caught:', err, info)
}

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
