<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useMealsStore } from '../stores/meals'
import { useDebtsStore } from '../stores/debts'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import MealCard from '../components/meals/MealCard.vue'
import CreateMealModal from '../components/meals/CreateMealModal.vue'
import CreateGroupModal from '../components/groups/CreateGroupModal.vue'
import PaySlipModal from '../components/debts/PaySlipModal.vue'
import ReviewSlipModal from '../components/debts/ReviewSlipModal.vue'
import VisualDebtGraph from '../components/debts/VisualDebtGraph.vue'
import AnalyticsCharts from '../components/analytics/AnalyticsCharts.vue'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  Shield,
  ChevronDown,
  Receipt,
  UtensilsCrossed,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-vue-next'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const mealsStore = useMealsStore()
const debtsStore = useDebtsStore()
const notificationsStore = useNotificationsStore()

const showCreateMeal = ref(false)
const showCreateGroup = ref(false)

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

const userDisplayName = computed(() => {
  if (authStore.currentUser?.id === 'u-admin') {
    return t('admin.role_admin')
  }
  return authStore.currentUser?.name || ''
})
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Ultra-Clean Modern Hero Banner (Pastel Aesthetic) -->
    <div class="glass-card p-6 sm:p-8 border border-purple-200/80 dark:border-purple-800/40 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl shadow-xl text-purple-950 dark:text-white relative overflow-hidden space-y-6">
      
      <!-- Glowing Ambient Background Lights -->
      <div class="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/25 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-400/25 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="bg-white/40 text-purple-950 border border-white/60 text-[11px] uppercase font-black px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-sm">
              <Sparkles class="w-3.5 h-3.5 text-purple-700" />
              <span>{{ t('dashboard.hero_tag') }}</span>
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-950 dark:text-white tracking-tight">
            {{ t('dashboard.welcome') }}, {{ userDisplayName }}! 👋
          </h1>
          
          <p class="text-xs sm:text-sm text-purple-900/90 dark:text-slate-300 max-w-xl leading-relaxed font-semibold">
            {{ t('dashboard.sub') }}
          </p>
        </div>

        <!-- Quick Action Button -->
        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="showCreateMeal = true"
            class="glow-button px-5 py-3.5 text-xs font-black flex items-center justify-center gap-2.5 shadow-xl transform active:scale-95 hover:scale-105"
          >
            <Plus class="w-4.5 h-4.5 text-purple-950 dark:text-purple-100" />
            <span>{{ t('dashboard.create_meal') }}</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Vibrant & Easy-to-Understand Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      <!-- Total My Debt (Tôi cần trả) -->
      <div class="glass-card p-6 border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:bg-slate-900/90 rounded-2xl flex items-center justify-between hover:border-rose-500/60 hover:shadow-xl hover:shadow-rose-500/10 transition-all group">
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <TrendingDown class="w-4 h-4 text-rose-500" />
            <span>{{ t('dashboard.total_my_debt') }}</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {{ formatCurrency(totalMyDebt, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            {{ t('dashboard.total_my_debt_sub') }}
          </span>
        </div>
        <div class="w-13 h-13 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform shrink-0">
          <TrendingDown class="w-6 h-6" />
        </div>
      </div>

      <!-- Total Owed to Me (Người khác nợ tôi) -->
      <div class="glass-card p-6 border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:bg-slate-900/90 rounded-2xl flex items-center justify-between hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <TrendingUp class="w-4 h-4 text-emerald-500" />
            <span>{{ t('dashboard.total_owed_me') }}</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(totalOwedToMe, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            {{ t('dashboard.total_owed_me_sub') }}
          </span>
        </div>
        <div class="w-13 h-13 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>

      <!-- Net Balance (Cân bằng tài chính) -->
      <div class="glass-card p-6 border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:bg-slate-900/90 rounded-2xl flex items-center justify-between hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group">
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Wallet class="w-4 h-4 text-indigo-500" />
            <span>{{ t('dashboard.net_balance') }}</span>
          </div>
          <div :class="['text-2xl sm:text-3xl font-black', netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400']">
            {{ netBalance >= 0 ? '+' : '' }}{{ formatCurrency(netBalance, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            {{ t('dashboard.net_balance_sub') }}
          </span>
        </div>
        <div class="w-13 h-13 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
          <Wallet class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- Visual Debt Network Graph -->
    <VisualDebtGraph />

    <!-- Analytics & Spending Charts -->
    <AnalyticsCharts />



    <!-- Recent Meals Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UtensilsCrossed class="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>{{ t('dashboard.recent_activity') }}</span>
        </h2>
        <router-link to="/meals" class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
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
