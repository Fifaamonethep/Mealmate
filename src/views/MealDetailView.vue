<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMealsStore } from '../stores/meals'
import { useAuthStore } from '../stores/auth'
import { useDebtsStore } from '../stores/debts'
import { useGroupsStore } from '../stores/groups'
import Badge from '../components/common/Badge.vue'
import { ArrowLeft, Calendar, Receipt, Users, CheckCircle2, Clock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const mealsStore = useMealsStore()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const groupsStore = useGroupsStore()

const meal = computed(() => mealsStore.getMealById(route.params.id))
const paidBy = computed(() => meal.value ? authStore.users.find(u => u.id === meal.value.paidById) : null)
const group = computed(() => meal.value?.groupId ? groupsStore.getGroupById(meal.value.groupId) : null)

const mealPayments = computed(() => {
  if (!meal.value) return []
  return debtsStore.payments.filter(p => p.mealId === meal.value.id)
})

function formatDate(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="meal" class="max-w-4xl mx-auto space-y-6 pb-12">
    
    <!-- Back button -->
    <button @click="router.back()" class="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>

    <!-- Header Card -->
    <div class="glass-card p-6 border border-slate-700/60 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span v-if="group" class="bg-brand-500/20 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full border border-brand-500/30">
            {{ group.name }}
          </span>
          <h1 class="text-2xl font-extrabold text-white mt-2">{{ meal.title }}</h1>
          <div class="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4 text-slate-500" />
              {{ formatDate(meal.createdAt) }}
            </span>
            <span>•</span>
            <span>{{ t('meals.detail_method') }} <strong>{{ meal.splitType === 'equal' ? t('meals.equal_split') : t('meals.custom_split') }}</strong></span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-xs text-slate-400">{{ t('meals.detail_total') }}</span>
          <div class="text-3xl font-extrabold text-emerald-400">
            {{ meal.totalAmount.toLocaleString() }} {{ meal.currency }}
          </div>
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Receipt Photo -->
      <div class="glass-card p-4 border border-slate-700/60 space-y-2">
        <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Receipt class="w-4 h-4 text-brand-400" /> {{ t('meals.detail_receipt') }}
        </span>
        <div class="rounded-xl overflow-hidden border border-slate-700 aspect-3/4 bg-slate-950 flex items-center justify-center">
          <img :src="meal.receiptUrl" class="w-full h-full object-cover" alt="Receipt" />
        </div>
      </div>

      <!-- Creditor & Participants Breakdown -->
      <div class="md:col-span-2 glass-card p-5 border border-slate-700/60 space-y-4">
        
        <!-- Paid by Creditor info -->
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="paidBy?.avatar" class="w-10 h-10 rounded-full border-2 border-brand-500/50 bg-slate-800" />
            <div>
              <span class="text-[11px] text-slate-400 uppercase font-semibold">{{ t('meals.detail_creditor_label') }}</span>
              <div class="font-bold text-slate-100 text-sm">{{ paidBy?.name }}</div>
            </div>
          </div>
          <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            Creditor
          </span>
        </div>

        <!-- Participants split table -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users class="w-4 h-4 text-brand-400" /> {{ t('meals.detail_breakdown') }}
          </h4>

          <div class="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            
            <!-- Creditor share -->
            <div class="p-3.5 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <img :src="paidBy?.avatar" class="w-6 h-6 rounded-full bg-slate-800" />
                <span class="font-semibold text-slate-200">{{ paidBy?.name }}</span>
              </div>
              <span class="font-bold text-slate-400">{{ t('meals.detail_advanced_all') }}</span>
            </div>

            <!-- Debtors shares -->
            <div
              v-for="p in mealPayments"
              :key="p.id"
              class="p-3.5 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2">
                <img
                  :src="authStore.users.find(u => u.id === p.debtorId)?.avatar"
                  class="w-6 h-6 rounded-full bg-slate-800"
                />
                <span class="font-semibold text-slate-200">
                  {{ authStore.users.find(u => u.id === p.debtorId)?.name }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <span class="font-bold text-slate-100">
                  {{ p.amount.toLocaleString() }} {{ meal.currency }}
                </span>
                <Badge :status="p.status" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
