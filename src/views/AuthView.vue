<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import GoogleLoginButton from '../components/auth/GoogleLoginButton.vue'
import logoImg from '../../ChatGPT Image Aug 12, 2026, 10_37_57 AM (1).png'
import { LogIn, UserPlus, AlertCircle, User, Lock, Mail, Phone, Coins, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isRegister = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  identifier: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  currency: 'LAK'
})

async function handleAuth() {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    let loggedUser
    if (isRegister.value) {
      if (!form.value.phone) {
        errorMsg.value = t('auth.phone') + ' *'
        return
      }
      if (form.value.password !== form.value.confirmPassword) {
        errorMsg.value = t('auth.passwords_not_match')
        return
      }
      loggedUser = await authStore.register({
        phone: form.value.phone,
        name: form.value.name,
        username: form.value.username || form.value.phone.replace(/[^0-9]/g, ''),
        password: form.value.password,
        email: form.value.email,
        currency: form.value.currency
      })
    } else {
      const loginKey = form.value.identifier.trim()
      if (!loginKey) {
        errorMsg.value = t('auth.phone_or_user') + ' *'
        return
      }
      loggedUser = await authStore.login(loginKey, form.value.password)
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

function switchToRegisterWithPhone() {
  isRegister.value = true
  if (form.value.identifier) {
    const cleanPhone = form.value.identifier.replace(/[^0-9]/g, '')
    if (cleanPhone.length >= 6) {
      form.value.phone = form.value.identifier
    } else {
      form.value.username = form.value.identifier
      form.value.name = form.value.identifier
    }
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
</script>

<template>
  <div class="relative min-h-[85vh] flex items-center justify-center py-10 px-4">
    
    <div class="w-full max-w-md space-y-6 relative z-10">
      
      <!-- Brand Logo & Header -->
      <div class="text-center space-y-2">
        <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
          <img
            :src="logoImg"
            class="w-20 h-20 object-contain relative z-10 drop-shadow-sm shrink-0"
            alt="MealMate Logo"
          />
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>MealMate</span>
            <Sparkles class="w-5 h-5 text-amber-500" />
          </h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {{ t('footer.tagline') }}
          </p>
        </div>
      </div>

      <!-- Auth Form Card -->
      <div class="relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-3xl space-y-5">
        
        <!-- Form Mode Heading -->
        <div class="text-center pb-1 border-b border-slate-100 dark:border-slate-800/80">
          <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <component :is="isRegister ? UserPlus : LogIn" class="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>{{ isRegister ? t('auth.create_account') : t('auth.login') }}</span>
          </h2>
        </div>

        <!-- Error Notification banner -->
        <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-2xl space-y-2 animate-fadeIn">
          <div class="flex items-center gap-2.5 font-bold">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>
          <!-- Quick switch to Register button if account not found -->
          <div v-if="!isRegister && (errorMsg.includes('không tồn tại') || errorMsg.includes('not exist') || errorMsg.includes('user_not_found') || errorMsg.includes('Account does not exist') || errorMsg.includes('ບໍ່ມີຢູ່ໃນລະບົບ'))" class="pt-1.5 border-t border-rose-500/20">
            <button
              type="button"
              @click="switchToRegisterWithPhone"
              class="w-full text-left text-xs text-purple-600 dark:text-purple-400 font-extrabold hover:underline flex items-center gap-1.5"
            >
              <UserPlus class="w-3.5 h-3.5 shrink-0" />
              <span>{{ t('auth.create_account') }} ({{ form.identifier }}) →</span>
            </button>
          </div>
        </div>

        <!-- Inputs Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          
          <!-- LOGIN VIEW -->
          <template v-if="!isRegister">
            <!-- Identifier (Phone or Username) -->
            <div>
              <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {{ t('auth.phone_or_user') }} <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <Phone class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="form.identifier"
                  type="text"
                  required
                  :placeholder="t('auth.phone_placeholder')"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {{ t('auth.password') }} <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </template>

          <!-- REGISTER VIEW -->
          <template v-else>
            <!-- Phone Number Input (Primary Identifier) -->
            <div>
              <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {{ t('auth.phone') }} <span class="text-rose-500">*</span>
              </label>
              <div class="relative flex items-center">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                  <Phone class="w-4 h-4" />
                  <span class="text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700 pr-1.5">+856</span>
                </div>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="20XXXXXXXX / 30XXXXXXXX"
                  class="w-full pl-20 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <!-- Full Name / Display Name -->
            <div>
              <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                {{ t('auth.name') }} <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="form.name"
                  type="text"
                  required
                  :placeholder="t('auth.name')"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <!-- Password & Confirm Password -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                  {{ t('auth.password') }} <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <component :is="showPassword ? EyeOff : Eye" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                  {{ t('auth.confirm_password') }} <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <component :is="showConfirmPassword ? EyeOff : Eye" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Email & Currency -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('auth.email') }}</label>
                <div class="relative">
                  <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="name@example.com"
                    class="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">{{ t('meals.currency') }}</label>
                <div class="relative">
                  <Coins class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    v-model="form.currency"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  >
                    <option value="LAK">LAK (₭ ກີບລາວ)</option>
                    <option value="THB">THB (฿ ບາດໄທ)</option>
                    <option value="USD">USD ($ ໂດລາສະຫະລັດ)</option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <component :is="isRegister ? UserPlus : LogIn" class="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{{ isRegister ? t('auth.create_account') : t('auth.login') }}</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <!-- Sky Blue Quick Switch Prompt Link -->
          <div class="text-center pt-1.5">
            <template v-if="!isRegister">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {{ t('auth.dont_have_account') }}
              </span>
              <button
                type="button"
                @click="isRegister = true; errorMsg = '';"
                class="ml-1.5 text-xs font-black text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 hover:underline cursor-pointer transition-colors"
              >
                {{ t('auth.register_link') }}
              </button>
            </template>
            <template v-else>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {{ t('auth.already_have_account') }}
              </span>
              <button
                type="button"
                @click="isRegister = false; errorMsg = '';"
                class="ml-1.5 text-xs font-black text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 hover:underline cursor-pointer transition-colors"
              >
                {{ t('auth.login_link') }}
              </button>
            </template>
          </div>
        </form>

        <!-- Google OAuth 2.0 Login -->
        <div class="space-y-4 pt-1">
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('auth.or') }}</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <GoogleLoginButton @success="handleGoogleSuccess" @error="err => errorMsg = err.message" />
        </div>

      </div>
    </div>
  </div>
</template>
