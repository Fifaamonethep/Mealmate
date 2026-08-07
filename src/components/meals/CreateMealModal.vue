<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import AiFaceScannerModal from './AiFaceScannerModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { useMealsStore } from '../../stores/meals'
import { PlusCircle, Sparkles, Users, Receipt, DollarSign } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'created'])

const { t } = useI18n()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()
const mealsStore = useMealsStore()

const showAiScanner = ref(false)
const title = ref('')
const totalAmount = ref('')
const currency = ref('VND')
const paidById = ref(authStore.currentUserId)
const groupId = ref('')
const splitType = ref('equal')
const selectedParticipants = ref([authStore.currentUserId])
const customSplits = ref({})
const receiptUrl = ref('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop')

// Available members depending on selected group or all users
const availableMembers = computed(() => {
  if (groupId.value) {
    const group = groupsStore.getGroupById(groupId.value)
    if (group) {
      return authStore.users.filter(u => group.members.includes(u.id))
    }
  }
  return authStore.users
})

// Reset paidById & participants when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    paidById.value = authStore.currentUserId || availableMembers.value[0]?.id || ''
    if (selectedParticipants.value.length === 0 || !selectedParticipants.value.includes(authStore.currentUserId)) {
      selectedParticipants.value = authStore.currentUserId ? [authStore.currentUserId] : []
    }
  }
})

// Auto select all group members when group changes
watch(groupId, (newVal) => {
  if (newVal) {
    const g = groupsStore.getGroupById(newVal)
    if (g) {
      selectedParticipants.value = [...g.members]
    }
  }
})

function toggleParticipant(userId) {
  if (selectedParticipants.value.includes(userId)) {
    if (selectedParticipants.value.length > 1) {
      selectedParticipants.value = selectedParticipants.value.filter(id => id !== userId)
    }
  } else {
    selectedParticipants.value.push(userId)
  }
}

function handleAiFacesDetected(detectedIds) {
  const uniqueIds = Array.from(new Set([...selectedParticipants.value, ...detectedIds]))
  selectedParticipants.value = uniqueIds
}

const perPersonEqualAmount = computed(() => {
  if (!totalAmount.value || selectedParticipants.value.length === 0) return 0
  return Math.round(Number(totalAmount.value) / selectedParticipants.value.length)
})

function handleSubmit() {
  if (!title.value || !totalAmount.value) return

  const meal = mealsStore.createMeal({
    title: title.value,
    totalAmount: Number(totalAmount.value),
    currency: currency.value,
    paidById: paidById.value,
    groupId: groupId.value || null,
    receiptUrl: receiptUrl.value,
    splitType: splitType.value,
    participants: selectedParticipants.value,
    customSplits: customSplits.value
  })

  // Reset form
  title.value = ''
  totalAmount.value = ''
  emit('created', meal)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('meals.create_title')" maxWidth="max-w-xl" @close="emit('close')">
    <template #icon>
      <PlusCircle class="w-5 h-5 text-brand-400" />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4 text-slate-200">
      
      <!-- Title & Amount Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('meals.meal_name') }}</label>
          <input
            v-model="title"
            type="text"
            required
            :placeholder="t('meals.meal_name_placeholder')"
            class="w-full glass-input text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('meals.total_price') }}</label>
          <div class="relative">
            <input
              v-model="totalAmount"
              type="number"
              required
              min="1000"
              placeholder="500000"
              class="w-full glass-input text-sm pl-8"
            />
            <DollarSign class="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      <!-- Currency & Group Selector -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('meals.currency') }}</label>
          <select v-model="currency" class="w-full glass-input text-sm bg-slate-900">
            <option value="VND">VND (Việt Nam Đổng)</option>
            <option value="THB">THB (Baht Thái)</option>
            <option value="USD">USD (Đô la Mỹ)</option>
            <option value="LAK">LAK (Kip Lào)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('meals.select_group') }}</label>
          <select v-model="groupId" class="w-full glass-input text-sm bg-slate-900">
            <option value="">{{ t('meals.all_groups') }}</option>
            <option v-for="g in groupsStore.groups" :key="g.id" :value="g.id">
              {{ g.name }} ({{ g.members.length }})
            </option>
          </select>
        </div>
      </div>

      <!-- Paid By Creditor -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('meals.creditor') }}</label>
        <select v-model="paidById" class="w-full glass-input text-sm bg-slate-900">
          <option v-for="u in availableMembers" :key="u.id" :value="u.id">
            {{ u.name }} ({{ u.username }})
          </option>
        </select>
      </div>

      <!-- Participants selection header & AI Scanner Button -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <label class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Users class="w-4 h-4 text-brand-400" />
          {{ t('meals.participants_count') }} ({{ selectedParticipants.length }})
        </label>
        <button
          type="button"
          @click="showAiScanner = true"
          class="bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
        >
          <Sparkles class="w-3.5 h-3.5 text-brand-400" />
          <span>{{ t('meals.ai_face_scan') }}</span>
        </button>
      </div>

      <!-- Member Pick Checkboxes -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-slate-800">
        <div
          v-for="u in availableMembers"
          :key="u.id"
          @click="toggleParticipant(u.id)"
          :class="[
            'cursor-pointer flex items-center gap-2 p-2 rounded-lg text-xs transition-all border',
            selectedParticipants.includes(u.id)
              ? 'bg-brand-600/30 border-brand-500/50 text-white font-medium'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          ]"
        >
          <img :src="u.avatar" class="w-5 h-5 rounded-full" />
          <span class="truncate">{{ u.name }}</span>
        </div>
      </div>

      <!-- Split Method Tabs -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <label class="block text-xs font-semibold text-slate-300">{{ t('meals.split_method') }}</label>
        <div class="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            @click="splitType = 'equal'"
            :class="[
              'py-2 rounded-lg font-medium transition-all',
              splitType === 'equal' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ t('meals.equal_split') }}
          </button>
          <button
            type="button"
            @click="splitType = 'custom'"
            :class="[
              'py-2 rounded-lg font-medium transition-all',
              splitType === 'custom' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ t('meals.custom_split') }}
          </button>
        </div>

        <!-- Equal split info box -->
        <div v-if="splitType === 'equal'" class="bg-slate-800/60 p-3 rounded-xl text-xs flex items-center justify-between text-slate-300 border border-slate-700">
          <span>{{ t('meals.each_pays') }}</span>
          <span class="text-sm font-bold text-emerald-400">
            {{ perPersonEqualAmount.toLocaleString() }} {{ currency }}
          </span>
        </div>

        <!-- Custom split individual inputs -->
        <div v-else-if="splitType === 'custom'" class="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <p class="text-[11px] text-slate-400">{{ t('meals.custom_pays_sub') }}</p>
          <div v-for="pid in selectedParticipants" :key="pid" class="flex items-center justify-between gap-2">
            <span class="text-xs text-slate-300 truncate w-1/3">
              {{ authStore.users.find(u => u.id === pid)?.name }}:
            </span>
            <input
              v-model.number="customSplits[pid]"
              type="number"
              placeholder="0"
              class="glass-input text-xs py-1 px-3 w-2/3"
            />
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleSubmit" class="glow-button text-sm flex items-center gap-2">
        <Receipt class="w-4 h-4" />
        <span>{{ t('meals.submit_create') }}</span>
      </button>
    </template>
  </Modal>

  <!-- AI Face Scanner Modal -->
  <AiFaceScannerModal
    :show="showAiScanner"
    :groupMembers="availableMembers"
    @close="showAiScanner = false"
    @facesDetected="handleAiFacesDetected"
  />
</template>
