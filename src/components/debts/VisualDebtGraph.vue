<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useDebtsStore } from '../../stores/debts'
import { formatCurrency } from '../../utils/currency'
import { generateLaoQrUrl } from '../../utils/qr'
import Modal from '../common/Modal.vue'
import { ArrowRight, Zap, QrCode, CheckCircle2, Sparkles, Send, BellRing } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const debtsStore = useDebtsStore()

const selectedDebt = ref(null)
const showPayModal = ref(false)
const reminderSent = ref({})

// Active debt relations
const activeDebts = computed(() => {
  return debtsStore.payments
    .filter(p => p.status !== 'confirmed')
    .map(p => {
      const debtor = authStore.users.find(u => u.id === p.debtorId) || { name: 'User', avatar: '' }
      const creditor = authStore.users.find(u => u.id === p.creditorId) || { name: 'Creditor', avatar: '' }
      return {
        ...p,
        debtor,
        creditor
      }
    })
})

function handlePayClick(debt) {
  selectedDebt.value = debt
  showPayModal.value = true
}

function sendReminder(debtId) {
  reminderSent.value[debtId] = true
  debtsStore.sendPaymentReminder(debtId)
  setTimeout(() => {
    reminderSent.value[debtId] = false
  }, 3000)
}
</script>

<template>
  <div class="glass-card p-6 border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-3xl space-y-5">
    
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Zap class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Visual Debt Network Graph</span>
            <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Live Interactive</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">ผังแสดงสายการโอนเงินหนี้สินระหว่างเพื่อนในกลุ่ม</p>
        </div>
      </div>
    </div>

    <!-- Debt Flow Cards Grid -->
    <div v-if="activeDebts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="d in activeDebts"
        :key="d.id"
        class="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-purple-950/20 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400/50 transition-all shadow-sm space-y-3"
      >
        <!-- Debtor to Creditor Direction Bar -->
        <div class="flex items-center justify-between gap-2">
          <!-- Debtor -->
          <div class="flex items-center gap-2 shrink-0">
            <img :src="d.debtor.avatar" class="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 object-cover" />
            <div>
              <div class="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[90px] sm:max-w-[110px]">{{ d.debtor.name }}</div>
              <div class="text-[10px] font-bold text-rose-500">ติดหนี้ 🔴</div>
            </div>
          </div>

          <!-- Arrow & Amount Badge -->
          <div class="flex-1 flex flex-col items-center px-2">
            <span class="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-700 shadow-sm">
              {{ formatCurrency(d.amount, 'LAK') }}
            </span>
            <div class="w-full flex items-center gap-1 my-1">
              <div class="h-0.5 flex-1 bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400"></div>
              <ArrowRight class="w-4 h-4 text-indigo-500 shrink-0 animate-pulse" />
            </div>
          </div>

          <!-- Creditor -->
          <div class="flex items-center gap-2 text-right shrink-0">
            <div>
              <div class="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[90px] sm:max-w-[110px]">{{ d.creditor.name }}</div>
              <div class="text-[10px] font-bold text-emerald-500">เจ้าหนี้ 🟢</div>
            </div>
            <img :src="d.creditor.avatar" class="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 object-cover" />
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
          <button
            @click="sendReminder(d.id)"
            :disabled="reminderSent[d.id]"
            class="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 transition-colors"
          >
            <BellRing class="w-3.5 h-3.5" />
            <span>{{ reminderSent[d.id] ? 'ส่งการทวงเงินแล้ว! 🔔' : 'ทวงเงินด่วน (Remind)' }}</span>
          </button>

          <button
            @click="handlePayClick(d)"
            class="glow-button py-1.5 px-3 text-[11px] font-extrabold flex items-center gap-1.5 rounded-xl"
          >
            <QrCode class="w-3.5 h-3.5" />
            <span>สแกนจ่าย QR</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center space-y-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
      <CheckCircle2 class="w-10 h-10 text-emerald-500 mx-auto" />
      <h4 class="font-black text-sm text-slate-900 dark:text-white">ไม่มีรายการหนี้สินค้างชำระ 🎉</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400">ทุกคนในกลุ่มเคลียร์ยอดเงินครบถ้วนเรียบร้อยแล้ว!</p>
    </div>

    <!-- Dynamic QR Payment Modal -->
    <Modal :show="showPayModal" title="สแกน QR โอนเงินระบบอัตโนมัติ" maxWidth="max-w-md" @close="showPayModal = false">
      <template #icon>
        <QrCode class="w-5 h-5 text-purple-500" />
      </template>

      <div v-if="selectedDebt" class="space-y-5 text-center">
        <!-- Details -->
        <div class="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">ยอดเงินที่ต้องโอนชำระให้ {{ selectedDebt.creditor.name }}</div>
          <div class="text-2xl font-black text-purple-950 dark:text-purple-100">
            {{ formatCurrency(selectedDebt.amount, 'LAK') }}
          </div>
        </div>

        <!-- QR Image with embedded amount -->
        <div class="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto">
          <img
            :src="generateLaoQrUrl({ username: selectedDebt.creditor.username, amount: selectedDebt.amount })"
            class="w-56 h-56 mx-auto object-contain"
          />
          <div class="text-[11px] font-bold text-slate-600 mt-2">สแกนผ่านแอปธนาคารใดก็ได้เพื่อโอนเงิน</div>
        </div>

        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          เมื่อโอนสำเร็จเรียบร้อยแล้ว สามารถอัปโหลดสลิปได้ที่หน้ารายการหนี้สิน
        </div>
      </div>

      <template #footer>
        <button @click="showPayModal = false" class="glow-button w-full py-2.5 text-xs font-bold">
          ปิดหน้าต่าง
        </button>
      </template>
    </Modal>

  </div>
</template>
