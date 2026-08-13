<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { formatCurrency } from '../../utils/currency'
import { Calendar, Users, Receipt, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  meal: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const paidBy = computed(() => authStore.users.find(u => u.id === props.meal.paidById))
const group = computed(() => props.meal.groupId ? groupsStore.getGroupById(props.meal.groupId) : null)

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div
    @click="router.push(`/meals/${meal.id}`)"
    class="glass-card p-5 cursor-pointer flex flex-col justify-between space-y-4 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-3xl relative overflow-hidden"
  >
    <!-- Meal Photo Thumbnail (If available) -->
    <div v-if="meal.receiptUrl" class="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0 relative">
      <img :src="meal.receiptUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" :alt="meal.title" />
      <span
        v-if="group"
        class="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-indigo-300 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-lg"
      >
        <img
          :src="group.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop'"
          class="w-3.5 h-3.5 rounded-full object-cover"
        />
        <span>{{ group.name }}</span>
      </span>
    </div>

    <div class="space-y-2">
      <!-- Group Badge if no thumbnail -->
      <div v-if="group && !meal.receiptUrl" class="flex items-center">
        <span class="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
          <img
            :src="group.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop'"
            class="w-3.5 h-3.5 rounded-full object-cover"
          />
          <span>{{ group.name }}</span>
        </span>
      </div>

      <!-- Title -->
      <h4 class="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
        {{ meal.title }}
      </h4>

      <!-- Amount Display -->
      <div class="flex items-baseline justify-between gap-2 pt-1">
        <span class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
          {{ formatCurrency(meal.totalAmount, meal.currency, locale) }}
        </span>
        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg">
          {{ meal.splitType === 'equal' ? t('meals.equal_split') : t('meals.custom_split') }}
        </span>
      </div>
    </div>

    <!-- Paid by & Date -->
    <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-2">
        <img :src="paidBy?.avatar" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-white dark:border-slate-700" />
        <span>{{ t('meals.paid_by') }} <strong class="text-slate-800 dark:text-slate-200 font-bold">{{ paidBy?.name }}</strong></span>
      </div>
      <div class="flex items-center gap-1 font-semibold text-[11px]">
        <Calendar class="w-3.5 h-3.5 text-slate-400" />
        <span>{{ formatDate(meal.createdAt) }}</span>
      </div>
    </div>

    <!-- Participants Avatars bar -->
    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
      <div class="flex items-center -space-x-2">
        <img
          v-for="pid in meal.participants.slice(0, 4)"
          :key="pid"
          :src="authStore.users.find(u => u.id === pid)?.avatar"
          class="w-6.5 h-6.5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 object-cover shadow-sm"
          :title="authStore.users.find(u => u.id === pid)?.name"
        />
        <span
          v-if="meal.participants.length > 4"
          class="w-6.5 h-6.5 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
        >
          +{{ meal.participants.length - 4 }}
        </span>
      </div>
      <span class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
        {{ t('common.details') }} <ArrowRight class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
