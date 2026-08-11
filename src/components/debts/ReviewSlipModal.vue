<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { useMealsStore } from '../../stores/meals'
import { formatCurrency } from '../../utils/currency'
import { Eye, CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  payment: Object
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const mealsStore = useMealsStore()

const showRejectReasonInput = ref(false)
const rejectReason = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    showRejectReasonInput.value = false
    rejectReason.value = ''
  }
})

const debtor = computed(() => {
  return props.payment ? authStore.users.find(u => u.id === props.payment.debtorId) : null
})

const meal = computed(() => {
  return props.payment ? mealsStore.getMealById(props.payment.mealId) : null
})

function handleConfirm() {
  if (!props.payment) return
  debtsStore.confirmPayment(props.payment.id)
  emit('close')
}

function handleReject() {
  if (!props.payment) return
  if (!showRejectReasonInput.value) {
    showRejectReasonInput.value = true
    return
  }
  debtsStore.rejectPayment(props.payment.id, rejectReason.value)
  showRejectReasonInput.value = false
  rejectReason.value = ''
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('debts.review_modal_title')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Eye class="w-5 h-5 text-brand-600 dark:text-brand-400" />
    </template>

    <div v-if="payment && debtor" class="space-y-4 text-slate-800 dark:text-slate-200">
      
      <!-- Summary Box -->
      <div class="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('debts.sender') }}</span>
          <div class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            <img :src="debtor.avatar" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>{{ debtor.name }}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('debts.bill_amount') }}</span>
          <div class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(payment.amount, meal?.currency || 'LAK', locale) }}
          </div>
        </div>
      </div>

      <!-- Slip Image Preview -->
      <div class="space-y-1">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ t('debts.slip_image_label') }}</label>
        <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-auto max-h-72 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-1">
          <img
            :src="payment.slipUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop'"
            class="max-h-68 w-auto rounded-lg object-contain"
            alt="Payment Slip"
          />
        </div>
      </div>

      <!-- Reject reason input -->
      <div v-if="showRejectReasonInput" class="space-y-2 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-500/40">
        <label class="block text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
          <AlertTriangle class="w-3.5 h-3.5" />
          {{ t('debts.reject_reason_label') }}
        </label>
        <input
          v-model="rejectReason"
          type="text"
          :placeholder="t('debts.reject_reason_placeholder')"
          class="glass-input text-xs w-full border-rose-400 focus:border-rose-500"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button
          @click="handleReject"
          class="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <XCircle class="w-4 h-4" />
          <span>{{ showRejectReasonInput ? t('debts.btn_confirm_reject') : t('debts.btn_reject') }}</span>
        </button>

        <button
          @click="handleConfirm"
          class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>{{ t('debts.btn_confirm_paid') }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
