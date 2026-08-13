<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'
import { formatCurrency } from '../../utils/currency'
import {
  Shield,
  Sparkles,
  Grid,
  ArrowRight,
  User,
  CheckCircle2,
  ListFilter,
  Receipt,
  Layers,
  AlertCircle
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const viewMode = ref('cards') // 'cards' | 'table'

const activeDebtsList = computed(() => {
  const list = []
  const matrix = adminStore.debtMatrix || {}

  authStore.users.forEach(debtor => {
    authStore.users.forEach(creditor => {
      if (debtor.id !== creditor.id && matrix[debtor.id] && matrix[debtor.id][creditor.id] > 0) {
        list.push({
          id: `${debtor.id}-${creditor.id}`,
          debtor,
          creditor,
          amount: matrix[debtor.id][creditor.id]
        })
      }
    })
  })

  return list
})
</script>

<template>
  <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
    
    <!-- Background Light Accent -->
    <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Section Header & Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-slate-200/80 dark:border-slate-800 pb-5">
      <div>
        <div class="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
          <Grid class="w-4 h-4 text-brand-500" />
          <span>{{ t('groups.group_matrix_title') }}</span>
        </div>
        <h3 class="font-black text-xl text-slate-900 dark:text-white mt-1">
          {{ t('admin.matrix_title') }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ t('admin.matrix_sub') }}
        </p>
      </div>

      <!-- View Switcher Tabs -->
      <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
        <button
          @click="viewMode = 'cards'"
          :class="[
            'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200',
            viewMode === 'cards'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-md border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span>{{ t('admin.visual_cards') || 'Thẻ Nợ' }}</span>
        </button>

        <button
          @click="viewMode = 'table'"
          :class="[
            'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200',
            viewMode === 'table'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-md border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Grid class="w-4 h-4" />
          <span>{{ t('admin.matrix_grid') || 'Ma Trận' }}</span>
        </button>
      </div>
    </div>

    <!-- MODE 1: VISUAL DEBT CARDS VIEW (Clean & Intuitive) -->
    <div v-if="viewMode === 'cards'" class="space-y-4 relative z-10">
      
      <div v-if="activeDebtsList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in activeDebtsList"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-rose-500/50 hover:shadow-xl transition-all group"
        >
          <!-- Top Row: Debtor -> Creditor -->
          <div class="flex items-center justify-between gap-2">
            <!-- Debtor (Nợ) -->
            <div class="flex items-center gap-2 min-w-0">
              <img :src="item.debtor.avatar" class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-extrabold text-rose-500 block">{{ t('admin.debtor') }}</span>
                <span class="font-bold text-xs text-slate-900 dark:text-white truncate block">{{ item.debtor.name }}</span>
              </div>
            </div>

            <!-- Directional Arrow -->
            <div class="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:translate-x-1 transition-transform">
              <ArrowRight class="w-4 h-4" />
            </div>

            <!-- Creditor (Thu) -->
            <div class="flex items-center gap-2 min-w-0 text-right">
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-extrabold text-emerald-500 block">{{ t('admin.creditor') }}</span>
                <span class="font-bold text-xs text-slate-900 dark:text-white truncate block">{{ item.creditor.name }}</span>
              </div>
              <img :src="item.creditor.avatar" class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
            </div>
          </div>

          <!-- Bottom Row: Amount & Status Badge -->
          <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 text-amber-500" />
              <span>{{ t('debts.status_pending') }}</span>
            </span>

            <span class="text-base font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-xl shadow-sm">
              {{ formatCurrency(item.amount, 'LAK', locale) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty Debts State -->
      <div v-else class="p-10 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-3">
        <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 class="w-7 h-7" />
        </div>
        <h4 class="font-black text-lg text-slate-900 dark:text-white">{{ t('admin.all_settled_title') || 'ທຸກໆໜີ້ສິນໄດ້ຖືກຊຳລະແລ້ວ! 🎉' }}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{{ t('admin.empty_matrix') }}</p>
      </div>

    </div>

    <!-- MODE 2: CLEAN MATRIX GRID TABLE -->
    <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner relative z-10">
      <table class="w-full text-xs text-left text-slate-700 dark:text-slate-300">
        <thead class="bg-slate-100 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
          <tr>
            <th class="p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-900 sticky left-0 z-20 font-black text-slate-900 dark:text-slate-200">
              {{ t('admin.debtor') }} ↓ \ {{ t('admin.creditor') }} →
            </th>
            <th
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-200 dark:border-slate-800 min-w-[120px]"
            >
              <div class="flex flex-col items-center gap-1.5">
                <img :src="creditor.avatar" class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover shadow-sm" />
                <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ creditor.name.split(' ')[0] }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="debtor in authStore.users"
            :key="debtor.id"
            class="border-b border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-900/80 transition-colors"
          >
            <!-- Debtor Row Header -->
            <td class="p-3.5 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-100/80 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 sticky left-0 z-10 backdrop-blur-md">
              <div class="flex items-center gap-2.5">
                <img :src="debtor.avatar" class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover shrink-0" />
                <span class="font-bold truncate">{{ debtor.name }}</span>
              </div>
            </td>

            <!-- Amount Cells -->
            <td
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-200 dark:border-slate-800 font-medium"
            >
              <template v-if="debtor.id === creditor.id">
                <span class="text-slate-400 dark:text-slate-600 font-bold text-xs">-</span>
              </template>
              <template v-else-if="adminStore.debtMatrix[debtor.id] && adminStore.debtMatrix[debtor.id][creditor.id] > 0">
                <span class="text-rose-600 dark:text-rose-400 font-black bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl inline-block shadow-sm">
                  {{ formatCurrency(adminStore.debtMatrix[debtor.id][creditor.id], 'LAK', locale) }}
                </span>
              </template>
              <template v-else>
                <span class="text-slate-400 dark:text-slate-600 font-medium">-</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
