<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from './Modal.vue'
import { Crop, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  imageSrc: String,
  title: {
    type: String,
    default: ''
  },
  isCircle: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'cropComplete'])

const { t } = useI18n()

const canvasRef = ref(null)
const zoomLevel = ref(1)
const rotationAngle = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

let loadedImage = null
let baseDrawW = 0
let baseDrawH = 0

watch(() => props.show, (newVal) => {
  if (newVal && props.imageSrc) {
    zoomLevel.value = 1
    rotationAngle.value = 0
    offsetX.value = 0
    offsetY.value = 0
    nextTick(() => {
      loadImage()
    })
  }
})

function loadImage() {
  if (!props.imageSrc) return
  loadedImage = new Image()
  loadedImage.crossOrigin = 'anonymous'
  loadedImage.onload = () => {
    calculateBaseDimensions()
    drawCanvas()
  }
  loadedImage.src = props.imageSrc
}

function calculateBaseDimensions() {
  const canvas = canvasRef.value
  if (!canvas || !loadedImage) return
  const width = canvas.width
  const height = canvas.height
  const cropSize = Math.min(width, height) * 0.75

  const imgAspect = loadedImage.width / loadedImage.height

  // Ensure image covers crop area initially like Facebook cropper
  if (imgAspect > 1) {
    baseDrawH = cropSize
    baseDrawW = cropSize * imgAspect
  } else {
    baseDrawW = cropSize
    baseDrawH = cropSize / imgAspect
  }
}

function clampOffsets() {
  const canvas = canvasRef.value
  if (!canvas) return
  const cropSize = Math.min(canvas.width, canvas.height) * 0.75
  const currentW = baseDrawW * zoomLevel.value
  const currentH = baseDrawH * zoomLevel.value

  const maxOffsetX = Math.max(0, (currentW - cropSize) / 2)
  const maxOffsetY = Math.max(0, (currentH - cropSize) / 2)

  offsetX.value = Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX.value))
  offsetY.value = Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY.value))
}

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !loadedImage) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const cropSize = Math.min(width, height) * 0.75

  clampOffsets()

  // Clear background
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  // Draw transformed image
  ctx.save()
  ctx.translate(width / 2 + offsetX.value, height / 2 + offsetY.value)
  ctx.rotate((rotationAngle.value * Math.PI) / 180)
  ctx.scale(zoomLevel.value, zoomLevel.value)

  ctx.drawImage(loadedImage, -baseDrawW / 2, -baseDrawH / 2, baseDrawW, baseDrawH)
  ctx.restore()

  // Draw dark stencil overlay around crop cutout (Facebook Style)
  ctx.save()
  ctx.fillStyle = 'rgba(9, 13, 22, 0.75)'
  ctx.beginPath()
  ctx.rect(0, 0, width, height)

  // Cut out crop circle or square
  if (props.isCircle) {
    ctx.arc(width / 2, height / 2, cropSize / 2, 0, Math.PI * 2, true)
  } else {
    const cropX = (width - cropSize) / 2
    const cropY = (height - cropSize) / 2
    ctx.rect(cropX + cropSize, cropY, -cropSize, cropSize)
  }
  ctx.fill()
  ctx.restore()

  // Draw clean Facebook-style solid white border ring
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 6
  ctx.beginPath()

  if (props.isCircle) {
    ctx.arc(width / 2, height / 2, cropSize / 2, 0, Math.PI * 2)
  } else {
    const cropX = (width - cropSize) / 2
    const cropY = (height - cropSize) / 2
    ctx.rect(cropX, cropY, cropSize, cropSize)
  }
  ctx.stroke()
  ctx.restore()
}

// Mouse & Touch Dragging
function startDrag(e) {
  isDragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragStart.value = { x: clientX - offsetX.value, y: clientY - offsetY.value }
}

