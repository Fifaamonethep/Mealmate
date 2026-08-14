<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  UserCheck
} from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
</script>

<template>
  <div
    v-if="authStore.currentUserId"
    class="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-1.5 shadow-2xl shadow-indigo-950/20 transition-all duration-300"
  >
    <div class="grid grid-cols-5 gap-1 text-center items-center">
      <!-- Dashboard -->
      <router-link
        to="/"
        :class="[
          'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative',
          route.path === '/'
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
        ]"
      >
        <LayoutDashboard class="w-4 h-4 mb-1" />
        <span class="text-[10px] leading-none tracking-tight truncate w-full font-bold">{{ t('nav.dashboard') }}</span>
      </router-link>

      <!-- Meals -->
      <router-link
        to="/meals"
        :class="[
          'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative',
          route.path.startsWith('/meals')
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
        ]"
      >
        <Receipt class="w-4 h-4 mb-1" />
        <span class="text-[10px] leading-none tracking-tight truncate w-full font-bold">{{ t('nav.meals') }}</span>
      </router-link>

      <!-- Debts -->
      <router-link
        to="/debts"
        :class="[
          'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative',
          route.path === '/debts'
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
        ]"
      >
        <CreditCard class="w-4 h-4 mb-1" />
        <span class="text-[10px] leading-none tracking-tight truncate w-full font-bold">{{ t('nav.debts') }}</span>
      </router-link>

      <!-- Groups -->
      <router-link
        to="/groups"
        :class="[
          'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative',
          route.path.startsWith('/groups')
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
        ]"
      >
        <Users class="w-4 h-4 mb-1" />
        <span class="text-[10px] leading-none tracking-tight truncate w-full font-bold">{{ t('nav.groups') }}</span>
      </router-link>

      <!-- Friends -->
      <router-link
        to="/friends"
        :class="[
          'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative',
          route.path === '/friends'
            ? 'brand-pill-active'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
        ]"
      >
        <UserCheck class="w-4 h-4 mb-1" />
        <span class="text-[10px] leading-none tracking-tight truncate w-full font-bold">{{ t('friends.title') }}</span>
      </router-link>
    </div>
  </div>
</template>
