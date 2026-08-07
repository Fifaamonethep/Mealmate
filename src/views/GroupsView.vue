<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGroupsStore } from '../stores/groups'
import GroupCard from '../components/groups/GroupCard.vue'
import CreateGroupModal from '../components/groups/CreateGroupModal.vue'
import { Users, Plus } from 'lucide-vue-next'

const { t } = useI18n()
const groupsStore = useGroupsStore()

const showCreateGroup = ref(false)
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Title & Create Button -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
          <Users class="w-6 h-6 text-brand-400" />
          <span>{{ t('groups.title') }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('groups.sub') }}</p>
      </div>

      <button @click="showCreateGroup = true" class="glow-button text-xs flex items-center gap-1.5 py-2.5">
        <Plus class="w-4 h-4" />
        <span>{{ t('groups.create_group') }}</span>
      </button>
    </div>

    <!-- Groups Grid -->
    <div v-if="groupsStore.groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GroupCard v-for="g in groupsStore.groups" :key="g.id" :group="g" />
    </div>

    <div v-else class="glass-card p-12 text-center text-slate-400 space-y-2">
      <Users class="w-12 h-12 text-slate-600 mx-auto" />
      <p class="text-sm font-semibold">{{ t('groups.empty') }}</p>
    </div>

    <CreateGroupModal :show="showCreateGroup" @close="showCreateGroup = false" />
  </div>
</template>
