<script setup>
import { useToastStore } from '../../stores/toast'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-vue-next'

const toastStore = useToastStore()

function getIcon(type) {
  switch (type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    case 'warning': return AlertCircle
    default: return Info
  }
}

function getTypeClasses(type) {
  switch (type) {
    case 'success': return 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/10'
    case 'error': return 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/10'
    case 'warning': return 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-500/10'
    default: return 'bg-brand-950/90 border-brand-500/50 text-brand-200 shadow-brand-500/10'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      <div
        v-for="t in toastStore.toasts"
        :key="t.id"
        :class="[
          'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 text-xs font-semibold animate-fadeIn',
          getTypeClasses(t.type)
        ]"
      >
        <div class="flex items-center gap-2.5">
          <component :is="getIcon(t.type)" class="w-4 h-4 shrink-0" />
          <span>{{ t.message }}</span>
        </div>
        <button @click="toastStore.removeToast(t.id)" class="p-1 hover:opacity-80">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
