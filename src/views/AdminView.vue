<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useDebtsStore } from '../stores/debts'
import { useAdminStore } from '../stores/admin'
import DebtMatrixTable from '../components/admin/DebtMatrixTable.vue'
import UserManagementModal from '../components/admin/UserManagementModal.vue'
import Badge from '../components/common/Badge.vue'
import { Shield, Users, Utensils, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const adminStore = useAdminStore()

const showUserManagement = ref(false)

function handleForceConfirm(paymentId) {
  debtsStore.forceAdminAction(paymentId, 'confirmed')
}

function handleForceReject(paymentId) {
  debtsStore.forceAdminAction(paymentId, 'rejected', 'Admin force reject')
}
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Title & Action -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
          <Shield class="w-6 h-6 text-amber-400" />
          <span>{{ t('admin.title') }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('admin.sub') }}</p>
      </div>

      <button
        @click="showUserManagement = true"
        class="bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10"
      >
        <Users class="w-4 h-4 text-amber-400" />
        <span>{{ t('admin.user_management') }}</span>
      </button>
    </div>

    <!-- Analytics Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 border border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 font-semibold">{{ t('admin.total_users') }}</span>
          <div class="text-2xl font-extrabold text-white mt-1">{{ adminStore.systemMetrics.totalUsers }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 font-semibold">{{ t('admin.total_meals') }}</span>
          <div class="text-2xl font-extrabold text-white mt-1">{{ adminStore.systemMetrics.totalMeals }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
          <Utensils class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 font-semibold">{{ t('admin.total_volume') }}</span>
          <div class="text-xl font-extrabold text-emerald-400 mt-1">
            {{ adminStore.systemMetrics.totalVolume.toLocaleString() }} VND
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <div class="glass-card p-4 border border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 font-semibold">{{ t('admin.total_unpaid') }}</span>
          <div class="text-xl font-extrabold text-rose-400 mt-1">
            {{ adminStore.systemMetrics.totalUnpaid.toLocaleString() }} VND
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
          <Clock class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Debt Cross Matrix Table -->
    <DebtMatrixTable />

    <!-- Manual Debt Dispute Management -->
    <div class="glass-card p-6 border border-slate-700/60 space-y-4">
      <h3 class="font-extrabold text-lg text-white">{{ t('admin.dispute_title') }}</h3>
      <p class="text-xs text-slate-400">{{ t('admin.dispute_sub') }}</p>

      <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th class="p-3">{{ t('admin.debtor') }}</th>
              <th class="p-3">{{ t('admin.creditor') }}</th>
              <th class="p-3">{{ t('admin.amount') }}</th>
              <th class="p-3">{{ t('admin.status') }}</th>
              <th class="p-3 text-right">{{ t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in debtsStore.payments"
              :key="p.id"
              class="border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors"
            >
              <td class="p-3 font-semibold text-slate-200">
                {{ authStore.users.find(u => u.id === p.debtorId)?.name }}
              </td>
              <td class="p-3 font-semibold text-slate-200">
                {{ authStore.users.find(u => u.id === p.creditorId)?.name }}
              </td>
              <td class="p-3 font-extrabold text-emerald-400">
                {{ p.amount.toLocaleString() }} VND
              </td>
              <td class="p-3">
                <Badge :status="p.status" />
              </td>
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleForceConfirm(p.id)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 font-semibold"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" /> {{ t('admin.force_confirm') }}
                  </button>

                  <button
                    @click="handleForceReject(p.id)"
                    class="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 flex items-center gap-1 font-semibold"
                  >
                    <XCircle class="w-3.5 h-3.5" /> {{ t('admin.force_reject') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Management Modal -->
    <UserManagementModal :show="showUserManagement" @close="showUserManagement = false" />
  </div>
</template>
