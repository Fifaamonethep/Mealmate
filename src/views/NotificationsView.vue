<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { Bell, CheckCheck, Clock } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const myNotifications = computed(() => {
  return notificationsStore.notifications.filter(n => n.userId === authStore.currentUserId)
})

function formatTime(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function handleMarkAllRead() {
  notificationsStore.markAllAsRead(authStore.currentUserId)
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6 pb-12">
    
    <!-- Title & Action -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
          <Bell class="w-6 h-6 text-brand-400" />
          <span>{{ t('notifications.title') }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('notifications.sub') }}</p>
      </div>

      <button
        v-if="myNotifications.length > 0"
        @click="handleMarkAllRead"
        class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-all"
      >
        <CheckCheck class="w-4 h-4 text-emerald-400" />
        <span>{{ t('notifications.mark_all_read') }}</span>
      </button>
    </div>

    <!-- Notification List -->
    <div v-if="myNotifications.length > 0" class="space-y-3">
      <div
        v-for="n in myNotifications"
        :key="n.id"
        @click="notificationsStore.markAsRead(n.id)"
        :class="[
          'glass-card p-4 flex items-start gap-3 cursor-pointer border transition-all',
          n.isRead ? 'border-slate-800 opacity-70' : 'border-brand-500/40 bg-slate-800/80 shadow-lg shadow-brand-500/5'
        ]"
      >
        <div :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', n.isRead ? 'bg-slate-600' : 'bg-brand-400 animate-ping']"></div>
        <div class="space-y-1 flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-white">{{ n.title }}</h4>
            <span class="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock class="w-3 h-3" /> {{ formatTime(n.createdAt) }}
            </span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">{{ n.message }}</p>
        </div>
      </div>
    </div>

    <div v-else class="glass-card p-12 text-center text-slate-400 space-y-2">
      <Bell class="w-12 h-12 text-slate-600 mx-auto" />
      <p class="text-sm font-semibold">{{ t('notifications.empty') }}</p>
    </div>
  </div>
</template>
