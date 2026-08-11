<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import AiFaceScannerModal from './AiFaceScannerModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { useMealsStore } from '../../stores/meals'
import { useToastStore } from '../../stores/toast'
import { PlusCircle, Sparkles, Users, Receipt, DollarSign, Camera, Image } from 'lucide-vue-next'

import { formatCurrency } from '../../utils/currency'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'created'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()
const mealsStore = useMealsStore()
const toastStore = useToastStore()

const receiptFileInput = ref(null)
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

const showInlineGroupInput = ref(false)
const newGroupName = ref('')

const perPersonEqualAmount = computed(() => {
  if (!totalAmount.value || !selectedParticipants.value.length) return 0
  return Math.round(Number(totalAmount.value) / selectedParticipants.value.length)
})

function triggerReceiptFileSelect() {
  receiptFileInput.value?.click()
}

function handleReceiptFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    receiptUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleCreateInlineGroup() {
  if (!newGroupName.value.trim()) return
  const newGroup = groupsStore.createGroup({
    name: newGroupName.value.trim(),
    members: selectedParticipants.value.length ? [...selectedParticipants.value] : [authStore.currentUserId]
  })
  groupId.value = newGroup.id
  newGroupName.value = ''
  showInlineGroupInput.value = false
}

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

// Reset form fields when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    title.value = ''
    totalAmount.value = ''
    splitType.value = 'equal'
    customSplits.value = {}
    receiptUrl.value = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    paidById.value = authStore.currentUserId || availableMembers.value[0]?.id || ''
    selectedParticipants.value = availableMembers.value.map(u => u.id)
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

const customTotalSum = computed(() => {
  if (splitType.value !== 'custom') return 0
  return selectedParticipants.value.reduce((sum, pid) => sum + (Number(customSplits.value[pid]) || 0), 0)
})

const isCustomSplitValid = computed(() => {
  if (splitType.value !== 'custom') return true
  if (!totalAmount.value) return true
  return customTotalSum.value === Number(totalAmount.value)
})

