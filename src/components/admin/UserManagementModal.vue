<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'
import { Shield, Lock, Unlock, Key, Check } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const resetPasswordUser = ref(null)
const newPass = ref('')
const passResetSuccess = ref(false)

function handleResetPassword() {
  if (!resetPasswordUser.value || !newPass.value) return
  adminStore.resetUserPassword(resetPasswordUser.value.id, newPass.value)
  passResetSuccess.value = true
  setTimeout(() => {
    passResetSuccess.value = false
    resetPasswordUser.value = null
    newPass.value = ''
  }, 2000)
}
</script>

<template>
  <Modal :show="show" :title="t('admin.user_modal_title')" maxWidth="max-w-2xl" @close="emit('close')">
    <template #icon>
      <Shield class="w-5 h-5 text-amber-400" />
    </template>

    <div class="space-y-4 text-slate-200">
      
      <!-- Users Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th class="p-3">{{ t('admin.user') }}</th>
              <th class="p-3">{{ t('admin.role') }}</th>
              <th class="p-3">{{ t('admin.user_status') }}</th>
              <th class="p-3 text-right">{{ t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in authStore.users"
              :key="u.id"
              class="border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors"
            >
              <td class="p-3">
                <div class="flex items-center gap-2">
                  <img :src="u.avatar" class="w-6 h-6 rounded-full bg-slate-800" />
                  <div>
                    <div class="font-bold text-white">{{ u.name }}</div>
                    <div class="text-[11px] text-slate-400">@{{ u.username }} • {{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-3">
                <select
                  :value="u.role"
                  @change="adminStore.changeUserRole(u.id, $event.target.value)"
                  class="glass-input text-xs py-1 px-2 bg-slate-900 border-slate-700"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td class="p-3">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                    u.isLocked
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  ]"
                >
                  {{ u.isLocked ? t('admin.lock') : 'OK' }}
                </span>
              </td>
              <td class="p-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="u.role !== 'admin'"
                    @click="adminStore.toggleUserLock(u.id)"
                    :class="[
                      'p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all',
                      u.isLocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    ]"
                  >
                    <component :is="u.isLocked ? Unlock : Lock" class="w-3.5 h-3.5" />
                    <span>{{ u.isLocked ? t('admin.unlock') : t('admin.lock') }}</span>
                  </button>

                  <button
                    @click="resetPasswordUser = u"
                    class="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center gap-1 text-xs"
                  >
                    <Key class="w-3.5 h-3.5 text-amber-400" />
                    <span>{{ t('admin.change_pass') }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Password Reset Form if selected -->
      <div v-if="resetPasswordUser" class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
        <h4 class="font-bold text-xs text-amber-400 flex items-center gap-1.5">
          <Key class="w-4 h-4" />
          {{ t('profile.change_password_title') }}: {{ resetPasswordUser.name }} (@{{ resetPasswordUser.username }})
        </h4>
        <div class="flex items-center gap-2">
          <input
            v-model="newPass"
            type="text"
            :placeholder="t('profile.new_password')"
            class="glass-input text-xs w-full"
          />
          <button @click="handleResetPassword" class="glow-button text-xs py-2 px-4 shrink-0">
            {{ t('common.confirm') }}
          </button>
        </div>
        <p v-if="passResetSuccess" class="text-xs text-emerald-400 flex items-center gap-1">
          <Check class="w-4 h-4" /> OK!
        </p>
      </div>
    </div>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800">
        {{ t('common.close') }}
      </button>
    </template>
  </Modal>
</template>
