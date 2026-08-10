<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'
import { formatCurrency } from '../../utils/currency'
import { Shield, Sparkles, Grid } from 'lucide-vue-next'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const adminStore = useAdminStore()
</script>

<template>
  <div class="glass-card p-6 border border-slate-700/60 space-y-5 rounded-3xl bg-slate-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
    
    <!-- Background Light Accent -->
    <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
      <div>
        <div class="flex items-center gap-2 text-brand-400 font-extrabold text-xs uppercase tracking-wider">
          <Grid class="w-4 h-4 text-brand-400" />
          <span>{{ t('groups.group_matrix_title') }}</span>
        </div>
        <h3 class="font-extrabold text-xl text-white mt-1">{{ t('admin.matrix_title') }}</h3>
        <p class="text-xs text-slate-400 mt-0.5">{{ t('admin.matrix_sub') }}</p>
      </div>

      <span class="bg-brand-500/15 text-brand-300 px-3.5 py-1.5 rounded-full border border-brand-500/30 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm">
        <Sparkles class="w-3.5 h-3.5 text-brand-400" /> System Live Matrix
      </span>
    </div>

    <!-- Matrix Table -->
    <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-inner relative z-10">
      <table class="w-full text-xs text-left text-slate-300">
        <thead class="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
          <tr>
            <th class="p-4 border-r border-slate-800 bg-slate-900/95 sticky left-0 z-20">{{ t('groups.debtor_vs_creditor') }}</th>
            <th
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-800 min-w-[120px]"
            >
              <div class="flex flex-col items-center gap-1.5">
                <img :src="creditor.avatar" class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover shadow-sm" />
                <span class="font-bold text-slate-200 text-xs">{{ creditor.name.split(' ')[0] }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="debtor in authStore.users"
            :key="debtor.id"
            class="border-b border-slate-800/80 hover:bg-slate-900/80 transition-colors"
          >
            <!-- Debtor Row Header -->
            <td class="p-3.5 border-r border-slate-800 font-semibold bg-slate-900/60 text-slate-200 sticky left-0 z-10 backdrop-blur-md">
              <div class="flex items-center gap-2.5">
                <img :src="debtor.avatar" class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0" />
                <span class="font-bold text-slate-100">{{ debtor.name }}</span>
              </div>
            </td>

            <!-- Amount Cells -->
            <td
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-800 font-medium"
            >
              <template v-if="debtor.id === creditor.id">
                <span class="text-slate-700 font-normal text-sm">•</span>
              </template>
              <template v-else-if="adminStore.debtMatrix[debtor.id] && adminStore.debtMatrix[debtor.id][creditor.id] > 0">
                <span class="text-rose-400 font-extrabold bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg inline-block shadow-sm">
                  {{ formatCurrency(adminStore.debtMatrix[debtor.id][creditor.id], 'VND', locale) }}
                </span>
              </template>
              <template v-else>
                <span class="text-slate-600 font-bold">0</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
