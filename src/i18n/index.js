import { createI18n } from 'vue-i18n'
import en from './en.json'
import th from './th.json'
import lo from './lo.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('mealmate_locale') || 'lo',
  fallbackLocale: 'lo',
  messages: {
    lo,
    th,
    en
  }
})

export default i18n
