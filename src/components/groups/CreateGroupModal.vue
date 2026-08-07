<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useGroupsStore } from '../../stores/groups'
import { Users, PlusCircle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'created'])

const { t } = useI18n()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const name = ref('')
const description = ref('')
const selectedMembers = ref([])

watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedMembers.value = authStore.currentUserId ? [authStore.currentUserId] : []
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

  const newGroup = groupsStore.createGroup({
    name: name.value,
    description: description.value,
    members: selectedMembers.value
  })

  name.value = ''
  description.value = ''
  emit('created', newGroup)
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="t('groups.create_group')" maxWidth="max-w-md" @close="emit('close')">
    <template #icon>
      <Users class="w-5 h-5 text-brand-400" />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4 text-slate-200">
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('groups.group_name') }}</label>
        <input
          v-model="name"
          type="text"
          required
          :placeholder="t('groups.group_name_placeholder')"
          class="w-full glass-input text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('groups.description') }}</label>
        <textarea
          v-model="description"
          rows="2"
          :placeholder="t('groups.description_placeholder')"
          class="w-full glass-input text-sm resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('groups.add_members') }} ({{ selectedMembers.length }})</label>
        <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
          <div
            v-for="u in authStore.users"
            :key="u.id"
            @click="toggleMember(u.id)"
            :class="[
              'cursor-pointer flex items-center gap-2 p-2 rounded-lg text-xs transition-all border',
              selectedMembers.includes(u.id)
                ? 'bg-brand-600/30 border-brand-500/50 text-white font-medium'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            ]"
          >
            <img :src="u.avatar" class="w-5 h-5 rounded-full bg-slate-800" />
            <span class="truncate">{{ u.name }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleSubmit" class="glow-button text-sm flex items-center gap-2">
        <PlusCircle class="w-4 h-4" />
        <span>{{ t('groups.submit_create') }}</span>
      </button>
    </template>
  </Modal>
</template>
