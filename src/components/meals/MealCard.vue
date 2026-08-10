<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { Calendar, Users, Receipt, UserCheck } from 'lucide-vue-next'

const props = defineProps({
  meal: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t } = useI18n()
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
    class="glass-card glass-card-hover p-4 cursor-pointer flex flex-col justify-between space-y-3 border border-slate-200/80 dark:border-slate-700/60 group overflow-hidden"
  >
    <!-- Meal Photo Thumbnail (If available) -->
    <div v-if="meal.receiptUrl" class="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-950 shrink-0 relative">
      <img :src="meal.receiptUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" :alt="meal.title" />
      <span
        v-if="group"
        class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-brand-300 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-md"
      >
        <img
          :src="group.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop'"
          class="w-3.5 h-3.5 rounded-full object-cover"
        />
        <span>{{ group.name }}</span>
      </span>
    </div>

    <div class="space-y-2">
      <!-- Title & Group Tag (if no thumbnail overlay) -->
      <div class="flex items-start justify-between gap-2">
        <h4 class="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-300 transition-colors line-clamp-1">
          {{ meal.title }}
        </h4>
        <span
          v-if="group && !meal.receiptUrl"
          class="shrink-0 bg-brand-50 border border-brand-200 text-brand-700 dark:bg-slate-900 dark:border-slate-700 dark:text-brand-300 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5"
        >
          <img
            :src="group.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop'"
            class="w-3.5 h-3.5 rounded-full object-cover"
          />
          <span>{{ group.name }}</span>
        </span>
      </div>

      <!-- Amount Display -->
      <div class="flex items-baseline gap-1.5">
        <span class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {{ meal.totalAmount.toLocaleString() }}
        </span>
        <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
          {{ meal.currency }}
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400 ml-2">
          ({{ meal.splitType === 'equal' ? t('meals.equal_split') : t('meals.custom_split') }})
        </span>
      </div>
    </div>

    <!-- Paid by & Date -->
    <div class="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-2">
        <img :src="paidBy?.avatar" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
        <span>{{ t('meals.paid_by') }} <strong class="text-slate-800 dark:text-slate-200">{{ paidBy?.name }}</strong></span>
      </div>
      <div class="flex items-center gap-1">
        <Calendar class="w-3.5 h-3.5" />
        <span>{{ formatDate(meal.createdAt) }}</span>
      </div>
    </div>

    <!-- Participants Avatars bar -->
    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center -space-x-2">
        <img
          v-for="pid in meal.participants.slice(0, 4)"
          :key="pid"
          :src="authStore.users.find(u => u.id === pid)?.avatar"
          class="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800"
          :title="authStore.users.find(u => u.id === pid)?.name"
        />
        <span
          v-if="meal.participants.length > 4"
          class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
        >
          +{{ meal.participants.length - 4 }}
        </span>
      </div>
      <span class="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold">
        {{ t('common.details') }} <Receipt class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