function handleSubmit() {
  if (!title.value || !totalAmount.value) return
  if (splitType.value === 'custom' && !isCustomSplitValid.value) {
    toastStore.showToast(
      t('meals.custom_split_mismatch', {
        customSum: formatCurrency(customTotalSum.value, currency.value, locale.value),
        totalAmount: formatCurrency(totalAmount.value, currency.value, locale.value)
      }),
      'warning'
    )
    return
  }

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
      <PlusCircle class="w-5 h-5 text-brand-600 dark:text-brand-400" />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4 text-slate-800 dark:text-slate-200">
      
      <!-- Title & Amount Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('meals.meal_name') }}</label>
          <input
            v-model="title"
            type="text"
            required
            :placeholder="t('meals.meal_name_placeholder')"
            class="w-full glass-input text-xs"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('meals.total_price') }}</label>
          <div class="relative">
            <input
              v-model="totalAmount"
              type="number"
              required
              min="1000"
              placeholder="500000"
              class="w-full glass-input text-xs pl-8"
            />
            <DollarSign class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      <!-- Currency & Group Selector -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('meals.currency') }}</label>
          <select v-model="currency" class="w-full glass-input text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <option value="VND">{{ t('common.currency_vnd') }}</option>
            <option value="THB">{{ t('common.currency_thb') }}</option>
            <option value="USD">{{ t('common.currency_usd') }}</option>
            <option value="LAK">{{ t('common.currency_lak') }}</option>
          </select>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ t('meals.select_group') }}</label>
            <button
              type="button"
              @click="showInlineGroupInput = !showInlineGroupInput"
              class="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle class="w-3.5 h-3.5" />
              <span>+ {{ t('groups.create_group') }}</span>
            </button>
          </div>

          <!-- Inline New Group Input -->
          <div v-if="showInlineGroupInput" class="flex gap-2 mb-2 p-2 bg-brand-50/50 dark:bg-brand-500/10 rounded-xl border border-brand-200 dark:border-brand-500/30">
            <input
              v-model="newGroupName"
              type="text"
              :placeholder="t('groups.group_name_placeholder')"
              class="w-full glass-input text-xs"
              @keyup.enter="handleCreateInlineGroup"
            />
            <button
              type="button"
              @click="handleCreateInlineGroup"
              class="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm"
            >
              {{ t('common.save') }}
            </button>
          </div>

          <select v-model="groupId" class="w-full glass-input text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <option value="">{{ t('meals.all_groups') }}</option>
            <option v-for="g in groupsStore.groups" :key="g.id" :value="g.id">
              {{ g.name }} ({{ g.members.length }})
            </option>
          </select>
        </div>
      </div>

      <!-- Hidden Receipt File Input -->
      <input
        ref="receiptFileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleReceiptFileUpload"
      />

      <!-- Paid By Creditor -->
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('meals.creditor') }}</label>
        <select v-model="paidById" class="w-full glass-input text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <option v-for="u in availableMembers" :key="u.id" :value="u.id">
            {{ u.name }} ({{ u.username }})
          </option>
        </select>
      </div>

      <!-- Receipt Image Photo Upload / Capture Section -->
      <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <Camera class="w-4 h-4 text-brand-600 dark:text-brand-400" />
            {{ t('meals.receipt_image') }}
          </span>
        </label>

        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <img
            v-if="receiptUrl"
            :src="receiptUrl"
            class="w-16 h-16 rounded-xl object-cover border-2 border-brand-500/40 bg-slate-200 dark:bg-slate-900 shadow-md shrink-0"
          />
          <div class="space-y-1.5 flex-1">
            <button
              type="button"
              @click="triggerReceiptFileSelect"
              class="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all transform active:scale-95"
            >
              <Camera class="w-4 h-4" />
              <span>{{ t('meals.upload_receipt') }}</span>
            </button>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{{ t('meals.receipt_upload_hint') }}</p>
          </div>
        </div>
      </div>

      <!-- Participants selection header & AI Scanner Button -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Users class="w-4 h-4 text-brand-600 dark:text-brand-400" />
          {{ t('meals.participants_count') }} ({{ selectedParticipants.length }})
        </label>
        <button
          type="button"
          @click="showAiScanner = true"
          class="bg-brand-50 dark:bg-brand-500/20 hover:bg-brand-100 dark:hover:bg-brand-500/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/40 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold shadow-sm"
        >
          <Sparkles class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>{{ t('meals.ai_face_scan') }}</span>
        </button>
      </div>

      <!-- Member Pick Checkboxes -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <div
          v-for="u in availableMembers"
          :key="u.id"
          @click="toggleParticipant(u.id)"
          :class="[
            'cursor-pointer flex items-center gap-2 p-2 rounded-lg text-xs transition-all border',
            selectedParticipants.includes(u.id)
              ? 'bg-brand-500/20 border-brand-500/60 text-brand-900 dark:text-white font-bold'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <img :src="u.avatar" class="w-5 h-5 rounded-full" />
          <span class="truncate">{{ u.name }}</span>
        </div>
      </div>

      <!-- Split Method Tabs -->
      <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">{{ t('meals.split_method') }}</label>
        <div class="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            @click="splitType = 'equal'"
            :class="[
              'py-2 rounded-lg transition-all',
              splitType === 'equal' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('meals.equal_split') }}
          </button>
          <button
            type="button"
            @click="splitType = 'custom'"
            :class="[
              'py-2 rounded-lg transition-all',
              splitType === 'custom' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('meals.custom_split') }}
          </button>
        </div>

        <!-- Equal split info box -->
        <div v-if="splitType === 'equal'" class="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl text-xs flex items-center justify-between text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span>{{ t('meals.each_pays') }}</span>
          <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(perPersonEqualAmount, currency, locale) }}
          </span>
        </div>

        <!-- Custom split individual inputs -->
        <div v-else-if="splitType === 'custom'" class="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ t('meals.custom_pays_sub') }}</p>
          <div v-for="pid in selectedParticipants" :key="pid" class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate w-1/3">
              {{ authStore.users.find(u => u.id === pid)?.name }}:
            </span>
            <input
              v-model.number="customSplits[pid]"
              type="number"
              placeholder="0"
              class="glass-input text-xs py-1 px-3 w-2/3"
            />
          </div>

          <div :class="['p-2 rounded-lg text-xs font-bold flex items-center justify-between border mt-2', isCustomSplitValid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30']">
            <span>{{ t('meals.custom_total_input') }} {{ formatCurrency(customTotalSum, currency, locale) }}</span>
            <span>{{ isCustomSplitValid ? t('meals.custom_split_matched') : t('meals.custom_split_difference', { diff: formatCurrency(Math.abs(Number(totalAmount || 0) - customTotalSum), currency, locale) }) }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleSubmit" class="glow-button text-xs flex items-center gap-2 py-2">
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
