<script setup>
import { useI18n } from 'vue-i18n'
import Navbar from './components/navbar/Navbar.vue'
import MobileBottomNav from './components/navbar/MobileBottomNav.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import { Phone, Mail } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300">
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
    <footer class="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-slate-800 dark:text-slate-200">MealMate</span>
          <span>&copy; 2026 - {{ t('footer.tagline') }}</span>
        </div>
        
        <!-- Contact Info -->
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ t('footer.contact_support') }}</span>
          <span class="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
            <Phone class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> 2098667856
          </span>
          <span class="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
            <Mail class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> sokeskesannouanlaty@gmail.com
          </span>
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
