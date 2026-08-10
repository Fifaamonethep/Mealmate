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
import EditGroupModal from '../components/groups/EditGroupModal.vue'
import { Users, ArrowLeft, UserPlus, UserX, Receipt, Crown, Trash2, Shield, Edit3, LogOut } from 'lucide-vue-next'

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
const showEditGroup = ref(false)

const group = computed(() => groupsStore.getGroupById(route.params.id))

const owner = computed(() => {
  if (!group.value) return null
  return authStore.users.find(u => u.id === group.value.ownerId)
})

const isOwnerOrAdmin = computed(() => {
  if (!group.value) return false
  return authStore.currentUserId === group.value.ownerId || authStore.currentUser?.role === 'admin'
})

const isMemberNotOwner = computed(() => {
  if (!group.value) return false
  return group.value.members.includes(authStore.currentUserId) && authStore.currentUserId !== group.value.ownerId
})

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
    if (groupMealIds.includes(p.mealId) && p.status !== 'confirmed') {
      if (matrix[p.debtorId] && matrix[p.debtorId][p.creditorId] !== undefined) {
        matrix[p.debtorId][p.creditorId] += Number(p.amount)
      }
    }
  })
  return matrix
})

function handleAddMember() {
  if (!isOwnerOrAdmin.value) {
    toastStore.showToast(t('groups.only_leader_can_manage'), 'warning')
    return
  }
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
    memberError.value = 'Thành viên này đã có trong nhóm!'
    return
  }

  groupsStore.addMember(group.value.id, foundUser.id)
  toastStore.showToast(`Đã thêm ${foundUser.name}`, 'success')
  searchMemberInput.value = ''
}

function handleRemoveMember(userId) {
  if (!isOwnerOrAdmin.value) {
    toastStore.showToast(t('groups.only_leader_can_manage'), 'warning')
    return
  }
  if (!group.value) return
  if (userId === group.value.ownerId) {
    toastStore.showToast(t('groups.cannot_remove_leader'), 'warning')
    return
  }
  if (group.value.members.length <= 1) {
    toastStore.showToast(t('groups.min_member_error'), 'warning')
    return
  }
  groupsStore.removeMember(group.value.id, userId)
  toastStore.showToast(t('groups.member_removed_success'), 'info')
}

function handleLeaveGroup() {
  if (!group.value) return
  if (confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) {
    try {
      groupsStore.leaveGroup(group.value.id, authStore.currentUserId)
      toastStore.showToast('Đã rời nhóm thành công!', 'info')
      router.push('/groups')
    } catch (err) {
      toastStore.showToast(err.message, 'warning')
    }
  }
}

function handleDisbandGroup() {
  if (!isOwnerOrAdmin.value) {
    toastStore.showToast(t('groups.only_leader_can_manage'), 'warning')
    return
  }
  if (confirm(t('groups.confirm_disband'))) {
    groupsStore.deleteGroup(group.value.id)
    toastStore.showToast(t('groups.disband_success'), 'info')
    router.push('/groups')
  }
}
</script>

