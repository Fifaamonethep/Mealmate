<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Badge from '../common/Badge.vue'
import { useAuthStore } from '../../stores/auth'
import { useMealsStore } from '../../stores/meals'
import { formatCurrency } from '../../utils/currency'
import { CreditCard, Eye, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'

const props = defineProps({
  payment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['pay', 'review'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const mealsStore = useMealsStore()

const isDebtor = computed(() => props.payment.debtorId === authStore.currentUserId)
const isCreditor = computed(() => props.payment.creditorId === authStore.currentUserId)

const debtor = computed(() => authStore.users.find(u => u.id === props.payment.debtorId))
const creditor = computed(() => authStore.users.find(u => u.id === props.payment.creditorId))
const meal = computed(() => mealsStore.getMealById(props.payment.mealId))

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-700/60">
    
    <!-- Left Info -->
    <div class="flex items-center gap-3">
      <!-- Icon direction indicator -->
      <div
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
          isDebtor
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
        ]"
      >
        <ArrowUpRight v-if="isDebtor" class="w-5 h-5" />
        <ArrowDownLeft v-else class="w-5 h-5" />
      </div>

      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-slate-900 dark:text-white">
            {{ meal?.title || t('meals.title') }}
          </span>
          <Badge :status="payment.status" />
        </div>

        <div class="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
          <span v-if="isDebtor">
            {{ t('debts.owe_label') }} <strong class="text-slate-800 dark:text-slate-200">{{ creditor?.name }}</strong>
          </span>
          <span v-else>
            <strong class="text-slate-800 dark:text-slate-200">{{ debtor?.name }}</strong> {{ t('debts.owes_you') }}
          </span>
          <span>•</span>
          <span>{{ formatDate(payment.createdAt) }}</span>
        </div>

        <!-- Reject reason text if rejected -->
        <p v-if="payment.status === 'rejected' && payment.rejectReason" class="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle class="w-3.5 h-3.5" />
          <span>{{ t('debts.rejected_reason') }} "{{ payment.rejectReason }}"</span>
        </p>
      </div>
    </div>

    <!-- Right Amount & Action Button -->
    <div class="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
      <div class="text-right">
        <div :class="['text-lg font-extrabold', isDebtor ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400']">
          {{ isDebtor ? '-' : '+' }}{{ formatCurrency(payment.amount, meal?.currency || 'VND', locale) }}
        </div>
      </div>

      <!-- Actions -->
      <div>
        <!-- Debtor actions -->
        <template v-if="isDebtor">
          <button
            v-if="payment.status === 'pending' || payment.status === 'rejected'"
            @click="emit('pay', payment)"
            class="glow-button text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <CreditCard class="w-3.5 h-3.5" />
            <span>{{ t('debts.pay_now') }}</span>
          </button>
          <span
            v-else-if="payment.status === 'slip_sent'"
            class="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-xl font-medium inline-block"
          >
            {{ t('debts.slip_sent_waiting') }}
          </span>
        </template>

        <!-- Creditor actions -->
        <template v-else-if="isCreditor">
          <button
            v-if="payment.status === 'slip_sent'"
            @click="emit('review', payment)"
            class="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>{{ t('debts.view_slip') }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
