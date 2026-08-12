<script setup>
import { ref } from 'vue'
import Modal from '../common/Modal.vue'
import { Camera, Sparkles, FileText, CheckCircle2, Upload, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'scanComplete'])

const isScanning = ref(false)
const previewImage = ref('')
const scannedResult = ref(null)

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    simulateOCR()
  }
  reader.readAsDataURL(file)
}

function simulateOCR() {
  isScanning.value = true
  scannedResult.value = null

  setTimeout(() => {
    isScanning.value = false
    scannedResult.value = {
      title: 'ຕຳໝາກຮຸ່ງ & ອາຫານທະເລ ວັງວຽງ',
      totalAmount: 250000,
      currency: 'LAK',
      items: [
        { name: 'ຕຳໝາກຮຸ່ງສົ້ມ', amount: 45000 },
        { name: 'ປີ້ງໄກ່ບ້ານ 1 ໂຕ', amount: 85000 },
        { name: 'ຊາມະນາວເຢັນ x3', amount: 45000 },
        { name: 'ເບຍລາວ 1 ລັງ', amount: 75000 }
      ]
    }
  }, 1500)
}

function applyScan() {
  if (scannedResult.value) {
    emit('scanComplete', scannedResult.value)
    emit('close')
  }
}
</script>

<template>
  <Modal :show="show" title="AI Receipt OCR Scanner" maxWidth="max-w-lg" @close="emit('close')">
    <template #icon>
      <Sparkles class="w-5 h-5 text-indigo-500" />
    </template>

    <div class="space-y-4 text-center">
      
      <!-- Upload area -->
      <div v-if="!previewImage" class="p-8 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-3xl bg-purple-50/50 dark:bg-purple-950/30 space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
          <Camera class="w-7 h-7" />
        </div>
        <div>
          <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">ຖ່າຍຮູບຫຼືອັບໂຫຼດບິນໃບເສັດ</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">ລະບົບ AI ຈະດຶງຊື່ຄາບອາຫານແລະຍອດເງິນລວມໃຫ້ອັດໂນມັດ</p>
        </div>

        <label class="inline-flex items-center gap-2 glow-button text-xs py-2.5 px-5 cursor-pointer font-bold">
          <Upload class="w-4 h-4" />
          <span>ເລືອກຮູບພາບໃບເສັດ</span>
          <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
        </label>
      </div>

      <!-- Preview & Scanning -->
      <div v-else class="space-y-4">
        <div class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-60 bg-slate-950">
          <img :src="previewImage" class="w-full h-full object-contain mx-auto" />
          
          <div v-if="isScanning" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white">
            <RefreshCw class="w-8 h-8 text-indigo-400 animate-spin" />
            <span class="text-xs font-extrabold tracking-wider">AI ກຳລັງວິເຄາະສະແກນໃບເສັດ...</span>
          </div>
        </div>

        <!-- Result Preview -->
        <div v-if="scannedResult" class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-black text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" /> ສະແກນໃບເສັດສຳເລັດແລ້ວ!
            </span>
            <span class="text-xs font-black text-emerald-700 dark:text-emerald-300">250,000 LAK</span>
          </div>

          <div class="space-y-1 text-xs">
            <div class="font-extrabold text-slate-900 dark:text-white">{{ scannedResult.title }}</div>
            <div class="space-y-0.5 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div v-for="(it, i) in scannedResult.items" :key="i" class="flex justify-between">
                <span>• {{ it.name }}</span>
                <span class="font-semibold">{{ it.amount.toLocaleString() }} LAK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <button v-if="previewImage" @click="previewImage = ''; scannedResult = null;" class="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
          ຖ່າຍໃໝ່
        </button>
        <button v-if="scannedResult" @click="applyScan" class="w-1/2 glow-button py-2.5 text-xs font-bold">
          ນຳຂໍ້ມູນເຂົ້າຄາບອາຫານ
        </button>
      </div>
    </template>
  </Modal>
</template>
