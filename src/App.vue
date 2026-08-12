<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'
import { useMealsStore } from './stores/meals'
import { useGroupsStore } from './stores/groups'
import { useDebtsStore } from './stores/debts'
import { useNotificationsStore } from './stores/notifications'
import Navbar from './components/navbar/Navbar.vue'
import MobileBottomNav from './components/navbar/MobileBottomNav.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import logoImg from '../ChatGPT Image Aug 12, 2026, 10_37_57 AM (1).png'
import { Phone, Mail } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const mealsStore = useMealsStore()
const groupsStore = useGroupsStore()
const debtsStore = useDebtsStore()
const notificationsStore = useNotificationsStore()
const { t } = useI18n()

onMounted(async () => {
  await Promise.allSettled([
    authStore.fetchUsers(),
    mealsStore.fetchMeals(),
    groupsStore.fetchGroups(),
    debtsStore.fetchDebts(),
    notificationsStore.fetchNotifications()
  ])
})
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

    <!-- Footer (Hidden on Login Page) -->
    <footer v-if="route.path !== '/login' && authStore.currentUserId" class="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <img :src="logoImg" class="w-6 h-6 object-contain drop-shadow-sm shrink-0" alt="MealMate Logo" />
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
