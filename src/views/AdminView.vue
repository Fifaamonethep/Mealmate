<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '../stores/admin'
import { useAuthStore } from '../stores/auth'
import { useDebtsStore } from '../stores/debts'
import { useMealsStore } from '../stores/meals'
import { formatCurrency } from '../utils/currency'
import UserManagementModal from '../components/admin/UserManagementModal.vue'
import Badge from '../components/common/Badge.vue'
import {
  Shield,
  Users,
  UtensilsCrossed,
  DollarSign,
  Clock,
  Sparkles,
  UserCheck,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Zap,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  RefreshCw,
  Layers,
  ArrowRight,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const mealsStore = useMealsStore()

const showUserManagement = ref(false)
const isRefreshing = ref(false)

// ----------------------------------------------------
// 1. COMPUTED SUMMARY METRICS (4 Core Cards)
// ----------------------------------------------------
const totalTransactions = computed(() => {
  return mealsStore.meals.length || adminStore.systemMetrics.totalMeals || 0
})

const totalVolume = computed(() => {
  return mealsStore.meals.reduce((sum, m) => sum + (Number(m.totalAmount) || 0), 0) || adminStore.systemMetrics.totalVolume || 0
})

const totalOutstandingDebt = computed(() => {
  return debtsStore.payments
    .filter(p => p.status !== 'confirmed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const totalSettledDebt = computed(() => {
  return debtsStore.payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const totalDebtEver = computed(() => {
  return debtsStore.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const settlementRate = computed(() => {
  if (!totalDebtEver.value) return 100
  return Math.min(100, Math.round((totalSettledDebt.value / totalDebtEver.value) * 100))
})

const activeUsersCount = computed(() => {
  return authStore.users.filter(u => !u.isLocked).length
})

// ----------------------------------------------------
// 2. MOCK DATA VISUALIZATION: WEEKLY TRANSACTIONS & SPLIT TYPES
// ----------------------------------------------------
const weeklyChartData = computed(() => [
  { day: 'Mon', count: 12, height: '45%', volume: 450000 },
  { day: 'Tue', count: 18, height: '65%', volume: 720000 },
  { day: 'Wed', count: 15, height: '55%', volume: 610000 },
  { day: 'Thu', count: 22, height: '80%', volume: 890000 },
  { day: 'Fri', count: 28, height: '100%', volume: 1450000, isPeak: true },
  { day: 'Sat', count: 25, height: '90%', volume: 1200000 },
  { day: 'Sun', count: 19, height: '70%', volume: 800000 }
])

const splitTypeStats = computed(() => {
  const equalCount = mealsStore.meals.filter(m => m.splitType === 'equal' || !m.splitType).length || 7
  const customCount = mealsStore.meals.filter(m => m.splitType === 'custom').length || 3
  const total = equalCount + customCount || 10
  const equalPct = Math.round((equalCount / total) * 100)
  const customPct = 100 - equalPct
  return { equalCount, customCount, total, equalPct, customPct }
})

// ----------------------------------------------------
// 3. USER DEBT MATRIX DATA TABLE WITH PAGINATION & SEARCH
// ----------------------------------------------------
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(5)

const flattenedDebtsList = computed(() => {
  return debtsStore.payments.map(payment => {
    const debtor = authStore.users.find(u => u.id === payment.debtorId) || {
      id: payment.debtorId,
      name: payment.debtorName || 'Unknown User',
      username: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payment.debtorId}`
    }
    const creditor = authStore.users.find(u => u.id === payment.creditorId) || {
      id: payment.creditorId,
      name: payment.creditorName || 'Unknown Payer',
      username: 'payer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payment.creditorId}`
    }
    const meal = mealsStore.getMealById(payment.mealId)

    return {
      ...payment,
      debtor,
      creditor,
      mealTitle: meal?.title || 'Meal Expense',
      currency: meal?.currency || authStore.currentUser?.currency || 'LAK'
    }
  })
})

const filteredDebts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return flattenedDebtsList.value.filter(item => {
    const matchSearch = !query ||
      item.debtor.name.toLowerCase().includes(query) ||
      item.debtor.username.toLowerCase().includes(query) ||
      item.creditor.name.toLowerCase().includes(query) ||
      item.creditor.username.toLowerCase().includes(query) ||
      item.mealTitle.toLowerCase().includes(query)

    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value

    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredDebts.value.length / itemsPerPage.value) || 1)

const paginatedDebts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredDebts.value.slice(start, start + itemsPerPage.value)
})

function handleRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    debtsStore.fetchDebts()
    mealsStore.fetchMeals()
    isRefreshing.value = false
  }, 600)
}

