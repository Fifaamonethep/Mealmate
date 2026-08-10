<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import {
  UtensilsCrossed,
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  Bell,
  Shield,
  User,
  LogOut,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Check
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const mobileMenuOpen = ref(false)
const langMenuOpen = ref(false)
const isDark = ref(document.documentElement.classList.contains('dark'))

const languagesList = [
  { code: 'vi', label: 'Tiếng Việt', flagUrl: 'https://flagcdn.com/w40/vn.png' },
  { code: 'th', label: 'ภาษาไทย', flagUrl: 'https://flagcdn.com/w40/th.png' },
  { code: 'lo', label: 'ພາສາລາວ', flagUrl: 'https://flagcdn.com/w40/la.png' },
  { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' }
]

const currentLangObj = computed(() => {
  return languagesList.find(l => l.code === locale.value) || languagesList[0]
})

function selectLanguage(langKey) {
  locale.value = langKey
  localStorage.setItem('mealmate_locale', langKey)
  document.documentElement.setAttribute('lang', langKey)
  langMenuOpen.value = false
}

const unreadCount = computed(() => {
  return notificationsStore.notifications.filter(n => n.userId === authStore.currentUserId && !n.isRead).length
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    localStorage.setItem('mealmate_theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    localStorage.setItem('mealmate_theme', 'light')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <header class="glass-nav border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <UtensilsCrossed class="w-5 h-5 text-white" />
          </div>
          <div>
            <span class="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-white dark:via-slate-200 dark:to-indigo-300">
              MealMate
            </span>
            <span class="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/30 dark:bg-brand-500/20 dark:text-brand-300">
              Split & Pay
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <nav v-if="authStore.currentUserId" class="hidden md:flex items-center gap-1">
          <router-link
            to="/"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              route.path === '/'
                ? 'bg-brand-500/10 text-brand-600 border border-brand-500/30 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>{{ t('nav.dashboard') }}</span>
          </router-link>

          <router-link
            to="/meals"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              route.path.startsWith('/meals')
                ? 'bg-brand-500/10 text-brand-600 border border-brand-500/30 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Receipt class="w-4 h-4" />
            <span>{{ t('nav.meals') }}</span>
          </router-link>

          <router-link
            to="/debts"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              route.path === '/debts'
                ? 'bg-brand-500/10 text-brand-600 border border-brand-500/30 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <CreditCard class="w-4 h-4" />
            <span>{{ t('nav.debts') }}</span>
          </router-link>

          <router-link
            to="/groups"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              route.path.startsWith('/groups')
                ? 'bg-brand-500/10 text-brand-600 border border-brand-500/30 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Users class="w-4 h-4" />
            <span>{{ t('nav.groups') }}</span>
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              route.path === '/admin'
                ? 'bg-amber-500/15 text-amber-700 border border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Shield class="w-4 h-4 text-amber-500" />
            <span>{{ t('nav.admin') }}</span>
          </router-link>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2.5">
          
          <!-- Notifications Bell -->
          <router-link
            v-if="authStore.currentUserId"
            to="/notifications"
            class="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent"
            title="Notifications"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md shadow-rose-500/40"
            >
              {{ unreadCount }}
            </span>
          </router-link>

          <!-- Custom Language Selector Dropdown (VI, TH, LO, EN) -->
          <div class="relative">
            <button
              @click="langMenuOpen = !langMenuOpen"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
            >
              <img :src="currentLangObj.flagUrl" class="w-4 h-4 rounded-full object-cover shadow-sm shrink-0 border border-slate-300 dark:border-white/30" :alt="currentLangObj.code" />
              <span class="uppercase font-extrabold tracking-wide">{{ currentLangObj.code }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': langMenuOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="langMenuOpen"
              class="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-2xl p-1.5 z-50 animate-fadeIn space-y-1"
            >
              <button
                v-for="l in languagesList"
                :key="l.code"
                @click="selectLanguage(l.code)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  locale === l.code
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-600/30 dark:text-white dark:border-brand-500/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <img :src="l.flagUrl" class="w-4 h-4 rounded-full object-cover shadow-sm shrink-0 border border-slate-300 dark:border-white/20" :alt="l.label" />
                  <span>{{ l.label }}</span>
                </div>
                <Check v-if="locale === l.code" class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              </button>
            </div>
          </div>

          <!-- Admin Quick Access Badge (Visible on Mobile) -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
          >
            <Shield class="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span class="truncate max-w-[70px] sm:max-w-none">{{ t('nav.admin') }}</span>
          </router-link>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent"
            title="Toggle Light/Dark Theme"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-indigo-600" />
          </button>

          <!-- Logout / Login -->
          <div v-if="authStore.currentUserId" class="flex items-center gap-2 pl-2">
            <button
              @click="handleLogout"
              class="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
          <div v-else class="pl-2">
            <router-link
              to="/auth"
              class="glow-button text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <span>{{ t('auth.login') }}</span>
            </router-link>
          </div>

        </div>
      </div>
    </div>
  </header>
</template>