<template>
  <div v-if="group" class="space-y-6 pb-12">
    
    <!-- Back button -->
    <button @click="router.back()" class="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4" /> {{ t('groups.title') }}
    </button>

    <!-- Header Banner -->
    <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Group Representative Avatar -->
          <div class="relative shrink-0">
            <img
              :src="group.avatar || owner?.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop'"
              class="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-md bg-slate-200 dark:bg-slate-800"
              :alt="group.name"
            />
            <div v-if="owner" class="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border border-white dark:border-slate-900 shadow" title="Leader">
              <Crown class="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase">
              <Users class="w-4 h-4" /> {{ t('groups.group_detail_title') }}
            </div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>{{ group.name }}</span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ group.description || '' }}</p>
            <div v-if="owner" class="text-xs text-amber-600 dark:text-amber-300 font-semibold flex items-center gap-1.5 mt-1.5">
              <img :src="owner.avatar" class="w-4 h-4 rounded-full border border-amber-400 object-cover" />
              <span>{{ t('groups.managed_by') }} {{ owner.name }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-4 bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span class="text-slate-500 dark:text-slate-400">{{ t('groups.total_expenses') }}</span>
              <div class="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                {{ totalExpenses.toLocaleString() }} VND
              </div>
            </div>
            <div class="pl-4 border-l border-slate-200 dark:border-slate-800">
              <span class="text-slate-500 dark:text-slate-400">{{ t('groups.total_meals_count') }}</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-base">
                {{ groupMeals.length }}
              </div>
            </div>
          </div>

          <!-- Edit Group Button for Owner/Admin -->
          <button
            v-if="isOwnerOrAdmin"
            @click="showEditGroup = true"
            class="bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/40 hover:bg-brand-100 dark:hover:bg-brand-500/30 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Edit3 class="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Sửa nhóm</span>
          </button>

          <!-- Leave Group Button for Non-Owner Members -->
          <button
            v-if="isMemberNotOwner"
            @click="handleLeaveGroup"
            class="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <LogOut class="w-4 h-4 text-amber-500" />
            <span>Rời nhóm</span>
          </button>

          <!-- Disband Group button for Owner/Admin -->
          <button
            v-if="isOwnerOrAdmin"
            @click="handleDisbandGroup"
            class="bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Disband Group"
          >
            <Trash2 class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{{ t('groups.disband_group') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Members Management Card -->
    <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Users class="w-4 h-4 text-brand-600 dark:text-brand-400" /> {{ t('groups.members_label') }} ({{ groupMembers.length }})
        </h3>

        <!-- Add member form (Owner/Admin only) -->
        <form v-if="isOwnerOrAdmin" @submit.prevent="handleAddMember" class="flex items-center gap-2">
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

        <div v-else class="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
          <Shield class="w-3.5 h-3.5 text-amber-500" />
          <span>{{ t('groups.only_leader_can_manage') }}</span>
        </div>
      </div>

      <p v-if="memberError" class="text-xs text-rose-600 dark:text-rose-400 font-medium">{{ memberError }}</p>

      <!-- Member Pill List -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div
          v-for="u in groupMembers"
          :key="u.id"
          :class="[
            'border px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-all',
            u.id === group.ownerId
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold'
              : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          ]"
        >
          <img :src="u.avatar" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          <span class="font-semibold">{{ u.name }}</span>
          
          <!-- Leader Crown Badge -->
          <span v-if="u.id === group.ownerId" class="bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 font-extrabold">
            <Crown class="w-3 h-3 text-amber-500 dark:text-amber-400" /> {{ t('groups.leader_badge') }}
          </span>

          <span v-else class="text-[10px] text-slate-500 dark:text-slate-400">(@{{ u.username }})</span>
          
          <!-- Remove member button (Only for Owner/Admin, and cannot remove owner) -->
          <button
            v-if="isOwnerOrAdmin && u.id !== group.ownerId"
            @click="handleRemoveMember(u.id)"
            class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1 transition-colors"
            title="Remove from group"
          >
            <UserX class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Group Net Debt Matrix -->
    <div class="glass-card p-5 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
      <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">{{ t('groups.group_matrix_title') }}</h3>
      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="p-2.5">{{ t('groups.debtor_vs_creditor') }}</th>
              <th v-for="c in groupMembers" :key="c.id" class="p-2.5 text-center">
                {{ c.name.split(' ')[0] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in groupMembers" :key="d.id" class="border-b border-slate-200 dark:border-slate-800/80">
              <td class="p-2.5 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/40">
                {{ d.name }}
              </td>
              <td v-for="c in groupMembers" :key="c.id" class="p-2.5 text-center font-medium">
                <span v-if="d.id === c.id" class="text-slate-400">-</span>
                <span v-else-if="groupDebtMatrix[d.id] && groupDebtMatrix[d.id][c.id] > 0" class="text-rose-600 dark:text-rose-400 font-bold">
                  {{ groupDebtMatrix[d.id][c.id].toLocaleString() }}
                </span>
                <span v-else class="text-slate-400">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Group Meals History -->
    <div class="space-y-4">
      <h3 class="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
        <Receipt class="w-5 h-5 text-brand-600 dark:text-brand-400" /> {{ t('groups.group_meals') }} ({{ groupMeals.length }})
      </h3>

      <div v-if="groupMeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MealCard v-for="m in groupMeals" :key="m.id" :meal="m" />
      </div>

      <div v-else class="glass-card p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
        {{ t('meals.empty') }}
      </div>
    </div>

    <!-- Edit Group Modal -->
    <EditGroupModal :show="showEditGroup" :group="group" @close="showEditGroup = false" />
  </div>
</template>
