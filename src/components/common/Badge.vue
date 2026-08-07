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
        classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: Clock
      }
    case 'slip_sent':
      return {
        labelKey: 'common.status_slip_sent',
        classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse',
        icon: Send
      }
    case 'confirmed':
      return {
        labelKey: 'common.status_confirmed',
        classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2
      }
    case 'rejected':
      return {
        labelKey: 'common.status_rejected',
        classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: XCircle
      }
    default:
      return {
        labelKey: props.status,
        classes: 'bg-slate-800 text-slate-400 border-slate-700',
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
