<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Users, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

function selectUser(userId) {
  authStore.switchUser(userId)
  router.push('/')
}
</script>

<template>
  <div class="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 overflow-x-auto text-xs">
    <div class="flex items-center gap-1 font-semibold text-slate-400 shrink-0 mr-1">
      <Users class="w-3.5 h-3.5 text-brand-400" />
      <span class="hidden sm:inline">Test Accounts:</span>
    </div>
    <div class="flex items-center gap-1.5">
      <button
        v-for="u in authStore.users"
        :key="u.id"
        @click="selectUser(u.id)"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-medium border',
          authStore.currentUserId === u.id
            ? 'bg-brand-600/90 text-white border-brand-400 shadow-md shadow-brand-500/20'
            : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
        ]"
      >
        <img :src="u.avatar" class="w-4 h-4 rounded-full bg-slate-800" :alt="u.name" />
        <span>{{ u.name.split(' ')[0] }}</span>
        <ShieldCheck v-if="u.role === 'admin'" class="w-3 h-3 text-amber-400" />
      </button>
    </div>
  </div>
</template>
