<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { useMealsStore } from '../stores/meals'
import { useDebtsStore } from '../stores/debts'
import { useToastStore } from '../stores/toast'
import MealCard from '../components/meals/MealCard.vue'
import { Users, ArrowLeft, UserPlus, UserX, Receipt, DollarSign } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()
const mealsStore = useMealsStore()
const debtsStore = useDebtsStore()
const toastStore = useToastStore()

const searchMemberInput = ref('')
const memberError = ref('')

const group = computed(() => groupsStore.getGroupById(route.params.id))

const groupMembers = computed(() => {
  if (!group.value) return []
  return authStore.users.filter(u => group.value.members.includes(u.id))
})

const groupMeals = computed(() => {
  if (!group.value) return []
  return mealsStore.meals.filter(m => m.groupId === group.value.id)
})

const totalExpenses = computed(() => {
  return groupMeals.value.reduce((sum, m) => sum + Number(m.totalAmount || 0), 0)
})

// Calculate net balance matrix inside this group
const groupDebtMatrix = computed(() => {
  if (!group.value) return {}
  const matrix = {}
  groupMembers.value.forEach(u => {
    matrix[u.id] = {}
    groupMembers.value.forEach(o => matrix[u.id][o.id] = 0)
  })

  const groupMealIds = groupMeals.value.map(m => m.id)
  debtsStore.payments.forEach(p => {
    if (groupMealIds.includes(p.mealId) && (p.status === 'pending' || p.status === 'slip_sent')) {
      if (matrix[p.debtorId] && matrix[p.debtorId][p.creditorId] !== undefined) {
        matrix[p.debtorId][p.creditorId] += Number(p.amount)
      }
    }
  })
  return matrix
})

function handleAddMember() {
  memberError.value = ''
  if (!searchMemberInput.value || !group.value) return

  const query = searchMemberInput.value.trim().toLowerCase()
  const foundUser = authStore.users.find(
    u => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  )

  if (!foundUser) {
    memberError.value = 'Chưa tìm thấy người dùng!'
    return
  }

  if (group.value.members.includes(foundUser.id)) {
    memberError.value = 'User already in group!'
    return
  }

  groupsStore.addMember(group.value.id, foundUser.id)
  toastStore.showToast(`Added ${foundUser.name}`, 'success')
  searchMemberInput.value = ''
}

function handleRemoveMember(userId) {
  if (!group.value) return
  if (group.value.members.length <= 1) {
    toastStore.showToast('Group must have at least 1 member!', 'warning')
    return
  }
  groupsStore.removeMember(group.value.id, userId)
  toastStore.showToast('Removed member', 'info')
}
</script>

<template>
  <div v-if="group" class="space-y-6 pb-12">
    
    <!-- Back button -->
    <button @click="router.back()" class="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4" /> {{ t('groups.title') }}
    </button>

    <!-- Header Banner -->
    <div class="glass-card p-6 border border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-brand-400 font-semibold text-xs uppercase">
            <Users class="w-4 h-4" /> {{ t('groups.group_detail_title') }}
          </div>
          <h1 class="text-2xl font-extrabold text-white mt-1">{{ group.name }}</h1>
          <p class="text-xs text-slate-400 mt-1">{{ group.description || '' }}</p>
        </div>

        <div class="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span class="text-slate-400">{{ t('groups.total_expenses') }}</span>
            <div class="font-extrabold text-emerald-400 text-base">
              {{ totalExpenses.toLocaleString() }} VND
            </div>
          </div>
          <div class="pl-4 border-l border-slate-800">
            <span class="text-slate-400">{{ t('groups.total_meals_count') }}</span>
            <div class="font-bold text-slate-200 text-base">
              {{ groupMeals.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Members Management Card -->
    <div class="glass-card p-5 border border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 class="font-extrabold text-base text-white flex items-center gap-2">
          <Users class="w-4 h-4 text-brand-400" /> {{ t('groups.members_label') }} ({{ groupMembers.length }})
        </h3>

        <!-- Add member form -->
        <form @submit.prevent="handleAddMember" class="flex items-center gap-2">
          <input
            v-model="searchMemberInput"
            type="text"
            :placeholder="t('groups.member_search_placeholder')"
            class="glass-input text-xs py-2 px-3 w-48 sm:w-64"
          />
          <button type="submit" class="glow-button text-xs py-2 px-3.5 flex items-center gap-1 shrink-0">
            <UserPlus class="w-3.5 h-3.5" /> {{ t('groups.btn_add') }}
          </button>
        </form>
      </div>

      <p v-if="memberError" class="text-xs text-rose-400 font-medium">{{ memberError }}</p>

      <!-- Member Pill List -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
        <div
          v-for="u in groupMembers"
          :key="u.id"
          class="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-200"
        >
          <img :src="u.avatar" class="w-5 h-5 rounded-full bg-slate-800" />
          <span class="font-semibold">{{ u.name }}</span>
          <span class="text-[10px] text-slate-400">(@{{ u.username }})</span>
          <button
            @click="handleRemoveMember(u.id)"
            class="text-slate-500 hover:text-rose-400 ml-1 transition-colors"
            title="Remove from group"
          >
            <UserX class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Group Net Debt Matrix -->
    <div class="glass-card p-5 border border-slate-700/60 space-y-3">
      <h3 class="font-extrabold text-sm text-white">{{ t('groups.group_matrix_title') }}</h3>
      <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th class="p-2.5">{{ t('groups.debtor_vs_creditor') }}</th>
              <th v-for="c in groupMembers" :key="c.id" class="p-2.5 text-center">
                {{ c.name.split(' ')[0] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in groupMembers" :key="d.id" class="border-b border-slate-800/80">
              <td class="p-2.5 font-semibold text-slate-200 bg-slate-900/40">
                {{ d.name }}
              </td>
              <td v-for="c in groupMembers" :key="c.id" class="p-2.5 text-center font-medium">
                <span v-if="d.id === c.id" class="text-slate-600">-</span>
                <span v-else-if="groupDebtMatrix[d.id] && groupDebtMatrix[d.id][c.id] > 0" class="text-rose-400 font-bold">
                  {{ groupDebtMatrix[d.id][c.id].toLocaleString() }}
                </span>
                <span v-else class="text-slate-600">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Group Meals History -->
    <div class="space-y-4">
      <h3 class="font-extrabold text-lg text-white flex items-center gap-2">
        <Receipt class="w-5 h-5 text-brand-400" /> {{ t('groups.group_meals') }} ({{ groupMeals.length }})
      </h3>

      <div v-if="groupMeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MealCard v-for="m in groupMeals" :key="m.id" :meal="m" />
      </div>

      <div v-else class="glass-card p-8 text-center text-slate-400 text-xs">
        {{ t('meals.empty') }}
      </div>
    </div>
  </div>
</template>
