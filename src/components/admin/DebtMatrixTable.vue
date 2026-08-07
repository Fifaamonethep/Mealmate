<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'

const { t } = useI18n()
const authStore = useAuthStore()
const adminStore = useAdminStore()
</script>

<template>
  <div class="glass-card p-6 border border-slate-700/60 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-extrabold text-lg text-white">{{ t('admin.matrix_title') }}</h3>
        <p class="text-xs text-slate-400">{{ t('admin.matrix_sub') }}</p>
      </div>
      <span class="text-xs bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full border border-brand-500/30 font-semibold">
        System Matrix
      </span>
    </div>

    <!-- Matrix Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
      <table class="w-full text-xs text-left text-slate-300">
        <thead class="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase">
          <tr>
            <th class="p-3 border-r border-slate-800">{{ t('groups.debtor_vs_creditor') }}</th>
            <th
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-800 min-w-[110px]"
            >
              <div class="flex flex-col items-center gap-1">
                <img :src="creditor.avatar" class="w-5 h-5 rounded-full bg-slate-800" />
                <span>{{ creditor.name.split(' ')[0] }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="debtor in authStore.users"
            :key="debtor.id"
            class="border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors"
          >
            <!-- Debtor Row Header -->
            <td class="p-3 border-r border-slate-800 font-semibold bg-slate-900/40 text-slate-200">
              <div class="flex items-center gap-2">
                <img :src="debtor.avatar" class="w-5 h-5 rounded-full bg-slate-800" />
                <span>{{ debtor.name }}</span>
              </div>
            </td>

            <!-- Amount Cells -->
            <td
              v-for="creditor in authStore.users"
              :key="creditor.id"
              class="p-3 text-center border-r border-slate-800 font-medium"
            >
              <template v-if="debtor.id === creditor.id">
                <span class="text-slate-600 font-normal">-</span>
              </template>
              <template v-else-if="adminStore.debtMatrix[debtor.id] && adminStore.debtMatrix[debtor.id][creditor.id] > 0">
                <span class="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md inline-block">
                  {{ adminStore.debtMatrix[debtor.id][creditor.id].toLocaleString() }}
                </span>
              </template>
              <template v-else>
                <span class="text-slate-600">0</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
