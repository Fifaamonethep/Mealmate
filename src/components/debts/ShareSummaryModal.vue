<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { formatCurrency } from '../../utils/currency'
import { Share2, Copy, Check, Sparkles, Send } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  groupName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const copied = ref(false)

const summaryText = computed(() => {
  const pendingDebts = debtsStore.payments.filter(p => p.status !== 'confirmed')
  const gName = props.groupName || t('groups.title')

  let text = `${t('share.summary_header', { groupName: gName })}\n`
  text += `────────────────────\n`

  if (pendingDebts.length === 0) {
    text += `${t('share.all_cleared_msg')}\n`
  } else {
    pendingDebts.forEach((p, idx) => {
      const debtor = authStore.users.find(u => u.id === p.debtorId)?.name || t('share.debtor_default')
      const creditor = authStore.users.find(u => u.id === p.creditorId)?.name || t('share.creditor_default')
      const amt = formatCurrency(p.amount, 'LAK', locale.value)
      text += `${idx + 1}. 🔴 ${debtor} ➔ ${t('share.transfer_to_msg')} ${creditor}: ${amt}\n`
    })
  }

  text += `────────────────────\n`
  text += `${t('share.view_details_link_msg')}`
  return text
})

function copyText() {
  navigator.clipboard.writeText(summaryText.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}
</script>

<template>
  <Modal :show="show" :title="t('share.share_modal_title')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Share2 class="w-5 h-5 text-indigo-500" />
    </template>

    <div class="space-y-4 text-left">
      <div class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
        {{ summaryText }}
      </div>

      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {{ t('share.share_hint') }}
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <button @click="emit('close')" class="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
          {{ t('common.close') }}
        </button>
        <button @click="copyText" class="w-2/3 glow-button py-2.5 text-xs font-extrabold flex items-center justify-center gap-2">
          <component :is="copied ? Check : Copy" class="w-4 h-4" />
          <span>{{ copied ? t('share.copied_success') : t('share.copy_share_btn') }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
