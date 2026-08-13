<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import logoImg from '../../../ChatGPT Image Aug 12, 2026, 10_37_57 AM (1).png'
import {
  UtensilsCrossed,
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  UserCheck,
  Bell,
  Shield,
  User,
  LogOut,
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
  { code: 'lo', displayCode: 'LA', label: 'ພາສາລາວ', flagUrl: 'https://flagcdn.com/w40/la.png' },
  { code: 'th', displayCode: 'TH', label: 'ภาษาไทย', flagUrl: 'https://flagcdn.com/w40/th.png' },
  { code: 'en', displayCode: 'EN', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' }
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
  <header class="sticky top-0 z-40 backdrop-blur-2xl bg-white/80 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer group shrink-0" @click="router.push('/')">
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 rounded-2xl bg-indigo-500/30 dark:bg-purple-500/40 blur-md group-hover:blur-lg transition-all"></div>
            <img
              :src="logoImg"
              class="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-all duration-300 relative z-10 shrink-0"
              alt="MealMate Logo"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="font-black text-xl tracking-tight text-slate-900 dark:text-white">
              MealMate
            </span>
            <span class="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 shadow-sm whitespace-nowrap">
              Split & Pay
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Links (Horizontal Single-Line Pills - No Wrapping) -->
        <nav v-if="authStore.currentUserId" class="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
          <router-link
            to="/"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path === '/'
                ? 'brand-pill-active'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">{{ t('nav.dashboard') }}</span>
          </router-link>

          <router-link
            to="/meals"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path.startsWith('/meals')
                ? 'brand-pill-active'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <Receipt class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">{{ t('nav.meals') }}</span>
          </router-link>

          <router-link
            to="/debts"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path === '/debts'
                ? 'brand-pill-active'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <CreditCard class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">{{ t('nav.debts') }}</span>
          </router-link>

          <router-link
            to="/groups"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path.startsWith('/groups')
                ? 'brand-pill-active'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <Users class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">{{ t('nav.groups') }}</span>
          </router-link>

          <router-link
            to="/friends"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path === '/friends'
                ? 'brand-pill-active'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <UserCheck class="w-4 h-4 shrink-0" />
            <span class="whitespace-nowrap">{{ t('friends.title') }}</span>
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0',
              route.path === '/admin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-md shadow-amber-500/20 border border-amber-400/40'
                : 'text-amber-600/90 dark:text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300'
            ]"
          >
            <Shield class="w-4 h-4 shrink-0 text-amber-400" />
            <span class="whitespace-nowrap">{{ t('nav.admin') }}</span>
          </router-link>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          <!-- Notifications Bell -->
          <router-link
            v-if="authStore.currentUserId"
            to="/notifications"
            class="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent"
            title="Notifications"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-md shadow-rose-500/40"
            >
              {{ unreadCount }}
            </span>
          </router-link>

          <!-- Custom Language Selector Dropdown (LA, TH, EN) -->
          <div class="relative">
            <button
              @click="langMenuOpen = !langMenuOpen"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
            >
              <img :src="currentLangObj.flagUrl" class="w-4 h-4 rounded-full object-cover shadow-sm shrink-0 border border-slate-300 dark:border-white/30" :alt="currentLangObj.displayCode" />
              <span class="uppercase font-black tracking-wide text-[11px]">{{ currentLangObj.displayCode }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': langMenuOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="langMenuOpen"
              class="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-2xl p-1.5 z-50 animate-scale-in space-y-1"
            >
              <button
                v-for="l in languagesList"
                :key="l.code"
                @click="selectLanguage(l.code)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all',
                  locale === l.code
                    ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-600/30 dark:text-white border border-indigo-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <img :src="l.flagUrl" class="w-4 h-4 rounded-full object-cover shadow-sm shrink-0 border border-slate-300 dark:border-white/20" :alt="l.label" />
                  <span>{{ l.label }}</span>
                </div>
                <Check v-if="locale === l.code" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent"
            title="Toggle Light/Dark Theme"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-indigo-500" />
          </button>

          <!-- Profile Badge & Logout (Desktop Only) -->
          <div v-if="authStore.currentUserId" class="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <router-link
              to="/profile"
              :class="[
                'flex items-center gap-2 p-1 pr-3 rounded-full transition-all border group shrink-0 shadow-sm',
                route.path === '/profile'
                  ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/40 dark:bg-indigo-600/20 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
              ]"
              :title="t('nav.profile')"
            >
              <div class="relative w-7 h-7 shrink-0">
                <img
                  :src="authStore.currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.currentUser?.username || 'user'}`"
                  class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-white dark:border-slate-700 shrink-0"
                  :alt="authStore.currentUser?.name"
                />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-[110px] truncate whitespace-nowrap">
                {{ authStore.currentUser?.name }}
              </span>
            </router-link>

            <button
              @click="handleLogout"
              class="p-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shrink-0"
              title="Logout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            v-if="authStore.currentUserId"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shrink-0"
          >
            <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>

        </div>
      </div>
    </div>

    <!-- Mobile Floating Drawer Overlay (No Page Push) -->
    <Teleport to="body">
      <div v-if="mobileMenuOpen && authStore.currentUserId" class="md:hidden">
        <!-- Backdrop Overlay -->
        <div 
          @click="mobileMenuOpen = false"
          class="fixed inset-0 top-16 bg-slate-950/40 backdrop-blur-sm z-40 animate-fadeIn"
        ></div>

        <!-- Floating Glass Menu -->
        <div class="fixed top-16 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-5 py-4 space-y-1 shadow-2xl rounded-b-3xl max-h-[85vh] overflow-y-auto animate-slideDown">
          <router-link
            to="/"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path === '/'
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <LayoutDashboard class="w-4.5 h-4.5" />
            <span>{{ t('nav.dashboard') }}</span>
          </router-link>

          <router-link
            to="/meals"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path.startsWith('/meals')
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <Receipt class="w-4.5 h-4.5" />
            <span>{{ t('nav.meals') }}</span>
          </router-link>

          <router-link
            to="/debts"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path === '/debts'
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <CreditCard class="w-4.5 h-4.5" />
            <span>{{ t('nav.debts') }}</span>
          </router-link>

          <router-link
            to="/groups"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path.startsWith('/groups')
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <Users class="w-4.5 h-4.5" />
            <span>{{ t('nav.groups') }}</span>
          </router-link>

          <router-link
            to="/friends"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path === '/friends'
                ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            <UserCheck class="w-4.5 h-4.5" />
            <span>{{ t('friends.title') }}</span>
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all',
              route.path === '/admin'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
            ]"
          >
            <Shield class="w-4.5 h-4.5 text-amber-500" />
            <span>{{ t('nav.admin') }}</span>
          </router-link>

          <!-- Profile & Logout inside Mobile Menu Drawer -->
          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <router-link
              to="/profile"
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <img
                :src="authStore.currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.currentUser?.username || 'user'}`"
                class="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
              <span class="truncate">{{ authStore.currentUser?.name }} (@{{ authStore.currentUser?.username }})</span>
            </router-link>

            <button
              @click="handleLogout(); mobileMenuOpen = false;"
              class="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
            >
              <LogOut class="w-4.5 h-4.5" />
              <span>{{ t('nav.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>
