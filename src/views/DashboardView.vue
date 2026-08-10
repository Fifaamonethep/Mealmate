<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useMealsStore } from '../stores/meals'
import { useDebtsStore } from '../stores/debts'
import { useNotificationsStore } from '../stores/notifications'
import MealCard from '../components/meals/MealCard.vue'
import CreateMealModal from '../components/meals/CreateMealModal.vue'
import CreateGroupModal from '../components/groups/CreateGroupModal.vue'
import PaySlipModal from '../components/debts/PaySlipModal.vue'
import ReviewSlipModal from '../components/debts/ReviewSlipModal.vue'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const mealsStore = useMealsStore()
const debtsStore = useDebtsStore()
const notificationsStore = useNotificationsStore()

const showCreateMeal = ref(false)
const showCreateGroup = ref(false)
const selectedPaymentToPay = ref(null)
const selectedPaymentToReview = ref(null)

onMounted(() => {
  if (authStore.currentUserId) {
    notificationsStore.triggerOverdueReminderCheck(debtsStore.payments, authStore.currentUserId)
  }
})

// Calculate total debt current user owes others (status pending/slip_sent)
const totalMyDebt = computed(() => {
  return debtsStore.payments
    .filter(p => p.debtorId === authStore.currentUserId && p.status !== 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

// Calculate total owed to current user (status pending/slip_sent)
const totalOwedToMe = computed(() => {
  return debtsStore.payments
    .filter(p => p.creditorId === authStore.currentUserId && p.status !== 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

const netBalance = computed(() => totalOwedToMe.value - totalMyDebt.value)

const recentMeals = computed(() => mealsStore.meals.slice(0, 4))
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-950 p-6 md:p-8 rounded-2xl border border-brand-500/30 shadow-xl text-white">
      <div>
        <div class="flex items-center gap-2 text-brand-300 font-bold text-xs tracking-wider uppercase">
          <Sparkles class="w-4 h-4 text-brand-400" />
          <span>MealMate Dashboard</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {{ t('dashboard.welcome') }}, {{ authStore.currentUser?.name }}! 👋
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 mt-1">
          {{ t('dashboard.sub') }}
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <button @click="showCreateMeal = true" class="glow-button text-xs flex items-center gap-1.5 py-2.5">
          <Plus class="w-4 h-4" />
          <span>{{ t('dashboard.create_meal') }}</span>
        </button>
        <button @click="showCreateGroup = true" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-md">
          <Users class="w-4 h-4 text-brand-300" />
          <span>{{ t('dashboard.create_group') }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      <!-- Total My Debt -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {{ t('dashboard.total_my_debt') }}
          </span>
          <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {{ totalMyDebt.toLocaleString() }} VND
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 block">{{ t('dashboard.total_my_debt_sub') }}</span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10">
          <TrendingDown class="w-6 h-6" />
        </div>
      </div>

      <!-- Total Owed to Me -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {{ t('dashboard.total_owed_me') }}
          </span>
          <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {{ totalOwedToMe.toLocaleString() }} VND
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 block">{{ t('dashboard.total_owed_me_sub') }}</span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>

      <!-- Net Balance -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {{ t('dashboard.net_balance') }}
          </span>
          <div :class="['text-2xl font-extrabold', netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400']">
            {{ netBalance >= 0 ? '+' : '' }}{{ netBalance.toLocaleString() }} VND
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 block">{{ t('dashboard.net_balance_sub') }}</span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Wallet class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Recent Meals Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{{ t('dashboard.recent_activity') }}</span>
        </h2>
        <router-link to="/meals" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1">
          {{ t('dashboard.view_all') }} <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MealCard v-for="m in recentMeals" :key="m.id" :meal="m" />
      </div>
    </div>

    <!-- Modals -->
    <CreateMealModal :show="showCreateMeal" @close="showCreateMeal = false" />
    <CreateGroupModal :show="showCreateGroup" @close="showCreateGroup = false" />
  </div>
</template>
