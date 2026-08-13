<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import GoogleLoginButton from '../components/auth/GoogleLoginButton.vue'
import logoImg from '../../ChatGPT Image Aug 12, 2026, 10_37_57 AM (1).png'
import { UtensilsCrossed, LogIn, UserPlus, AlertCircle, UserCheck, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isRegister = ref(false)
const errorMsg = ref('')

const form = ref({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  currency: 'LAK'
})

async function handleAuth() {
  errorMsg.value = ''
  try {
    let loggedUser
    if (isRegister.value) {
      loggedUser = await authStore.register(form.value)
    } else {
      loggedUser = await authStore.login(form.value.username, form.value.password)
    }
    if (loggedUser?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.message
  }
}

function switchToRegisterWithUsername() {
  isRegister.value = true
  if (!form.value.name) {
    form.value.name = form.value.username
  }
  errorMsg.value = ''
}

async function handleGoogleSuccess(idToken) {
  errorMsg.value = ''
  try {
    const loggedUser = await authStore.loginWithGoogle(idToken)
    if (loggedUser?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.message
  }
}

async function quickLogin(username, password) {
  form.value.username = username
  form.value.password = password
  isRegister.value = false
  await handleAuth()
}

function resetDemoData() {
  localStorage.clear()
  window.location.reload()
}
</script>

<template>
  <div class="min-h-[82vh] flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-md space-y-6">
      
      <!-- Brand Logo & Header -->
      <div class="text-center space-y-3">
        <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
          <img
            :src="logoImg"
            class="w-20 h-20 object-contain transform hover:scale-105 transition-all duration-300 relative z-10 shrink-0"
            alt="MealMate Logo"
          />
        </div>
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">MealMate</h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{{ t('footer.tagline') }}</p>
        </div>
      </div>

      <!-- Auth Form Card -->
      <div class="glass-card p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-3xl space-y-6">

        <!-- Error Notification with Quick Register CTA -->
        <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl space-y-2 animate-fadeIn">
          <div class="flex items-center gap-2.5 font-bold">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>
          <!-- Quick switch to Register button if account not found -->
          <div v-if="!isRegister && (errorMsg.includes('không tồn tại') || errorMsg.includes('not exist') || errorMsg.includes('user_not_found') || errorMsg.includes('Account does not exist'))" class="pt-1 border-t border-rose-500/20">
            <button
              type="button"
              @click="switchToRegisterWithUsername"
              class="w-full text-left text-xs text-purple-600 dark:text-purple-400 font-extrabold hover:underline flex items-center gap-1.5"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>Chưa có tài khoản? Bấm vào đây để Đăng ký ngay với "{{ form.username || 'tên này' }}" →</span>
            </button>
          </div>
        </div>

        <!-- Inputs Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.username') }} *</label>
            <input
              v-model="form.username"
              type="text"
              required
              :placeholder="t('auth.username')"
              class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.password') }} *</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
            />
          </div>

          <template v-if="isRegister">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.name') }} *</label>
              <input
                v-model="form.name"
                type="text"
                required
                :placeholder="t('auth.name')"
                class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.email') }}</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="name@example.com"
                  class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.phone') }}</label>
                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="020..."
                  class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('meals.currency') }}</label>
              <select
                v-model="form.currency"
                class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
              >
                <option value="LAK">LAK (Kip Lào)</option>
                <option value="VND">VND (Đồng Việt Nam)</option>
                <option value="THB">THB (Baht Thái)</option>
                <option value="USD">USD (Đô la Mỹ)</option>
              </select>
            </div>
          </template>

          <button type="submit" class="w-full glow-button mt-3 py-3 text-xs font-black flex items-center justify-center gap-2">
            <component :is="isRegister ? UserPlus : LogIn" class="w-4 h-4" />
            <span>{{ isRegister ? t('auth.create_account') : t('auth.login') }}</span>
          </button>
        </form>

        <!-- Toggle Switch Link under form -->
        <div class="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
          <span v-if="!isRegister">
            Chưa có tài khoản?
            <button
              type="button"
              @click="isRegister = true; errorMsg = ''"
              class="font-extrabold text-purple-600 dark:text-purple-400 hover:underline ml-1"
            >
              Đăng ký ngay
            </button>
          </span>
          <span v-else>
            Đã có tài khoản?
            <button
              type="button"
              @click="isRegister = false; errorMsg = ''"
              class="font-extrabold text-purple-600 dark:text-purple-400 hover:underline ml-1"
            >
              Đăng nhập ngay
            </button>
          </span>
        </div>

        <!-- Google OAuth 2.0 Login -->
        <div class="space-y-3 pt-2">
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">{{ t('auth.or') }}</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <GoogleLoginButton @success="handleGoogleSuccess" @error="err => errorMsg = err.message" />
        </div>

      </div>
    </div>
  </div>
</template>
