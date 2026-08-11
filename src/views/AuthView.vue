<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import GoogleLoginButton from '../components/auth/GoogleLoginButton.vue'
import { UtensilsCrossed, LogIn, UserPlus, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-vue-next'

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
      <div class="text-center space-y-2.5">
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-200 dark:from-purple-900 dark:to-indigo-900 border border-purple-300/60 dark:border-purple-800/60 flex items-center justify-center mx-auto shadow-sm transform hover:scale-105 transition-all duration-300">
          <UtensilsCrossed class="w-8 h-8 text-purple-950 dark:text-purple-100" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">MealMate</h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{{ t('footer.tagline') }}</p>
        </div>
      </div>

      <!-- Auth Form Card -->
      <div class="glass-card p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-3xl space-y-6">
        
        <!-- Segmented Tab Controls -->
        <div class="grid grid-cols-2 gap-1 bg-slate-100/90 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            type="button"
            @click="isRegister = false; errorMsg = ''"
            :class="[
              'py-2.5 rounded-xl font-extrabold transition-all duration-200',
              !isRegister ? 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-200 text-purple-950 shadow-sm border border-purple-200/80 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('auth.login') }}
          </button>
          <button
            type="button"
            @click="isRegister = true; errorMsg = ''"
            :class="[
              'py-2.5 rounded-xl font-extrabold transition-all duration-200',
              isRegister ? 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-200 text-purple-950 shadow-sm border border-purple-200/80 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('auth.register') }}
          </button>
        </div>

        <!-- Error Notification -->
        <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 font-bold animate-fadeIn">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Inputs Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.username') }} *</label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="alice, bob, admin..."
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
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Alice"
                class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.email') }}</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="alice@gmail.com"
                class="w-full glass-input text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
              />
            </div>
          </template>

          <button type="submit" class="w-full glow-button mt-3 py-3 text-xs font-black flex items-center justify-center gap-2">
            <component :is="isRegister ? UserPlus : LogIn" class="w-4 h-4" />
            <span>{{ isRegister ? t('auth.create_account') : t('auth.login') }}</span>
          </button>
        </form>

        <!-- Google OAuth 2.0 Login -->
        <div class="space-y-3 pt-2">
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Hoặc</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <GoogleLoginButton @success="handleGoogleSuccess" @error="err => errorMsg = err.message" />
        </div>

        <!-- Quick Demo Login Shortcut Buttons (Human UX Touch) -->
        <div v-if="!isRegister" class="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          <span class="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1">
            <Zap class="w-3 h-3 text-amber-500" /> Demo Accounts:
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="quickLogin('alice', '123')"
              class="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5"
            >
              <span>Alice Vongxay</span>
            </button>
            <button
              type="button"
              @click="quickLogin('bob', '123')"
              class="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
            >
              <span>Bob Soukthavy</span>
            </button>
            <button
              type="button"
              @click="quickLogin('admin', '123')"
              class="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-amber-500" />
              <span>Admin</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Reset Demo Data -->
      <div class="text-center">
        <button
          type="button"
          @click="resetDemoData"
          class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1.5 mx-auto transition-colors"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>{{ t('auth.reset_demo_data') }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
