<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { User, Key, Save, Check, Lock, Camera, Image, Upload } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const toastStore = useToastStore()

const avatarFileInput = ref(null)

const form = ref({
  name: authStore.currentUser?.name || '',
  email: authStore.currentUser?.email || '',
  phone: authStore.currentUser?.phone || '',
  currency: authStore.currentUser?.currency || 'VND',
  avatar: authStore.currentUser?.avatar || '',
  qrCodeUrl: authStore.currentUser?.qrCodeUrl || ''
})

const sampleAvatars = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
]

const passForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passError = ref('')

function triggerAvatarFileSelect() {
  avatarFileInput.value?.click()
}

function handleAvatarFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toastStore.showToast('Please select a valid image file!', 'warning')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
    toastStore.showToast(t('profile.updated_success'), 'success')
  }
  reader.readAsDataURL(file)
}

function handleSave() {
  authStore.updateProfile(form.value)
  toastStore.showToast(t('profile.updated_success'), 'success')
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
  toastStore.showToast(t('profile.password_changed_success'), 'success')
  passForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    
    <!-- Hidden File Input for Device Gallery Selection -->
    <input
      ref="avatarFileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarFileUpload"
    />

    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <User class="w-6 h-6 text-brand-600 dark:text-brand-400" />
        <span>{{ t('profile.title') }}</span>
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t('profile.sub') }}</p>
    </div>

    <!-- Main Profile Card -->
    <div class="glass-card p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
      
      <!-- User Avatar header with Camera overlay -->
      <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div class="relative group cursor-pointer shrink-0" @click="triggerAvatarFileSelect" title="Click to upload from gallery">
          <img :src="form.avatar || authStore.currentUser?.avatar" class="w-16 h-16 rounded-full border-2 border-brand-500/60 bg-slate-200 dark:bg-slate-900 object-cover shadow-md transition-transform group-hover:scale-105" />
          <div class="absolute inset-0 bg-slate-950/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera class="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ authStore.currentUser?.id === 'u-admin' ? t('admin.role_admin') : authStore.currentUser?.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">@{{ authStore.currentUser?.username }} • Role: {{ authStore.currentUser?.role }}</p>
          <button
            type="button"
            @click="triggerAvatarFileSelect"
            class="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 mt-1"
          >
            <Camera class="w-3.5 h-3.5" /> {{ t('profile.upload_gallery') }}
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4 text-slate-800 dark:text-slate-200">
        <!-- Avatar Change Input & Gallery Picker Button -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('profile.avatar_url') }}</label>
          <div class="flex items-center gap-2">
            <input v-model="form.avatar" type="text" class="w-full glass-input text-xs" placeholder="https://..." />
            <button
              type="button"
              @click="triggerAvatarFileSelect"
              class="px-3 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
            >
              <Image class="w-4 h-4" />
              <span class="hidden sm:inline">{{ t('profile.upload_gallery') }}</span>
            </button>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{{ t('common.suggestions') }}</span>
            <div class="flex items-center gap-1.5">
              <img
                v-for="(img, idx) in sampleAvatars"
                :key="idx"
                :src="img"
                @click="form.avatar = img"
                :class="[
                  'w-7 h-7 rounded-full object-cover cursor-pointer border transition-all bg-slate-200 dark:bg-slate-800',
                  form.avatar === img ? 'border-brand-500 ring-2 ring-brand-500/30 scale-110' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                ]"
              />
            </div>
          </div>
        </div>

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
              <option value="VND">{{ t('common.currency_vnd') }}</option>
              <option value="THB">{{ t('common.currency_thb') }}</option>
              <option value="USD">{{ t('common.currency_usd') }}</option>
              <option value="LAK">{{ t('common.currency_lak') }}</option>
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
