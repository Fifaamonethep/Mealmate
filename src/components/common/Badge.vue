<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, Send, CheckCircle2, XCircle } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'pending':
      return {
        labelKey: 'common.status_pending',
        classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold',
        icon: Clock
      }
    case 'slip_sent':
      return {
        labelKey: 'common.status_slip_sent',
        classes: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 animate-pulse font-bold',
        icon: Send
      }
    case 'confirmed':
      return {
        labelKey: 'common.status_confirmed',
        classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold',
        icon: CheckCircle2
      }
    case 'rejected':
      return {
        labelKey: 'common.status_rejected',
        classes: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold',
        icon: XCircle
      }
    default:
      return {
        labelKey: props.status,
        classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-semibold',
        icon: Clock
      }
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm',
      badgeConfig.classes
    ]"
  >
    <component :is="badgeConfig.icon" class="w-3.5 h-3.5" />
    <span>{{ badgeConfig.labelKey.includes('.') ? t(badgeConfig.labelKey) : badgeConfig.labelKey }}</span>
  </span>
</template>
