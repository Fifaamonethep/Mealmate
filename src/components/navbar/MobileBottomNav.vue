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
    class="md:hidden fixed bottom-2 left-2 right-2 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl px-1 py-1.5 shadow-2xl shadow-brand-950/20 transition-all duration-300"
  >
    <div class="grid grid-cols-4 gap-1 text-center items-center">
      <!-- Dashboard -->
      <router-link
        to="/"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-300 relative',
          route.path === '/'
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <LayoutDashboard class="w-4 h-4 mb-0.5" />
        <span class="text-[9.5px] leading-none tracking-tight truncate w-full">{{ t('nav.dashboard') }}</span>
      </router-link>

      <!-- Meals -->
      <router-link
        to="/meals"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-300 relative',
          route.path.startsWith('/meals')
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <Receipt class="w-4 h-4 mb-0.5" />
        <span class="text-[9.5px] leading-none tracking-tight truncate w-full">{{ t('nav.meals') }}</span>
      </router-link>

      <!-- Debts -->
      <router-link
        to="/debts"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-300 relative',
          route.path === '/debts'
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <CreditCard class="w-4 h-4 mb-0.5" />
        <span class="text-[9.5px] leading-none tracking-tight truncate w-full">{{ t('nav.debts') }}</span>
      </router-link>

      <!-- Groups -->
      <router-link
        to="/groups"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-300 relative',
          route.path.startsWith('/groups')
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
        ]"
      >
        <Users class="w-4 h-4 mb-0.5" />
        <span class="text-[9.5px] leading-none tracking-tight truncate w-full">{{ t('nav.groups') }}</span>
      </router-link>


    </div>
  </div>
</template>
