<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { useMealsStore } from '../../stores/meals'
import { formatCurrency } from '../../utils/currency'
import { QrCode, Upload, Send, Copy, Check, Phone, Mail } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  payment: Object
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const mealsStore = useMealsStore()

const copied = ref(false)
const sampleSlips = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop'
]
const slipUrl = ref(sampleSlips[0])

const creditor = computed(() => {
  if (!props.payment) return null
  return authStore.users.find(u => u.id === props.payment.creditorId)
})

const meal = computed(() => {
  if (!props.payment) return null
  return mealsStore.getMealById(props.payment.mealId)
})

const slipFileInput = ref(null)

function triggerSlipFileSelect() {
  slipFileInput.value?.click()
}

function handleSlipFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (e) => {
    slipUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function copyAccountInfo() {
  if (!creditor.value) return
  const info = `${creditor.value.name} - ${t('debts.phone_label')} ${creditor.value.phone || ''} - ${creditor.value.qrCodeUrl || ''}`
  navigator.clipboard.writeText(info)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function handleSendSlip() {
  if (!props.payment || !slipUrl.value) return
  await debtsStore.sendSlip(props.payment.id, slipUrl.value)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('debts.pay_modal_title')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <QrCode class="w-5 h-5 text-brand-600 dark:text-brand-400" />
    </template>

    <div v-if="payment && creditor" class="space-y-4 text-slate-800 dark:text-slate-200">
      <input
        ref="slipFileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleSlipFileUpload"
      />
      
      <!-- Creditor Info & Amount & Contact -->
      <div class="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('debts.pay_modal_amount_for') }} <strong class="text-slate-800 dark:text-slate-200">{{ creditor.name }}</strong>:</span>
        <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(payment.amount, meal?.currency || 'LAK', locale) }}
        </div>
        <!-- Creditor Phone & Email -->
        <div v-if="creditor.phone || creditor.email" class="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-3">
          <span v-if="creditor.phone" class="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <Phone class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> {{ creditor.phone }}
          </span>
          <span v-if="creditor.email" class="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <Mail class="w-3.5 h-3.5 text-indigo-600 dark:indigo-400" /> {{ creditor.email }}
          </span>
        </div>
      </div>

      <!-- Creditor Bank QR Code -->
      <div class="flex flex-col items-center space-y-2 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ t('debts.pay_modal_qr') }}</span>
        <div class="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
          <img :src="creditor.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR'" class="w-40 h-40 object-contain" />
        </div>
        <button
          @click="copyAccountInfo"
          class="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold shadow-sm"
        >
          <component :is="copied ? Check : Copy" class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>{{ copied ? t('debts.copied_acc') : t('debts.copy_acc') }}</span> 
        </button>
      </div>

      <!-- Upload Slip Photo -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {{ t('debts.slip_image_label') }}
          </label>
          <button
            type="button"
            @click="triggerSlipFileSelect"
            class="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Upload class="w-3.5 h-3.5" />
            <span>{{ t('debts.upload_from_gallery') }}</span>
          </button>
        </div>
        <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative group cursor-pointer" @click="triggerSlipFileSelect">
          <img :src="slipUrl" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
            <Upload class="w-4 h-4" />
            <span>{{ t('debts.upload_from_gallery') }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.close') }}
      </button>
      <button @click="handleSendSlip" class="glow-button text-xs flex items-center gap-2 py-2">
        <Send class="w-4 h-4" />
        <span>{{ t('debts.send_slip_btn') }}</span>
      </button>
    </template>
  </Modal>
</template>
