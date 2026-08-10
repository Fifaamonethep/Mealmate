<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  show: Boolean,
  title: String,
  maxWidth: {
    type: String,
    default: 'max-w-md'
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      @click.self="emit('close')"
    >
      <div
        :class="[
          'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 text-slate-900 dark:text-slate-100',
          maxWidth
        ]"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <slot name="icon"></slot>
            <span>{{ title }}</span>
          </h3>
          <button
            @click="emit('close')"
            class="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <slot></slot>
        </div>

        <!-- Modal Footer (Optional) -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end gap-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
