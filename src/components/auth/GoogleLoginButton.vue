<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  clientId: {
    type: String,
    default: () => import.meta.env.VITE_GOOGLE_CLIENT_ID || '286935273027-r7da4lss8asctpfa1as3l418jp5e11p8.apps.googleusercontent.com'
  }
})

const emit = defineEmits(['success', 'error'])
const containerRef = ref(null)
const { locale } = useI18n()

const isConfigured = computed(() => {
  return !!props.clientId && !props.clientId.includes('YOUR_GOOGLE_CLIENT_ID')
})

onMounted(() => {
  if (!isConfigured.value) {
    console.warn('VITE_GOOGLE_CLIENT_ID chưa được cấu hình hợp lệ trong file .env')
    return
  }

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: props.clientId,
        locale: locale.value === 'lo' ? 'lo' : (locale.value === 'th' ? 'th' : 'en'),
        callback: (response) => {
          if (response.credential) {
            emit('success', response.credential)
          } else {
            emit('error', new Error('Google Sign-In failed'))
          }
        }
      })

      if (containerRef.value) {
        window.google.accounts.id.renderButton(containerRef.value, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular'
        })
      }
    }
  }
  document.head.appendChild(script)
})
</script>

<template>
  <div class="w-full flex justify-center my-2">
    <div v-if="isConfigured" ref="containerRef" id="googleBtn" class="w-full min-h-[40px] flex justify-center"></div>
    <div v-else class="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs text-left font-medium space-y-1">
      <div class="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
        <span>⚠️ Chưa kích hoạt Đăng nhập Google Client ID</span>
      </div>
      <p class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
        Vui lòng điền mã <strong>VITE_GOOGLE_CLIENT_ID</strong> vào file <code>.env</code> và đăng ký Domain trên <strong>Google Cloud Console</strong>.
      </p>
    </div>
  </div>
</template>
