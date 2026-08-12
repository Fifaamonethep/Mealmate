<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
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
    drawCanvas()
  }
  loadedImage.src = props.imageSrc
}

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !loadedImage) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // Clear background
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  // Move to center
  ctx.translate(width / 2 + offsetX.value, height / 2 + offsetY.value)
  ctx.rotate((rotationAngle.value * Math.PI) / 180)
  ctx.scale(zoomLevel.value, zoomLevel.value)

  // Calculate scaled dimensions keeping aspect ratio
  const imgAspect = loadedImage.width / loadedImage.height
  let drawW = width
  let drawH = height
  if (imgAspect > 1) {
    drawH = width / imgAspect
  } else {
    drawW = height * imgAspect
  }

  ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  // Draw overlay stencil mask (Darken non-cropped area)
  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)'
  ctx.fillRect(0, 0, width, height)

  // Cut out crop circle or square
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  const cropSize = Math.min(width, height) * 0.75
  const cropX = (width - cropSize) / 2
  const cropY = (height - cropSize) / 2

  if (props.isCircle) {
    ctx.arc(width / 2, height / 2, cropSize / 2, 0, Math.PI * 2)
  } else {
    ctx.rect(cropX, cropY, cropSize, cropSize)
  }
  ctx.fill()
  ctx.restore()

  // Draw border line around crop stencil
  ctx.save()
  ctx.strokeStyle = '#818cf8'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  if (props.isCircle) {
    const cropSize = Math.min(width, height) * 0.75
    ctx.arc(width / 2, height / 2, cropSize / 2, 0, Math.PI * 2)
  } else {
    const cropSize = Math.min(width, height) * 0.75
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
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
  }
  drawCanvas()
}

// Perform Crop & Export DataURL
function cropAndExport() {
  if (!loadedImage) return

  const exportCanvas = document.createElement('canvas')
  const exportSize = 400
  exportCanvas.width = exportSize
  exportCanvas.height = exportSize
  const ctx = exportCanvas.getContext('2d')

  const previewCanvas = canvasRef.value
  const cropSize = Math.min(previewCanvas.width, previewCanvas.height) * 0.75

  ctx.save()
  // Clip to circle if requested
  if (props.isCircle) {
    ctx.beginPath()
    ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2)
    ctx.clip()
  }

  // Draw scaled & transformed image onto export canvas
  const scaleRatio = exportSize / cropSize
  ctx.translate(exportSize / 2 + offsetX.value * scaleRatio, exportSize / 2 + offsetY.value * scaleRatio)
  ctx.rotate((rotationAngle.value * Math.PI) / 180)
  ctx.scale(zoomLevel.value * scaleRatio, zoomLevel.value * scaleRatio)

  const imgAspect = loadedImage.width / loadedImage.height
  let drawW = previewCanvas.width
  let drawH = previewCanvas.height
  if (imgAspect > 1) {
    drawH = previewCanvas.width / imgAspect
  } else {
    drawW = previewCanvas.height * imgAspect
  }

  ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  const croppedDataUrl = exportCanvas.toDataURL('image/png', 0.92)
  emit('cropComplete', croppedDataUrl)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="title || t('cropper.title') || 'Cắt & Chỉnh kích thước ảnh'" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Crop class="w-5 h-5 text-indigo-500" />
    </template>

    <div class="space-y-4 text-center">
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {{ t('cropper.hint') || 'Kéo di chuyển hoặc Phóng to / Xoay để chỉnh góc cắt ảnh hoàn hảo' }}
      </p>

      <!-- Canvas Box -->
      <div class="relative inline-block rounded-2xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-800 touch-none">
        <canvas
          ref="canvasRef"
          width="320"
          height="320"
          class="cursor-grab active:cursor-grabbing block mx-auto bg-slate-950"
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
      <div class="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <!-- Zoom Slider -->
        <div class="flex items-center gap-3">
          <ZoomOut class="w-4 h-4 text-slate-400 shrink-0" />
          <input
            v-model.number="zoomLevel"
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            class="w-full accent-indigo-600 cursor-pointer"
            @input="handleZoomChange"
          />
          <ZoomIn class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-10 text-right">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>

        <!-- Rotate & Reset Buttons -->
        <div class="flex items-center justify-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            @click="rotate(-1)"
            class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs flex items-center gap-1 transition-all"
            title="Xoay trái 90°"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>-90°</span>
          </button>

          <button
            type="button"
            @click="rotate(1)"
            class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs flex items-center gap-1 transition-all"
            title="Xoay phải 90°"
          >
            <RotateCw class="w-3.5 h-3.5" />
            <span>+90°</span>
          </button>

          <button
            type="button"
            @click="resetTransform"
            class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
            title="Đặt lại"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <button
          type="button"
          @click="emit('close')"
          class="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="cropAndExport"
          class="w-2/3 glow-button py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5"
        >
          <Check class="w-4 h-4" />
          <span>{{ t('cropper.btn_crop') || 'Cắt & Sử dụng ảnh' }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
