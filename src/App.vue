<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'
import { useMealsStore } from './stores/meals'
import { useGroupsStore } from './stores/groups'
import { useDebtsStore } from './stores/debts'
import { useFriendsStore } from './stores/friends'
import { useNotificationsStore } from './stores/notifications'
import Navbar from './components/navbar/Navbar.vue'
import MobileBottomNav from './components/navbar/MobileBottomNav.vue'
import ToastContainer from './components/common/ToastContainer.vue'

const route = useRoute()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const mealsStore = useMealsStore()
const groupsStore = useGroupsStore()
const debtsStore = useDebtsStore()
const notificationsStore = useNotificationsStore()
const { t } = useI18n()

onMounted(async () => {
  await Promise.allSettled([
    authStore.fetchUsers(),
    friendsStore.fetchFriends(),
    friendsStore.fetchRequests(),
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

    <!-- Main Content Container (Mobile-First Optimized Padding) -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-28 md:pb-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Mobile App Bottom Navigation Bar -->
    <MobileBottomNav />

    <!-- Global Toast Popups -->
    <ToastContainer />
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
