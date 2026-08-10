<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '../stores/admin'
import UserManagementModal from '../components/admin/UserManagementModal.vue'
import { Shield, Users, Utensils, DollarSign, Clock } from 'lucide-vue-next'

const { t } = useI18n()
const adminStore = useAdminStore()

const showUserManagement = ref(false)
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Title & Action -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield class="w-6 h-6 text-amber-500" />
          <span>{{ t('admin.title') }}</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t('admin.sub') }}</p>
      </div>

      <button
        @click="showUserManagement = true"
        class="bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
      >
        <Users class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span>{{ t('admin.user_management') }}</span>
      </button>
    </div>

    <!-- Analytics Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ t('admin.total_users') }}</span>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ adminStore.systemMetrics.totalUsers }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ t('admin.total_meals') }}</span>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ adminStore.systemMetrics.totalMeals }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Utensils class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ t('admin.total_volume') }}</span>
          <div class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {{ adminStore.systemMetrics.totalVolume.toLocaleString() }} VND
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ t('admin.total_unpaid') }}</span>
          <div class="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {{ adminStore.systemMetrics.totalUnpaid.toLocaleString() }} VND
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <Clock class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- User Management Modal -->
    <UserManagementModal :show="showUserManagement" @close="showUserManagement = false" />
  </div>
</template>
