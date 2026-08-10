<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useDebtsStore } from '../stores/debts'
import DebtCard from '../components/debts/DebtCard.vue'
import PaySlipModal from '../components/debts/PaySlipModal.vue'
import ReviewSlipModal from '../components/debts/ReviewSlipModal.vue'
import { CreditCard, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()

const activeTab = ref('my_debts') // 'my_debts' | 'owed_to_me'
const statusFilter = ref('all') // 'all' | 'pending' | 'slip_sent' | 'confirmed' | 'rejected'

const selectedPaymentToPay = ref(null)
const selectedPaymentToReview = ref(null)

const filteredPayments = computed(() => {
  return debtsStore.payments.filter(p => {
    const isTarget = activeTab.value === 'my_debts'
      ? p.debtorId === authStore.currentUserId
      : p.creditorId === authStore.currentUserId

    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return isTarget && matchesStatus
  })
})
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Title -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <CreditCard class="w-6 h-6 text-brand-600 dark:text-brand-400" />
        <span>{{ t('debts.title') }}</span>
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ t('debts.sub') }}
      </p>
    </div>

    <!-- Main Tabs & Filter Bar -->
    <div class="glass-card p-4 space-y-4 border border-slate-200/80 dark:border-slate-700/60">
      
      <!-- Main Tabs -->
      <div class="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
        <button
          @click="activeTab = 'my_debts'"
          :class="[
            'py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all',
            activeTab === 'my_debts'
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>{{ t('debts.my_debts') }}</span>
        </button>

        <button
          @click="activeTab = 'owed_to_me'"
          :class="[
            'py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all',
            activeTab === 'owed_to_me'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>{{ t('debts.owed_to_me') }}</span>
        </button>
      </div>

      <!-- Status Sub-Filter -->
      <div class="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1 font-semibold">
          <Filter class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> {{ t('debts.filter_status') }}
        </span>
        <button
          v-for="st in ['all', 'pending', 'slip_sent', 'confirmed', 'rejected']"
          :key="st"
          @click="statusFilter = st"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all font-semibold capitalize border shrink-0',
            statusFilter === st
              ? 'bg-brand-600 text-white border-brand-500 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          {{ st === 'all' ? t('common.all') : t(`common.status_${st}`) }}
        </button>
      </div>
    </div>

    <!-- Debt Cards List -->
    <div v-if="filteredPayments.length > 0" class="space-y-3">
      <DebtCard
        v-for="p in filteredPayments"
        :key="p.id"
        :payment="p"
        @pay="selectedPaymentToPay = p"
        @review="selectedPaymentToReview = p"
      />
    </div>

    <div v-else class="glass-card p-12 text-center text-slate-400 space-y-2">
      <CreditCard class="w-12 h-12 text-slate-600 mx-auto" />
      <p class="text-sm font-semibold">{{ t('debts.empty') }}</p>
    </div>

    <!-- Modals -->
    <PaySlipModal
      :show="!!selectedPaymentToPay"
      :payment="selectedPaymentToPay"
      @close="selectedPaymentToPay = null"
    />

    <ReviewSlipModal
      :show="!!selectedPaymentToReview"
      :payment="selectedPaymentToReview"
      @close="selectedPaymentToReview = null"
    />
  </div>
</template>
