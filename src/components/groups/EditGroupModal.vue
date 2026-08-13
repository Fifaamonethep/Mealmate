<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useGroupsStore } from '../../stores/groups'
import { useToastStore } from '../../stores/toast'
import { Users, Edit3, Save, Image } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  group: Object
})

const emit = defineEmits(['close', 'updated'])

const { t } = useI18n()
const groupsStore = useGroupsStore()
const toastStore = useToastStore()

const name = ref('')
const description = ref('')
const avatar = ref('')
const groupAvatarFileInput = ref(null)

function triggerGroupAvatarSelect() {
  groupAvatarFileInput.value?.click()
}

function handleGroupAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    avatar.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const presetAvatars = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop'
]

watch(() => props.group, (newGroup) => {
  if (newGroup) {
    name.value = newGroup.name || ''
    description.value = newGroup.description || ''
    avatar.value = newGroup.avatar || presetAvatars[0]
  }
}, { immediate: true })

async function handleSubmit() {
  if (!props.group || !name.value.trim()) return

  await groupsStore.updateGroup(props.group.id, {
    name: name.value.trim(),
    description: description.value.trim(),
    avatar: avatar.value
  })

  toastStore.showToast(t('groups.group_updated_success'), 'success')
  emit('updated')
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('groups.edit_group_title')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Edit3 class="w-5 h-5 text-brand-600 dark:text-brand-400" />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4 text-slate-800 dark:text-slate-200">
      <input ref="groupAvatarFileInput" type="file" accept="image/*" class="hidden" @change="handleGroupAvatarUpload" />

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('groups.group_name') }}</label>
        <input
          v-model="name"
          type="text"
          required
          :placeholder="t('groups.group_name_placeholder')"
          class="w-full glass-input text-xs"
        />
      </div>

      <!-- Group Avatar Picker -->
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('groups.group_avatar_label') }}</label>
        <div class="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <img :src="avatar" class="w-10 h-10 rounded-xl object-cover border-2 border-brand-500/50 shadow-sm shrink-0" />
            <div class="flex items-center gap-1.5">
              <img
                v-for="(img, idx) in presetAvatars"
                :key="idx"
                :src="img"
                @click="avatar = img"
                :class="[
                  'w-7 h-7 rounded-lg object-cover cursor-pointer border transition-all',
                  avatar === img ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                ]"
              />
            </div>
          </div>

          <button
            type="button"
            @click="triggerGroupAvatarSelect"
            class="px-3 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
          >
            <Image class="w-4 h-4" />
            <span class="hidden sm:inline">{{ t('profile.upload_gallery') }}</span>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('groups.description') }}</label>
        <textarea
          v-model="description"
          rows="2"
          class="w-full glass-input text-xs resize-none"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleSubmit" class="glow-button text-xs flex items-center gap-2 py-2">
        <Save class="w-4 h-4" />
        <span>{{ t('common.save') }}</span>
      </button>
    </template>
  </Modal>
</template>
