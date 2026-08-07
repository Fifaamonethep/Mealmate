import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import MealsView from '../views/MealsView.vue'
import MealDetailView from '../views/MealDetailView.vue'
import DebtsView from '../views/DebtsView.vue'
import GroupsView from '../views/GroupsView.vue'
import GroupDetailView from '../views/GroupDetailView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/meals',
    name: 'Meals',
    component: MealsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/meals/:id',
    name: 'MealDetail',
    component: MealDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/debts',
    name: 'Debts',
    component: DebtsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: GroupsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:id',
    name: 'GroupDetail',
    component: GroupDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.currentUserId

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Dashboard' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
