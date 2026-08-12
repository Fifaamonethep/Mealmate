<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useAdminStore } from '../../stores/admin'
import { Shield, Lock, Unlock, Key, Check, User } from 'lucide-vue-next'

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

function canManageUser(targetUser) {
  if (!authStore.currentUser) return false
  return targetUser.role !== 'admin'
}

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
  <Modal :show="show" :title="t('admin.user_modal_title')" maxWidth="max-w-3xl" @close="emit('close')">
    <template #icon>
      <Shield class="w-5 h-5 text-amber-500" />
    </template>

    <div class="space-y-4 text-slate-800 dark:text-slate-200">
      
      <!-- Users Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="p-3.5">{{ t('admin.user') }}</th>
              <th class="p-3.5">{{ t('admin.role') }}</th>
              <th class="p-3.5">{{ t('admin.user_status') }}</th>
              <th class="p-3.5 text-right">{{ t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-900">
            <tr
              v-for="u in authStore.users"
              :key="u.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
            >
              <td class="p-3.5">
                <div class="flex items-center gap-2.5">
                  <img :src="u.avatar" class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                  <div>
                    <div class="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{{ u.name }}</span>
                      <span v-if="u.role === 'admin'" class="bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Shield class="w-3 h-3 text-amber-500" /> Admin
                      </span>
                    </div>
                    <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400">@{{ u.username }} • {{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-3.5">
                <select
                  :value="u.role"
                  :disabled="!canManageUser(u)"
                  @change="adminStore.changeUserRole(u.id, $event.target.value)"
                  class="glass-input text-xs py-1 px-2.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="user">👤 {{ t('admin.role_user') }}</option>
                  <option value="admin">🛡️ {{ t('admin.role_admin') }}</option>
                </select>
              </td>
              <td class="p-3.5">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1',
                    u.isLocked
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', u.isLocked ? 'bg-rose-500' : 'bg-emerald-500']"></span>
                  <span>{{ u.isLocked ? t('admin.lock') : 'OK' }}</span>
                </span>
              </td>
              <td class="p-3.5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="canManageUser(u)"
                    @click="adminStore.toggleUserLock(u.id)"
                    :class="[
                      'px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1 font-bold transition-all shadow-sm',
                      u.isLocked
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 hover:bg-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40 hover:bg-rose-100'
                    ]"
                  >
                    <component :is="u.isLocked ? Unlock : Lock" class="w-3.5 h-3.5" />
                    <span>{{ u.isLocked ? t('admin.unlock') : t('admin.lock') }}</span>
                  </button>

                  <button
                    v-if="canManageUser(u)"
                    @click="resetPasswordUser = u"
                    class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-xs font-bold shadow-sm"
                  >
                    <Key class="w-3.5 h-3.5 text-amber-500" />
                    <span>{{ t('admin.change_pass') }}</span>
                  </button>

                  <span v-if="!canManageUser(u)" class="text-[11px] font-semibold text-slate-400 dark:text-slate-600 italic">
                    Restricted
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Password Reset Form if selected -->
      <div v-if="resetPasswordUser" class="bg-slate-100/90 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 class="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
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
        <p v-if="passResetSuccess" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
          <Check class="w-4 h-4" /> OK!
        </p>
      </div>
    </div>

    <template #footer>
      <button @click="emit('close')" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
        {{ t('common.close') }}
      </button>
    </template>
  </Modal>
</template>
