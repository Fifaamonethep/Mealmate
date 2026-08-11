<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  clientId: {
    type: String,
    default: () => import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  }
})

const emit = defineEmits(['success', 'error'])

const containerRef = ref(null)

onMounted(() => {
  if (!props.clientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID chưa được cấu hình trong file .env')
  }

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: props.clientId || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
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
    <div ref="containerRef" id="googleBtn" class="w-full min-h-[40px] flex justify-center"></div>
  </div>
</template>
