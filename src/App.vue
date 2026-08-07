<script setup>
import { useI18n } from 'vue-i18n'
import Navbar from './components/navbar/Navbar.vue'
import MobileBottomNav from './components/navbar/MobileBottomNav.vue'
import ToastContainer from './components/common/ToastContainer.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans antialiased selection:bg-brand-500 selection:text-white">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Mobile App Bottom Navigation Bar -->
    <MobileBottomNav />

    <!-- Global Toast Popups -->
    <ToastContainer />

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-300">MealMate</span>
          <span>&copy; 2026 - {{ t('footer.tagline') }}</span>
        </div>
        <div class="text-slate-400">
          Powered by Vue 3 + Pinia + Vite + Tailwind CSS + Axios
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
