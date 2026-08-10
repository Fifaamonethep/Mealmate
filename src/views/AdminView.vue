<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '../stores/admin'
import { useAuthStore } from '../stores/auth'
import { formatCurrency } from '../utils/currency'
import UserManagementModal from '../components/admin/UserManagementModal.vue'
import DebtMatrixTable from '../components/admin/DebtMatrixTable.vue'
import {
  Shield,
  Users,
  Utensils,
  DollarSign,
  Clock,
  Sparkles,
  Activity,
  UserCheck,
  ChevronRight,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers,
  PieChart
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const adminStore = useAdminStore()
const authStore = useAuthStore()

const showUserManagement = ref(false)

const settledVolume = computed(() => {
  return Math.max(0, adminStore.systemMetrics.totalVolume - adminStore.systemMetrics.totalUnpaid)
})

const settlementRate = computed(() => {
  if (!adminStore.systemMetrics.totalVolume) return 100
  return Math.min(100, Math.round((settledVolume.value / adminStore.systemMetrics.totalVolume) * 100))
})
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Admin Hero Banner -->
    <div class="glass-card p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 rounded-3xl shadow-2xl text-white relative overflow-hidden space-y-6">
      
      <!-- Glowing Ambient Background Accents -->
      <div class="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div class="space-y-2">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] uppercase font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-md">
              <Shield class="w-3.5 h-3.5 text-amber-400" /> Admin Portal
            </span>
            <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{{ t('admin.user_status') }}: Live</span>
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{{ t('admin.title') }}</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-300/90 max-w-2xl leading-relaxed">{{ t('admin.sub') }}</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="showUserManagement = true"
            class="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-amber-500/25 shrink-0 transform active:scale-95 hover:scale-105"
          >
            <UserCheck class="w-4.5 h-4.5 text-slate-950" />
            <span>{{ t('admin.user_management') }}</span>
            <ChevronRight class="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      <!-- Quick Settlement Rate & Health Progress Bar inside Hero -->
      <div class="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" /> Tỷ lệ quyết toán xong
            </span>
            <span class="font-extrabold text-emerald-400">{{ settlementRate }}%</span>
          </div>
          <div class="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" :style="{ width: `${settlementRate}%` }"></div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-bold flex items-center gap-1.5">
              <Zap class="w-3.5 h-3.5 text-amber-400" /> Tài khoản hoạt động
            </span>
            <span class="font-extrabold text-amber-300">{{ authStore.users.length }} Users</span>
          </div>
          <div class="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 w-full"></div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-bold flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5 text-indigo-400" /> Đã quyết toán
            </span>
            <span class="font-extrabold text-indigo-300">{{ formatCurrency(settledVolume, 'VND', locale) }}</span>
          </div>
          <div class="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500" :style="{ width: `${settlementRate}%` }"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Analytics Metric Cards Grid (Premium Glow Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Total Users Card -->
      <div
        @click="showUserManagement = true"
        class="glass-card p-5 cursor-pointer border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-brand-500/60 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 group rounded-2xl relative overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_users') }}</span>
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{{ adminStore.systemMetrics.totalUsers }}</span>
            <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp class="w-3.5 h-3.5" /> +100%
            </span>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{{ t('admin.metric_accounts') }}</span>
        </div>
      </div>

      <!-- Total Meals Card -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group rounded-2xl relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_meals') }}</span>
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <Utensils class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{{ adminStore.systemMetrics.totalMeals }}</span>
            <span class="text-xs font-bold text-indigo-500 flex items-center gap-0.5">
              <BarChart3 class="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{{ t('admin.metric_created') }}</span>
        </div>
      </div>

      <!-- Total Volume Card -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group rounded-2xl relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_volume') }}</span>
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
            {{ formatCurrency(adminStore.systemMetrics.totalVolume, 'VND', locale) }}
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{{ t('admin.metric_volume') }}</span>
        </div>
      </div>

      <!-- Unpaid Debt Card -->
      <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-rose-500/60 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group rounded-2xl relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_unpaid') }}</span>
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 truncate">
            {{ formatCurrency(adminStore.systemMetrics.totalUnpaid, 'VND', locale) }}
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">{{ t('admin.metric_pending') }}</span>
        </div>
      </div>

    </div>

    <!-- Admin Cross-User Debt Matrix Table -->
    <DebtMatrixTable />

    <!-- User Management Modal -->
    <UserManagementModal :show="showUserManagement" @close="showUserManagement = false" />
  </div>
</template>
