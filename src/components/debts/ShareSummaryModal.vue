<script setup>
import { ref, computed } from 'vue'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { formatCurrency } from '../../utils/currency'
import { Share2, Copy, Check, Sparkles, Send } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  groupName: {
    type: String,
    default: 'กຸ່ມໝູ່ເພື່ອນ'
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const copied = ref(false)

const summaryText = computed(() => {
  const pendingDebts = debtsStore.payments.filter(p => p.status !== 'confirmed')

  let text = `📌 สรุปยอดเงินหนี้สิน [${props.groupName}] - MealMate App\n`
  text += `────────────────────\n`

  if (pendingDebts.length === 0) {
    text += `🎉 เคลียร์ยอดเงินครบถ้วนแล้ว ไม่มีใครติดหนี้ค้างชำระ!\n`
  } else {
    pendingDebts.forEach((p, idx) => {
      const debtor = authStore.users.find(u => u.id === p.debtorId)?.name || 'เพื่อน'
      const creditor = authStore.users.find(u => u.id === p.creditorId)?.name || 'เจ้าหนี้'
      const amt = formatCurrency(p.amount, 'LAK')
      text += `${idx + 1}. 🔴 ${debtor} ➔ โอนให้ ${creditor}: ${amt}\n`
    })
  }

  text += `────────────────────\n`
  text += `👉 เข้าไปดูรายละเอียดและแนบสลิปได้ที่: https://mealmate.sokepromax.space`
  return text
})

function copyText() {
  navigator.clipboard.writeText(summaryText.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}
</script>

<template>
  <Modal :show="show" title="แชร์สรุปยอดเงินกลุ่มไปยัง LINE / Telegram" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Share2 class="w-5 h-5 text-indigo-500" />
    </template>

    <div class="space-y-4 text-left">
      <div class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
        {{ summaryText }}
      </div>

      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        กดปุ่มคัดลอกข้อความด้านล่าง เพื่อนำไปวางในแชทกลุ่ม LINE, Telegram หรือ WhatsApp ได้ทันที!
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <button @click="emit('close')" class="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
          ปิด
        </button>
        <button @click="copyText" class="w-2/3 glow-button py-2.5 text-xs font-extrabold flex items-center justify-center gap-2">
          <component :is="copied ? Check : Copy" class="w-4 h-4" />
          <span>{{ copied ? 'คัดลอกสำเร็จแล้ว! 📋' : 'คัดลอกข้อความแชร์' }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
