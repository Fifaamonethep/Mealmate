<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMealsStore } from '../stores/meals'
import { useAuthStore } from '../stores/auth'
import { useDebtsStore } from '../stores/debts'
import { useGroupsStore } from '../stores/groups'
import { useToastStore } from '../stores/toast'
import Badge from '../components/common/Badge.vue'
import ReviewSlipModal from '../components/debts/ReviewSlipModal.vue'
import { ArrowLeft, Calendar, Receipt, Users, CheckCircle2, Crown, ShieldCheck, Eye, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const mealsStore = useMealsStore()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const groupsStore = useGroupsStore()
const toastStore = useToastStore()

const selectedPaymentToReview = ref(null)

const meal = computed(() => mealsStore.getMealById(route.params.id))
const paidBy = computed(() => meal.value ? authStore.users.find(u => u.id === meal.value.paidById) : null)
const group = computed(() => meal.value?.groupId ? groupsStore.getGroupById(meal.value.groupId) : null)

const isLeaderOrCreditor = computed(() => {
  if (!meal.value) return false
  const isLeader = group.value && group.value.ownerId === authStore.currentUserId
  const isCreditor = meal.value.paidById === authStore.currentUserId
  const isAdmin = authStore.currentUser?.role === 'admin'
  return isLeader || isCreditor || isAdmin
})

const mealPayments = computed(() => {
  if (!meal.value) return []
  return debtsStore.payments.filter(p => p.mealId === meal.value.id)
})

function handleForceConfirm(paymentId) {
  debtsStore.confirmPayment(paymentId)
  toastStore.showToast(t('meals.confirm_success_leader'), 'success')
}

function handleDeleteMeal() {
  if (!meal.value) return
  if (confirm('Bạn có chắc chắn muốn xóa bữa ăn này không? Toàn bộ khoản nợ liên quan sẽ bị xóa.')) {
    mealsStore.deleteMeal(meal.value.id)
    toastStore.showToast('Đã xóa bữa ăn thành công!', 'info')
    router.push('/meals')
  }
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="meal" class="max-w-4xl mx-auto space-y-6 pb-12">
    
    <!-- Back button & Delete button -->
    <div class="flex items-center justify-between">
      <button @click="router.back()" class="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
      </button>

      <button
        v-if="isLeaderOrCreditor"
        @click="handleDeleteMeal"
        class="bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>Xóa bữa ăn</span>
      </button>
    </div>

    <!-- Header Card -->
    <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span v-if="group" class="bg-brand-50 border border-brand-200 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30 text-xs font-semibold px-3 py-1 rounded-full">
            {{ group.name }}
          </span>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{{ meal.title }}</h1>
          <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4 text-slate-400" />
              {{ formatDate(meal.createdAt) }}
            </span>
            <span>•</span>
            <span>{{ t('meals.detail_method') }} <strong>{{ meal.splitType === 'equal' ? t('meals.equal_split') : t('meals.custom_split') }}</strong></span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('meals.detail_total') }}</span>
          <div class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {{ meal.totalAmount.toLocaleString() }} {{ meal.currency }}
          </div>
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Receipt Photo -->
      <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Receipt class="w-4 h-4 text-brand-600 dark:text-brand-400" /> {{ t('meals.detail_receipt') }}
        </span>
        <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-3/4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
          <img :src="meal.receiptUrl" class="w-full h-full object-cover" alt="Receipt" />
        </div>
      </div>

      <!-- Creditor & Participants Breakdown -->
      <div class="md:col-span-2 glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
        
        <!-- Paid by Creditor info -->
        <div class="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="paidBy?.avatar" class="w-10 h-10 rounded-full border-2 border-brand-500/50 bg-slate-200 dark:bg-slate-800" />
            <div>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{{ t('meals.detail_creditor_label') }}</span>
              <div class="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>{{ paidBy?.name }}</span>
                <span v-if="group && group.ownerId === paidBy?.id" class="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 font-bold">
                  <Crown class="w-3 h-3 text-amber-500 dark:text-amber-400" /> {{ t('groups.leader_badge') }}
                </span>
              </div>
            </div>
          </div>
          <span class="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            Creditor
          </span>
        </div>

        <!-- Participants split table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users class="w-4 h-4 text-brand-600 dark:text-brand-400" /> {{ t('meals.detail_breakdown') }}
            </h4>
            <span v-if="isLeaderOrCreditor" class="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/30 font-semibold flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-amber-500" /> Quyền Quản Lý (Leader / Creditor)
            </span>
          </div>

          <div class="divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <!-- Creditor share -->
            <div class="p-3.5 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <img :src="paidBy?.avatar" class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ paidBy?.name }}</span>
                <span v-if="group && group.ownerId === paidBy?.id" class="text-[10px] text-amber-500">👑</span>
              </div>
              <span class="font-bold text-slate-500 dark:text-slate-400">{{ t('meals.detail_advanced_all') }}</span>
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
                  class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800"
                />
                <span class="font-semibold text-slate-800 dark:text-slate-200">
                  {{ authStore.users.find(u => u.id === p.debtorId)?.name }}
                </span>
                <span v-if="group && group.ownerId === p.debtorId" class="text-[10px] text-amber-500">👑</span>
              </div>

              <div class="flex items-center gap-3">
                <span class="font-bold text-slate-900 dark:text-slate-100">
                  {{ p.amount.toLocaleString() }} {{ meal.currency }}
                </span>
                
                <Badge :status="p.status" />

                <!-- Action buttons for Leader / Creditor -->
                <template v-if="isLeaderOrCreditor && p.status !== 'confirmed'">
                  <button
                    v-if="p.status === 'slip_sent'"
                    @click="selectedPaymentToReview = p"
                    class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 flex items-center gap-1 font-semibold transition-all"
                  >
                    <Eye class="w-3.5 h-3.5" /> {{ t('debts.view_slip') }}
                  </button>

                  <button
                    v-else
                    @click="handleForceConfirm(p.id)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 font-semibold transition-all"
                    :title="t('debts.btn_confirm_paid')"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" /> {{ t('common.confirm') }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Slip Modal -->
    <ReviewSlipModal
      :show="!!selectedPaymentToReview"
      :payment="selectedPaymentToReview"
      @close="selectedPaymentToReview = null"
    />
  </div>
</template>
