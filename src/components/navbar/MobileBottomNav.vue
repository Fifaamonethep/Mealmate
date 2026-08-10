<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  User,
  Shield,
  Bell
} from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const unreadCount = computed(() => {
  return notificationsStore.notifications.filter(n => n.userId === authStore.currentUserId && !n.isRead).length
})
</script>

<template>
  <div
    v-if="authStore.currentUserId"
    class="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl px-2 py-2 shadow-2xl shadow-brand-950/20 transition-all duration-300"
  >
    <div :class="['grid gap-1 text-center items-center', authStore.isAdmin ? 'grid-cols-6' : 'grid-cols-5']">
      <!-- Dashboard -->
      <router-link
        to="/"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path === '/'
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold shadow-md shadow-brand-500/30 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <LayoutDashboard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.dashboard') }}</span>
      </router-link>

      <!-- Meals -->
      <router-link
        to="/meals"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path.startsWith('/meals')
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold shadow-md shadow-brand-500/30 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <Receipt class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.meals') }}</span>
      </router-link>

      <!-- Debts -->
      <router-link
        to="/debts"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path === '/debts'
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold shadow-md shadow-brand-500/30 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <CreditCard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.debts') }}</span>
      </router-link>

      <!-- Groups -->
      <router-link
        to="/groups"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path.startsWith('/groups')
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold shadow-md shadow-brand-500/30 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <Users class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.groups') }}</span>
      </router-link>

      <!-- Admin Portal (If Admin user) -->
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path === '/admin'
            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/40 scale-105'
            : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold'
        ]"
      >
        <Shield class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.admin') }}</span>
      </router-link>

      <!-- Profile -->
      <router-link
        to="/profile"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 relative',
          route.path === '/profile'
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold shadow-md shadow-brand-500/30 scale-105'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <User class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] tracking-tight truncate w-full">{{ t('nav.profile') }}</span>
        <span
          v-if="unreadCount > 0"
          class="absolute top-1 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping shadow-md shadow-rose-500/50"
        ></span>
      </router-link>
    </div>
  </div>
</template>
