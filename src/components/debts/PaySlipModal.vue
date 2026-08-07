<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { QrCode, Upload, Send, Copy, Check } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  payment: Object
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()

const copied = ref(false)
const sampleSlips = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop'
]
const slipUrl = ref(sampleSlips[0])

const creditor = computed(() => {
  return props.payment ? authStore.users.find(u => u.id === props.payment.creditorId) : null
})

function copyAccountInfo() {
  if (!creditor.value) return
  navigator.clipboard.writeText(`STK: 19030099882211 - ${creditor.value.name}`)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function handleSendSlip() {
  if (!props.payment || !slipUrl.value) return
  debtsStore.sendSlip(props.payment.id, slipUrl.value)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('debts.pay_modal_title')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <QrCode class="w-5 h-5 text-brand-400" />
    </template>

    <div v-if="payment && creditor" class="space-y-4 text-slate-200">
      
      <!-- Creditor Info & Amount -->
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
        <span class="text-xs text-slate-400">{{ t('debts.pay_modal_amount_for') }} <strong>{{ creditor.name }}</strong>:</span>
        <div class="text-2xl font-extrabold text-emerald-400">
          {{ payment.amount.toLocaleString() }} VND
        </div>
      </div>

      <!-- Creditor Bank QR Code -->
      <div class="flex flex-col items-center space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
        <span class="text-xs font-semibold text-slate-300">{{ t('debts.pay_modal_qr') }}</span>
        <div class="p-2 bg-white rounded-xl shadow-lg">
          <img :src="creditor.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR'" class="w-40 h-40" />
        </div>
        <button
          @click="copyAccountInfo"
          class="text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 text-slate-300"
        >
          <component :is="copied ? Check : Copy" class="w-3.5 h-3.5 text-brand-400" />
          <span>{{ copied ? t('debts.copied_acc') : t('debts.copy_acc') }}</span>
        </button>
      </div>

      <!-- Upload Slip Photo -->
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-300">{{ t('debts.upload_slip_label') }}</label>
        <div class="flex gap-2">
          <input
            v-model="slipUrl"
            type="text"
            placeholder="https://..."
            class="glass-input text-xs w-full"
          />
        </div>
        <div class="rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-950 flex items-center justify-center">
          <img :src="slipUrl" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800">
        {{ t('common.close') }}
      </button>
      <button @click="handleSendSlip" class="glow-button text-sm flex items-center gap-2">
        <Send class="w-4 h-4" />
        <span>{{ t('debts.send_slip_btn') }}</span>
      </button>
    </template>
  </Modal>
</template>
