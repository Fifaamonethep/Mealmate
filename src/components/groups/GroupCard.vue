<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useMealsStore } from '../../stores/meals'
import { Users, Receipt, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const mealsStore = useMealsStore()

const groupMembers = computed(() => {
  return authStore.users.filter(u => props.group.members.includes(u.id))
})

const groupMeals = computed(() => {
  return mealsStore.meals.filter(m => m.groupId === props.group.id)
})

const totalExpenses = computed(() => {
  return groupMeals.value.reduce((sum, m) => sum + Number(m.totalAmount || 0), 0)
})
</script>

<template>
  <div
    @click="router.push(`/groups/${group.id}`)"
    class="glass-card glass-card-hover p-5 cursor-pointer border border-slate-700/60 space-y-4 flex flex-col justify-between"
  >
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-start justify-between">
        <h3 class="font-bold text-lg text-white hover:text-brand-300 transition-colors">{{ group.name }}</h3>
        <div class="bg-brand-500/10 border border-brand-500/30 p-2 rounded-xl text-brand-400 shrink-0">
          <Users class="w-5 h-5" />
        </div>
      </div>
      <p class="text-xs text-slate-400 line-clamp-2">
        {{ group.description || '' }}
      </p>
    </div>

    <!-- Expenses & Meals Stats -->
    <div class="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
      <div>
        <span class="text-slate-400">{{ t('groups.total_expenses') }}</span>
        <div class="font-extrabold text-emerald-400 text-sm mt-0.5">
          {{ totalExpenses.toLocaleString() }} VND
        </div>
      </div>
      <div>
        <span class="text-slate-400">{{ t('groups.total_meals_count') }}</span>
        <div class="font-bold text-slate-200 text-sm mt-0.5 flex items-center gap-1">
          <Receipt class="w-3.5 h-3.5 text-brand-400" />
          <span>{{ groupMeals.length }}</span>
        </div>
      </div>
    </div>

    <!-- Members Avatars -->
    <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
      <div class="flex items-center -space-x-1.5">
        <img
          v-for="u in groupMembers.slice(0, 4)"
          :key="u.id"
          :src="u.avatar"
          class="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800"
          :title="u.name"
        />
        <span
          v-if="groupMembers.length > 4"
          class="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] text-slate-300 flex items-center justify-center font-bold"
        >
          +{{ groupMembers.length - 4 }}
        </span>
      </div>

      <span class="flex items-center gap-1 text-brand-400 font-medium hover:text-brand-300">
        {{ t('groups.group_detail_title') }} <ArrowRight class="w-3.5 h-3.5" />
      </span>
    </div>
  </div>
</template>
