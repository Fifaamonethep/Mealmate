<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { Users, PlusCircle, Image } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'created'])

const { t } = useI18n()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const name = ref('')
const description = ref('')
const avatar = ref('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop')
const selectedMembers = ref([])
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

watch(() => props.show, (newShow) => {
  if (newShow) {
    name.value = ''
    description.value = ''
    avatar.value = presetAvatars[2]
    selectedMembers.value = authStore.users.map(u => u.id)
  }
})

function toggleMember(userId) {
  if (selectedMembers.value.includes(userId)) {
    if (selectedMembers.value.length > 1) {
      selectedMembers.value = selectedMembers.value.filter(id => id !== userId)
    }
  } else {
    selectedMembers.value.push(userId)
  }
}

function handleSubmit() {
  if (!name.value) return

  groupsStore.createGroup({
    name: name.value,
    description: description.value,
    avatar: avatar.value,
    ownerId: authStore.currentUserId,
    members: selectedMembers.value
  })

  emit('created')
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('groups.create_group')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Users class="w-5 h-5 text-brand-600 dark:text-brand-400" />
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
          :placeholder="t('groups.description_placeholder')"
          class="w-full glass-input text-xs resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('groups.add_members') }} ({{ selectedMembers.length }})</label>
        <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div
            v-for="u in authStore.users"
            :key="u.id"
            @click="toggleMember(u.id)"
            :class="[
              'cursor-pointer flex items-center gap-2 p-2 rounded-lg text-xs transition-all border',
              selectedMembers.includes(u.id)
                ? 'bg-brand-500/20 border-brand-500/60 text-brand-900 dark:text-white font-bold'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
          >
            <img :src="u.avatar" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span class="truncate">{{ u.name }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleSubmit" class="glow-button text-xs flex items-center gap-2 py-2">
        <PlusCircle class="w-4 h-4" />
        <span>{{ t('groups.submit_create') }}</span>
      </button>
    </template>
  </Modal>
</template>
