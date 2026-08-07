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
    class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl"
  >
    <div class="grid grid-cols-5 gap-1 text-center">
      <router-link
        to="/"
        :class="[
          'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
          route.path === '/' ? 'text-brand-400 font-bold bg-brand-500/10' : 'text-slate-400 hover:text-white'
        ]"
      >
        <LayoutDashboard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ t('nav.dashboard') }}</span>
      </router-link>

      <router-link
        to="/meals"
        :class="[
          'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
          route.path.startsWith('/meals') ? 'text-brand-400 font-bold bg-brand-500/10' : 'text-slate-400 hover:text-white'
        ]"
      >
        <Receipt class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ t('nav.meals') }}</span>
      </router-link>

      <router-link
        to="/debts"
        :class="[
          'flex flex-col items-center justify-center py-1 rounded-xl transition-all relative',
          route.path === '/debts' ? 'text-brand-400 font-bold bg-brand-500/10' : 'text-slate-400 hover:text-white'
        ]"
      >
        <CreditCard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ t('nav.debts') }}</span>
      </router-link>

      <router-link
        to="/groups"
        :class="[
          'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
          route.path.startsWith('/groups') ? 'text-brand-400 font-bold bg-brand-500/10' : 'text-slate-400 hover:text-white'
        ]"
      >
        <Users class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ t('nav.groups') }}</span>
      </router-link>

      <router-link
        to="/profile"
        :class="[
          'flex flex-col items-center justify-center py-1 rounded-xl transition-all relative',
          route.path === '/profile' ? 'text-brand-400 font-bold bg-brand-500/10' : 'text-slate-400 hover:text-white'
        ]"
      >
        <User class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ t('nav.profile') }}</span>
        <span
          v-if="unreadCount > 0"
          class="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"
        ></span>
      </router-link>
    </div>
  </div>
</template>
