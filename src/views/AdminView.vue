<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '../stores/admin'
import UserManagementModal from '../components/admin/UserManagementModal.vue'
import { Shield, Users, Utensils, DollarSign, Clock, Sparkles, Activity, UserCheck, ChevronRight } from 'lucide-vue-next'

const { t } = useI18n()
const adminStore = useAdminStore()

const showUserManagement = ref(false)
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Admin Hero Banner -->
    <div class="glass-card p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 rounded-2xl shadow-xl text-white relative overflow-hidden space-y-4">
      <div class="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Shield class="w-3.5 h-3.5 text-amber-400" /> Admin Portal
            </span>
            <span class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {{ t('admin.user_status') }}: Active
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <span>{{ t('admin.title') }}</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{{ t('admin.sub') }}</p>
        </div>

        <button
          @click="showUserManagement = true"
          class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 shrink-0 transform active:scale-95"
        >
          <UserCheck class="w-4.5 h-4.5 text-slate-950" />
          <span>{{ t('admin.user_management') }}</span>
          <ChevronRight class="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>

    <!-- Analytics Metric Cards Grid (Responsive 2x2 on Mobile) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      <!-- Total Users -->
      <div
        @click="showUserManagement = true"
        class="glass-card glass-card-hover p-4 cursor-pointer border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-brand-500/40 transition-all duration-300"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_users') }}</span>
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Users class="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.systemMetrics.totalUsers }}</div>
          <span class="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5 block">Accounts</span>
        </div>
      </div>

      <!-- Total Meals -->
      <div class="glass-card glass-card-hover p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all duration-300">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_meals') }}</span>
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Utensils class="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.systemMetrics.totalMeals }}</div>
          <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 block">Created</span>
        </div>
      </div>

      <!-- Total Volume -->
      <div class="glass-card glass-card-hover p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all duration-300">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_volume') }}</span>
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <DollarSign class="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {{ adminStore.systemMetrics.totalVolume.toLocaleString() }} VND
          </div>
          <span class="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5 block">Volume</span>
        </div>
      </div>

      <!-- Unpaid Debt -->
      <div class="glass-card glass-card-hover p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-rose-500/40 transition-all duration-300">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ t('admin.total_unpaid') }}</span>
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Clock class="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 truncate">
            {{ adminStore.systemMetrics.totalUnpaid.toLocaleString() }} VND
          </div>
          <span class="text-[11px] text-rose-700 dark:text-rose-300 font-semibold mt-0.5 block">Pending</span>
        </div>
      </div>

    </div>

    <!-- User Management Modal -->
    <UserManagementModal :show="showUserManagement" @close="showUserManagement = false" />
  </div>
</template>
