<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Users, ShieldCheck, User } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const adminUser = computed(() => authStore.users.find(u => u.role === 'admin'))
const regularUsers = computed(() => authStore.users.filter(u => u.role !== 'admin'))

function selectUser(userId) {
  const user = authStore.users.find(u => u.id === userId)
  authStore.switchUser(userId)
  if (user?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-3 py-1.5 overflow-x-auto text-xs shadow-sm dark:shadow-inner w-full transition-colors duration-300">
    
    <!-- Admin Portal Switch -->
    <div v-if="adminUser" class="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800 shrink-0">
      <span class="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider hidden sm:inline">Admin Portal:</span>
      <button
        @click="selectUser(adminUser.id)"
        :class="[
          'flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-xs font-bold border shrink-0',
          authStore.currentUserId === adminUser.id
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30'
            : 'bg-amber-50 dark:bg-slate-900/80 text-amber-700 dark:text-amber-400/80 border-amber-500/30 hover:bg-amber-100 dark:hover:bg-slate-800'
        ]"
      >
        <ShieldCheck class="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Admin System</span>
      </button>
    </div>

    <!-- Regular Members Switch -->
    <div class="flex items-center gap-2 overflow-x-auto">
      <span class="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider hidden md:inline shrink-0">Test Users:</span>
      <button
        v-for="u in regularUsers"
        :key="u.id"
        @click="selectUser(u.id)"
        :class="[
          'flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-xs font-semibold border shrink-0',
          authStore.currentUserId === u.id
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-400/80 shadow-md shadow-brand-500/25 ring-2 ring-brand-500/30'
            : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <img :src="u.avatar" class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-slate-300 dark:border-white/20" :alt="u.name" />
        <span>{{ u.name.split(' ')[0] }}</span>
      </button>
    </div>
  </div>
</template>
