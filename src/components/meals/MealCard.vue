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
    class="glass-card glass-card-hover p-5 cursor-pointer flex flex-col justify-between space-y-4 border border-slate-700/60"
  >
    <div class="space-y-2">
      <!-- Title & Group Tag -->
      <div class="flex items-start justify-between gap-2">
        <h4 class="font-bold text-base text-white hover:text-brand-300 transition-colors line-clamp-1">
          {{ meal.title }}
        </h4>
        <span
          v-if="group"
          class="shrink-0 bg-slate-900 border border-slate-700 text-brand-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
        >
          {{ group.name }}
        </span>
      </div>

      <!-- Amount Display -->
      <div class="flex items-baseline gap-1.5">
        <span class="text-2xl font-extrabold text-emerald-400">
          {{ meal.totalAmount.toLocaleString() }}
        </span>
        <span class="text-xs font-semibold text-emerald-300 uppercase">
          {{ meal.currency }}
        </span>
        <span class="text-xs text-slate-400 ml-2">
          ({{ meal.splitType === 'equal' ? t('meals.equal_split') : t('meals.custom_split') }})
        </span>
      </div>
    </div>

    <!-- Paid by & Date -->
    <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
      <div class="flex items-center gap-2">
        <img :src="paidBy?.avatar" class="w-5 h-5 rounded-full bg-slate-800" />
        <span>{{ t('meals.paid_by') }} <strong class="text-slate-200">{{ paidBy?.name }}</strong></span>
      </div>
      <div class="flex items-center gap-1">
        <Calendar class="w-3.5 h-3.5" />
        <span>{{ formatDate(meal.createdAt) }}</span>
      </div>
    </div>

    <!-- Participants Avatars bar -->
    <div class="flex items-center justify-between text-xs text-slate-400">
      <div class="flex items-center -space-x-2">
        <img
          v-for="pid in meal.participants.slice(0, 4)"
          :key="pid"
          :src="authStore.users.find(u => u.id === pid)?.avatar"
          class="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800"
          :title="authStore.users.find(u => u.id === pid)?.name"
        />
        <span
          v-if="meal.participants.length > 4"
          class="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] text-slate-300 flex items-center justify-center font-bold"
        >
          +{{ meal.participants.length - 4 }}
        </span>
      </div>
      <span class="flex items-center gap-1 text-brand-400 font-medium">
        {{ t('common.details') }} <Receipt class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