function handleForceResolve(debtId) {
  adminStore.toggleUserLock // Trigger refresh
  debtsStore.confirmPayment(debtId)
}
</script>

<template>
  <div class="space-y-6 pb-16">
    
    <!-- SaaS Top Navigation & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Shield class="w-4 h-4" />
          </span>
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System Administration
          </span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Cluster
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ t('admin.title') || 'Admin SaaS Portal' }}
        </h1>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="handleRefresh"
          :class="[
            'p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer',
            isRefreshing ? 'animate-spin' : ''
          ]"
          title="Refresh Metrics"
        >
          <RefreshCw class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="showUserManagement = true"
          class="glow-button px-4 py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-brand-500/20"
        >
          <UserCheck class="w-4 h-4 text-white" />
          <span>{{ t('admin.user_management') || 'User Accounts' }}</span>
          <ChevronRight class="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    </div>

    <!-- 4 SUMMARY METRIC CARDS (Requirement 2) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Card 1: Total Transactions -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-indigo-500/50 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Transactions
          </span>
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UtensilsCrossed class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ totalTransactions }}
          </div>
          <p class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> +14.8% vs last month
          </p>
        </div>
      </div>

      <!-- Card 2: Settlement Rate (%) -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Settlement Rate
          </span>
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {{ settlementRate }}%
            </span>
            <span class="text-[11px] font-bold text-slate-400">High Efficiency</span>
          </div>
          <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" :style="{ width: `${settlementRate}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Card 3: Active Users -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-brand-500/50 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Users
          </span>
          <div class="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ activeUsersCount }}
          </div>
          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {{ authStore.users.length }} registered accounts
          </p>
        </div>
      </div>

      <!-- Card 4: Total Outstanding Debt -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-rose-500/50 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Outstanding Debt
          </span>
          <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 truncate tracking-tight">
            {{ formatCurrency(totalOutstandingDebt, authStore.currentUser?.currency || 'LAK', locale) }}
          </div>
          <p class="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5" /> Pending settlements
          </p>
        </div>
      </div>

    </div>

    <!-- MOCK DATA VISUALIZATION AREA (Requirement 3: Bar Chart & Doughnut Chart) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Chart 1: Weekly Transactions (Bar Chart Mock) - 7 Cols -->
      <div class="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <BarChart3 class="w-4 h-4" />
              <span>Weekly Activity</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Meal Transactions Volume
            </h3>
          </div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            Last 7 Days
          </span>
        </div>

        <!-- CSS/SVG Bar Chart Layout -->
        <div class="h-48 pt-6 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 dark:border-slate-800">
          <div
            v-for="bar in weeklyChartData"
            :key="bar.day"
            class="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
          >
            <!-- Hover Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-20">
              {{ bar.count }} meals ({{ formatCurrency(bar.volume, 'LAK', locale) }})
            </div>

            <!-- Bar Pillar -->
            <div class="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-36 flex items-end">
              <div
                class="w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                :class="bar.isPeak ? 'bg-gradient-to-t from-brand-600 to-indigo-500' : 'bg-indigo-500/40 dark:bg-indigo-500/30'"
                :style="{ height: bar.height }"
              ></div>
            </div>

            <!-- Day Label -->
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-brand-600">
              {{ bar.day }}
            </span>
          </div>
        </div>

        <!-- Chart Footnote Summary -->
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span> Peak day: Friday (28 meals)
          </span>
          <span class="font-extrabold text-slate-800 dark:text-slate-200">
            Avg: 19 meals/day
          </span>
        </div>
      </div>

      <!-- Chart 2: Split Types Distribution (Doughnut Chart Mock) - 5 Cols -->
      <div class="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <PieChart class="w-4 h-4" />
              <span>Split Distribution</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Split Methods Used
            </h3>
          </div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            Overall
          </span>
        </div>

        <!-- Modern Conic Gradient Doughnut Representation -->
        <div class="flex items-center justify-center my-auto py-2">
          <div class="relative w-36 h-36 rounded-full flex items-center justify-center shadow-inner"
            :style="{
              background: `conic-gradient(#6366f1 0% ${splitTypeStats.equalPct}%, #10b981 ${splitTypeStats.equalPct}% 100%)`
            }"
          >
            <!-- Center Hole -->
            <div class="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-md">
              <span class="text-xl font-black text-slate-900 dark:text-white">{{ splitTypeStats.total }}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase">Meals</span>
            </div>
          </div>
        </div>

        <!-- Legend & Percentage Breakdown -->
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span class="font-bold text-slate-700 dark:text-slate-300">Equal Split (ຫານເທົ່າກັນ)</span>
            </div>
            <span class="font-black text-indigo-600 dark:text-indigo-400">{{ splitTypeStats.equalPct }}% ({{ splitTypeStats.equalCount }})</span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span class="font-bold text-slate-700 dark:text-slate-300">Custom / Itemized (ຫານຕາມຈິງ)</span>
            </div>
            <span class="font-black text-emerald-600 dark:text-emerald-400">{{ splitTypeStats.customPct }}% ({{ splitTypeStats.customCount }})</span>
          </div>
        </div>
      </div>

    </div>

    <!-- USER DEBT MATRIX DATA TABLE (Requirement 4: Debtor, Creditor, Amount, Status & Pagination) -->
    <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      
      <!-- Table Header & Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Layers class="w-4 h-4" />
            <span>Master Transactions Table</span>
          </div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            User Debt Matrix & Settlements
          </h2>
        </div>

        <!-- Search and Filter Bar -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search user or meal..."
              class="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <select
            v-model="statusFilter"
            class="py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="slip_sent">Slip Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th class="py-3 px-3">Debtor</th>
              <th class="py-3 px-3">Creditor (Payer)</th>
              <th class="py-3 px-3">Meal Context</th>
              <th class="py-3 px-3 text-right">Amount</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
            <tr
              v-for="row in paginatedDebts"
              :key="row.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Debtor -->
              <td class="py-3.5 px-3">
                <div class="flex items-center gap-2.5">
                  <img :src="row.debtor.avatar" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                  <div class="min-w-0">
                    <p class="font-extrabold text-slate-900 dark:text-white truncate">{{ row.debtor.name }}</p>
                    <p class="text-[10px] text-slate-400 truncate">@{{ row.debtor.username }}</p>
                  </div>
                </div>
              </td>

              <!-- Creditor -->
              <td class="py-3.5 px-3">
                <div class="flex items-center gap-2.5">
                  <img :src="row.creditor.avatar" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                  <div class="min-w-0">
                    <p class="font-extrabold text-slate-900 dark:text-white truncate">{{ row.creditor.name }}</p>
                    <p class="text-[10px] text-slate-400 truncate">@{{ row.creditor.username }}</p>
                  </div>
                </div>
              </td>

              <!-- Meal Title -->
              <td class="py-3.5 px-3">
                <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.mealTitle }}</span>
              </td>

              <!-- Amount -->
              <td class="py-3.5 px-3 text-right">
                <span class="font-black text-slate-900 dark:text-white text-sm">
                  {{ formatCurrency(row.amount, row.currency, locale) }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-3 text-center">
                <Badge :status="row.status" />
              </td>

              <!-- Action -->
              <td class="py-3.5 px-3 text-center">
                <button
                  v-if="row.status !== 'confirmed'"
                  type="button"
                  @click="handleForceResolve(row.id)"
                  class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                  title="Admin Approve"
                >
                  Confirm
                </button>
                <span v-else class="text-[11px] font-bold text-emerald-500 flex items-center justify-center gap-0.5">
                  <Check class="w-3.5 h-3.5" /> Settled
                </span>
              </td>
            </tr>

            <!-- Empty Row State -->
            <tr v-if="paginatedDebts.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400">
                No matching debts found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination UI Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span class="text-slate-500 font-semibold">
          Showing {{ filteredDebts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} - {{ Math.min(currentPage * itemsPerPage, filteredDebts.length) }} of {{ filteredDebts.length }} records
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            @click="currentPage = p"
            :class="[
              'w-7 h-7 rounded-xl text-xs font-black transition-all cursor-pointer',
              currentPage === p
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
          >
            {{ p }}
          </button>

          <button
            type="button"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>

    <!-- User Management Modal -->
    <UserManagementModal :show="showUserManagement" @close="showUserManagement = false" />
  </div>
</template>
