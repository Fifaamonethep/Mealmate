<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { UtensilsCrossed, ShieldCheck, LogIn, UserPlus, AlertCircle, RefreshCw } from 'lucide-vue-next'

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
  currency: 'VND'
})

function handleAuth() {
  errorMsg.value = ''
  try {
    let loggedUser
    if (isRegister.value) {
      loggedUser = authStore.register(form.value)
    } else {
      loggedUser = authStore.login(form.value.username, form.value.password)
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

function quickLogin(username, password) {
  form.value.username = username
  form.value.password = password
  handleAuth()
}

function resetDemoData() {
  localStorage.clear()
  window.location.reload()
}
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center py-10 px-4">
    <div class="w-full max-w-md space-y-6">
      
      <!-- Brand Title -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/30">
          <UtensilsCrossed class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">MealMate</h1>
        <p class="text-xs text-slate-400">{{ t('footer.tagline') }}</p>
      </div>

      <!-- Auth Form Card -->
      <div class="glass-card p-6 border border-slate-700/80 space-y-5">
        
        <!-- Tab Switcher -->
        <div class="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            @click="isRegister = false; errorMsg = ''"
            :class="[
              'py-2 rounded-lg font-bold transition-all',
              !isRegister ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ t('auth.login') }}
          </button>
          <button
            @click="isRegister = true; errorMsg = ''"
            :class="[
              'py-2 rounded-lg font-bold transition-all',
              isRegister ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ t('auth.register') }}
          </button>
        </div>

        <!-- Error Banner -->
        <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleAuth" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('auth.username') }} *</label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="alice, bob, admin..."
              class="w-full glass-input text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('auth.password') }} *</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full glass-input text-sm"
            />
          </div>

          <template v-if="isRegister">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('auth.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Alice"
                class="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ t('auth.email') }}</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="alice@gmail.com"
                class="w-full glass-input text-sm"
              />
            </div>
          </template>

          <button type="submit" class="w-full glow-button mt-2 py-3 text-sm flex items-center justify-center gap-2">
            <component :is="isRegister ? UserPlus : LogIn" class="w-4 h-4" />
            <span>{{ isRegister ? t('auth.create_account') : t('auth.login') }}</span>
          </button>
        </form>

        <!-- Quick Switch Test Accounts Bar -->
        <div class="pt-4 border-t border-slate-800 space-y-2">
          <div class="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
            <span>{{ t('auth.switch_test_user') }}</span>
            <span class="text-brand-400 font-mono">Pass: 123</span>
          </div>

          <div class="grid grid-cols-3 gap-1.5 text-xs">
            <button
              @click="quickLogin('admin', '123')"
              class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold transition-all truncate"
            >
              👑 Admin
            </button>
            <button
              @click="quickLogin('alice', '123')"
              class="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-medium transition-all truncate"
            >
              Alice
            </button>
            <button
              @click="quickLogin('bob', '123')"
              class="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-medium transition-all truncate"
            >
              Bob
            </button>
          </div>
        </div>
      </div>

      <!-- Reset Demo Data -->
      <div class="text-center">
        <button
          @click="resetDemoData"
          class="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mx-auto transition-colors"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>{{ t('auth.reset_demo_data') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
