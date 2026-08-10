<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { Sparkles, Scan, CheckCircle2, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  groupMembers: Array // Array of user objects
})

const emit = defineEmits(['close', 'facesDetected'])

const { t } = useI18n()
const isScanning = ref(false)
const scanComplete = ref(false)
const detectedUsers = ref([])

const sampleTableImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
]
const currentImage = ref(sampleTableImages[0])

function startAiScan() {
  isScanning.value = true
  scanComplete.value = false
  detectedUsers.value = []

  setTimeout(() => {
    isScanning.value = false
    scanComplete.value = true
    if (props.groupMembers && props.groupMembers.length > 0) {
      detectedUsers.value = props.groupMembers.slice(0, Math.max(2, Math.floor(props.groupMembers.length * 0.75)))
    }
  }, 2200)
}

function applyDetected() {
  emit('facesDetected', detectedUsers.value.map(u => u.id))
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('meals.ai_title')" maxWidth="max-w-lg" @close="emit('close')">
    <template #icon>
      <Sparkles class="w-5 h-5 text-brand-600 dark:text-brand-400" />
    </template>

    <div class="space-y-4 text-slate-800 dark:text-slate-200">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ t('meals.ai_sub') }}
      </p>

      <!-- Image Display with Scan overlay -->
      <div class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video shadow-inner flex items-center justify-center">
        <img :src="currentImage" class="w-full h-full object-cover" alt="Dinner Table" />

        <!-- AI Laser Scan Effect -->
        <div v-if="isScanning" class="absolute inset-0 bg-brand-500/10 pointer-events-none">
          <div class="w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_#6366f1] animate-scan absolute left-0"></div>
          <div class="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
            <div class="flex items-center gap-2 bg-slate-900/90 border border-brand-500/50 px-4 py-2 rounded-xl text-brand-300 font-medium text-sm shadow-xl">
              <Scan class="w-4 h-4 animate-spin text-brand-400" />
              <span>{{ t('meals.ai_scanning') }}</span>
            </div>
          </div>
        </div>

        <!-- Detected Face Badges Overlay -->
        <div v-if="scanComplete" class="absolute inset-0 p-4 pointer-events-none flex flex-wrap items-start gap-3 bg-slate-950/20 backdrop-blur-[1px]">
          <div
            v-for="(u, idx) in detectedUsers"
            :key="u.id"
            class="animate-pulse bg-emerald-900/90 border border-emerald-400 text-emerald-100 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30"
            :style="{ marginTop: `${idx * 20 + 10}px`, marginLeft: `${idx * 30 + 10}px` }"
          >
            <img :src="u.avatar" class="w-5 h-5 rounded-full" />
            <span class="font-bold">{{ u.name }}</span>
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      <!-- Actions & Results -->
      <div v-if="!isScanning && !scanComplete" class="flex justify-center">
        <button @click="startAiScan" class="glow-button text-xs flex items-center gap-2 py-2.5">
          <Scan class="w-4 h-4" />
          <span>{{ t('meals.ai_start') }}</span>
        </button>
      </div>

      <div v-if="scanComplete" class="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles class="w-4 h-4" />
            {{ t('meals.ai_success') }} ({{ detectedUsers.length }}):
          </span>
          <button @click="startAiScan" class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold">
            <RefreshCw class="w-3 h-3" /> {{ t('meals.ai_rescan') }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="u in detectedUsers"
            :key="u.id"
            class="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <img :src="u.avatar" class="w-4 h-4 rounded-full" />
            <span>{{ u.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.cancel') }}
      </button>
      <button
        v-if="scanComplete"
        @click="applyDetected"
        class="glow-button text-xs flex items-center gap-2 py-2"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>{{ t('meals.ai_select_members') }} ({{ detectedUsers.length }})</span>
      </button>
    </template>
  </Modal>
</template>