function onDrag(e) {
  if (!isDragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  offsetX.value = clientX - dragStart.value.x
  offsetY.value = clientY - dragStart.value.y
  drawCanvas()
}

function endDrag() {
  isDragging.value = false
}

function rotate(direction) {
  rotationAngle.value = (rotationAngle.value + direction * 90) % 360
  drawCanvas()
}

function handleZoomChange() {
  drawCanvas()
}

function resetTransform() {
  zoomLevel.value = 1
  rotationAngle.value = 0
  offsetX.value = 0
  offsetY.value = 0
  drawCanvas()
}

function handleWheel(e) {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomLevel.value = Math.min(3, zoomLevel.value + 0.1)
  } else {
    zoomLevel.value = Math.max(1, zoomLevel.value - 0.1)
  }
  drawCanvas()
}

// Perform Crop & Export High-Res DataURL
function cropAndExport() {
  if (!loadedImage) return

  const exportCanvas = document.createElement('canvas')
  const exportSize = 480
  exportCanvas.width = exportSize
  exportCanvas.height = exportSize
  const ctx = exportCanvas.getContext('2d')

  const previewCanvas = canvasRef.value
  const cropSize = Math.min(previewCanvas.width, previewCanvas.height) * 0.75
  const scaleRatio = exportSize / cropSize

  ctx.save()
  // Clip to circle if requested
  if (props.isCircle) {
    ctx.beginPath()
    ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2)
    ctx.clip()
  }

  // Draw transformed image
  ctx.translate(exportSize / 2 + offsetX.value * scaleRatio, exportSize / 2 + offsetY.value * scaleRatio)
  ctx.rotate((rotationAngle.value * Math.PI) / 180)
  ctx.scale(zoomLevel.value * scaleRatio, zoomLevel.value * scaleRatio)

  ctx.drawImage(loadedImage, -baseDrawW / 2, -baseDrawH / 2, baseDrawW, baseDrawH)
  ctx.restore()

  const croppedDataUrl = exportCanvas.toDataURL('image/png', 0.95)
  emit('cropComplete', croppedDataUrl)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="title || t('cropper.title') || 'Cắt & ປັບຂະໜາດຮູບພາບ'" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Crop class="w-5 h-5 text-indigo-500" />
    </template>

    <div class="space-y-4 text-center">
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {{ t('cropper.hint') || 'ລາກຍ້າຍ ຫຼື ຂະຫຍາຍ / ໝູນ ເພື່ອປັບມຸມຕັດຮູບໃຫ້ສົມບູນແບບ' }}
      </p>

      <!-- Facebook Style Crop Canvas -->
      <div class="relative inline-block rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 touch-none bg-slate-950">
        <canvas
          ref="canvasRef"
          width="320"
          height="320"
          class="cursor-grab active:cursor-grabbing block mx-auto"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchstart="startDrag"
          @touchmove="onDrag"
          @touchend="endDrag"
          @wheel="handleWheel"
        ></canvas>
      </div>

      <!-- Controls: Zoom & Rotate Bar -->
      <div class="p-3.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 space-y-3 shadow-inner">
        <!-- Facebook Style Zoom Slider -->
        <div class="flex items-center gap-3">
          <ZoomOut class="w-4 h-4 text-slate-500 shrink-0" />
          <input
            v-model.number="zoomLevel"
            type="range"
            min="1"
            max="3"
            step="0.02"
            class="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none"
            @input="handleZoomChange"
          />
          <ZoomIn class="w-4 h-4 text-slate-500 shrink-0" />
          <span class="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 w-12 text-right shrink-0">
            {{ Math.round(zoomLevel * 100) }}%
          </span>
        </div>

        <!-- Rotate & Reset Buttons -->
        <div class="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            @click="rotate(-1)"
            class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>-90°</span>
          </button>

          <button
            type="button"
            @click="rotate(1)"
            class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCw class="w-3.5 h-3.5" />
            <span>+90°</span>
          </button>

          <button
            type="button"
            @click="resetTransform"
            class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>{{ t('cropper.btn_reset') || 'Reset' }}</span>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <button
          type="button"
          @click="emit('close')"
          class="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="cropAndExport"
          class="w-2/3 glow-button py-2.5 text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25"
        >
          <Check class="w-4 h-4" />
          <span>{{ t('cropper.btn_crop') || 'ຕັດ & ນຳໃຊ້ຮູບ' }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
