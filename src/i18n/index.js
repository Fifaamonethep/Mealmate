import { createI18n } from 'vue-i18n'
import vi from './vi.json'
import en from './en.json'
import th from './th.json'
import lo from './lo.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('mealmate_locale') || 'vi',
  fallbackLocale: 'en',
  messages: {
    vi,
    en,
    th,
    lo
  }
})

export default i18n
