<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { User, Key, Save, Check, Lock } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const toastStore = useToastStore()

const form = ref({
  name: authStore.currentUser?.name || '',
  email: authStore.currentUser?.email || '',
  phone: authStore.currentUser?.phone || '',
  currency: authStore.currentUser?.currency || 'VND',
  qrCodeUrl: authStore.currentUser?.qrCodeUrl || ''
})

const passForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passError = ref('')

function handleSave() {
  authStore.updateProfile(form.value)
  toastStore.showToast('Profile updated!', 'success')
}

function handleChangePassword() {
  passError.value = ''
  if (!passForm.value.currentPassword || !passForm.value.newPassword) {
    passError.value = 'Please fill out all password fields!'
    return
  }

  if (passForm.value.currentPassword !== authStore.currentUser?.passwordHash) {
    passError.value = 'Current password incorrect!'
    return
  }

  if (passForm.value.newPassword.length < 4) {
    passError.value = 'New password must be at least 4 characters!'
    return
  }

  if (passForm.value.newPassword !== passForm.value.confirmPassword) {
    passError.value = 'Confirm password does not match!'
    return
  }

  authStore.updateProfile({ passwordHash: passForm.value.newPassword })
  toastStore.showToast('Password changed successfully!', 'success')
  passForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <User class="w-6 h-6 text-brand-600 dark:text-brand-400" />
        <span>{{ t('profile.title') }}</span>
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t('profile.sub') }}</p>
    </div>

    <!-- Main Profile Card -->
    <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
      
      <!-- User Avatar header -->
      <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
        <img :src="authStore.currentUser?.avatar" class="w-16 h-16 rounded-full border-2 border-brand-500/60 bg-slate-200 dark:bg-slate-900" />
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ authStore.currentUser?.name }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">@{{ authStore.currentUser?.username }} • Role: {{ authStore.currentUser?.role }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4 text-slate-800 dark:text-slate-200">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.display_name') }}</label>
            <input v-model="form.name" type="text" required class="w-full glass-input text-xs" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.phone') }}</label>
            <input v-model="form.phone" type="text" class="w-full glass-input text-xs" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.email') }}</label>
          <input v-model="form.email" type="email" class="w-full glass-input text-xs" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.default_currency') }}</label>
            <select v-model="form.currency" class="w-full glass-input text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <option value="VND">VND (Việt Nam Đổng)</option>
              <option value="THB">THB (Baht Thái)</option>
              <option value="USD">USD (Đô la Mỹ)</option>
              <option value="LAK">LAK (Kip Lào)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.qr_link') }}</label>
            <input v-model="form.qrCodeUrl" type="text" class="w-full glass-input text-xs" placeholder="https://..." />
          </div>
        </div>

        <!-- Bank QR Preview -->
        <div class="space-y-2 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div class="p-1.5 bg-white rounded-xl border border-slate-200 shrink-0">
            <img :src="form.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR'" class="w-24 h-24 object-contain" />
          </div>
          <div class="text-xs space-y-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 block">{{ t('profile.your_qr_title') }}</span>
            <p class="text-slate-500 dark:text-slate-400">
              {{ t('profile.your_qr_sub') }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end">
          <button type="submit" class="glow-button text-xs flex items-center gap-2 py-2.5">
            <Save class="w-4 h-4" />
            <span>{{ t('profile.save_profile') }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Password Change Section -->
    <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
      <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
        <Key class="w-5 h-5 text-amber-500" />
        <span>{{ t('profile.change_password_title') }}</span>
      </h3>

      <p v-if="passError" class="text-xs text-rose-600 dark:text-rose-400 font-medium">{{ passError }}</p>

      <form @submit.prevent="handleChangePassword" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.current_password') }}</label>
          <input
            v-model="passForm.currentPassword"
            type="password"
            required
            class="w-full glass-input text-xs"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.new_password') }}</label>
            <input
              v-model="passForm.newPassword"
              type="password"
              required
              class="w-full glass-input text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.confirm_password') }}</label>
            <input
              v-model="passForm.confirmPassword"
              type="password"
              required
              class="w-full glass-input text-xs"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all">
            <Lock class="w-3.5 h-3.5" />
            <span>{{ t('profile.btn_change_password') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
