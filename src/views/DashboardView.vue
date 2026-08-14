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
  <div class="space-y-4 sm:space-y-6 pb-12">
    
    <!-- Mobile-First User Greeting Header -->
    <div class="flex items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3 min-w-0">
        <div class="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
          <img
            :src="authStore.currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.currentUser?.username || 'user'}`"
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-brand-500/40 bg-slate-100 dark:bg-slate-800"
            alt="Avatar"
          />
          <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
        </div>
        <div class="min-w-0">
          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-none mb-1">
            {{ t('dashboard.welcome') }} 👋
          </p>
          <h1 class="text-base sm:text-xl font-black text-slate-900 dark:text-white truncate">
            {{ userDisplayName }}
          </h1>
        </div>
      </div>

      <button
        @click="showCreateMeal = true"
        class="glow-button px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black flex items-center gap-1.5 shrink-0 shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
      >
        <Plus class="w-4 h-4 text-white" />
        <span class="hidden sm:inline">{{ t('dashboard.create_meal') }}</span>
        <span class="sm:hidden">{{ t('nav.meals') }}</span>
      </button>
    </div>

    <!-- Master Mobile Wallet Balance Card (Soft, Light & Clean Design) -->
    <div class="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 space-y-4">
      
      <!-- Top: Net Balance Overview -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <Wallet class="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>{{ t('dashboard.net_balance') }}</span>
          </div>
          <div :class="['text-2xl sm:text-3xl font-black tracking-tight', netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400']">
            {{ netBalance >= 0 ? '+' : '' }}{{ formatCurrency(netBalance, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
        </div>

        <div class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/80 dark:border-slate-700 text-brand-600 dark:text-brand-400 shrink-0">
          <Sparkles class="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <!-- Bottom: 2-Column Split (I Owe & Owed to Me in Soft Pastel Badges) -->
      <div class="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        
        <!-- I Owe (Tôi cần trả - Soft Rose) -->
        <router-link
          to="/debts"
          class="p-2.5 sm:p-3 rounded-2xl bg-rose-50/80 hover:bg-rose-100/80 dark:bg-rose-950/25 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 transition-all flex flex-col justify-between"
        >
          <div class="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mb-1">
            <TrendingDown class="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span class="truncate">{{ t('dashboard.total_my_debt') }}</span>
          </div>
          <div class="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 truncate">
            {{ formatCurrency(totalMyDebt, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
        </router-link>

        <!-- Owed to Me (Người khác nợ tôi - Soft Emerald) -->
        <router-link
          to="/debts"
          class="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 transition-all flex flex-col justify-between"
        >
          <div class="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span class="truncate">{{ t('dashboard.total_owed_me') }}</span>
          </div>
          <div class="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
            {{ formatCurrency(totalOwedToMe, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
        </router-link>

      </div>
    </div>

    <!-- Recent Meals Section -->
    <div class="space-y-3 pt-1">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UtensilsCrossed class="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>{{ t('dashboard.recent_activity') }}</span>
        </h2>
        <router-link to="/meals" class="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1 transition-colors">
          {{ t('dashboard.view_all') }} <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div v-if="recentMeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MealCard v-for="m in recentMeals" :key="m.id" :meal="m" />
      </div>
      <div v-else class="glass-card p-8 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2">
        <UtensilsCrossed class="w-8 h-8 text-slate-400 mx-auto" />
        <p class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ t('meals.no_meals') }}</p>
      </div>
    </div>

    <!-- Visual Debt Network Graph -->
    <VisualDebtGraph />

    <!-- Analytics & Spending Charts -->
    <AnalyticsCharts />

    <!-- Modals -->
    <CreateMealModal :show="showCreateMeal" @close="showCreateMeal = false" />
    <CreateGroupModal :show="showCreateGroup" @close="showCreateGroup = false" />
  </div>
</template>
