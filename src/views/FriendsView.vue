<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { INITIAL_USERS } from '../mock/seedData'
import { useFriendsStore } from '../stores/friends'
import { useMealsStore } from '../stores/meals'
import { useDebtsStore } from '../stores/debts'
import { useToastStore } from '../stores/toast'
import Modal from '../components/common/Modal.vue'
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Plus,
  QrCode,
  Check,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  SearchX,
  X
} from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const mealsStore = useMealsStore()
const debtsStore = useDebtsStore()
const toastStore = useToastStore()

onMounted(async () => {
  friendsStore.isLoading = true
  try {
    await Promise.allSettled([
      friendsStore.fetchFriends(),
      friendsStore.fetchRequests(),
      friendsStore.searchUsers(''),
      authStore.fetchUsers()
    ])
  } finally {
    friendsStore.isLoading = false
  }
})

const activeTab = ref('my_friends') // 'my_friends' | 'requests'
const searchQuery = ref('')
const showAddFriendModal = ref(false)
const showQrModal = ref(false)
const selectedFriendQr = ref(null)
const actionLoadingId = ref(null)

// Search in modal
const modalSearchQuery = ref('')
const isSearchingModal = ref(false)

watch(showAddFriendModal, (open) => {
  if (open) {
    modalSearchQuery.value = ''
    friendsStore.searchUsers('')
  }
})

async function handleExecuteModalSearch() {
  if (!modalSearchQuery.value.trim()) return
  isSearchingModal.value = true
  try {
    await friendsStore.searchUsers(modalSearchQuery.value.trim())
  } catch (err) {
    console.warn('Search failed:', err)
  } finally {
    isSearchingModal.value = false
  }
}

const modalSearchResults = computed(() => {
  if (!modalSearchQuery.value.trim()) return []
  const q = modalSearchQuery.value.trim().toLowerCase().replace(/^@/, '')
  const friendIds = new Set((friendsStore.friends || []).map(f => f.id))
  
  let sourceList = friendsStore.searchResults.length > 0 ? friendsStore.searchResults : authStore.users
  return sourceList.filter(u =>
    u.id !== authStore.currentUserId &&
    u.role !== 'admin' &&
    !friendIds.has(u.id) &&
    (
      u.username?.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  )
})

const myFriendsList = computed(() => {
  let list = friendsStore.friends || []
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase().replace(/^@/, '')
    list = list.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  }
  return list
})

const incomingRequestsList = computed(() => {
  let list = (friendsStore.incomingRequests || []).map(r => ({
    ...r.user,
    friendshipId: r.friendshipId,
    requestCreatedAt: r.createdAt
  })).filter(u => Boolean(u.id))

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase().replace(/^@/, '')
    list = list.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      (u.email && u.email?.toLowerCase().includes(q))
    )
  }
  return list
})

function isPendingSent(userId) {
  const isInOutgoing = (friendsStore.outgoingRequests || []).some(r => (r.user?.id || r.user_id) === userId)
  const isSearchPending = (friendsStore.searchResults || []).some(u => u.id === userId && u.friendshipStatus === 'PENDING_SENT')
  const isAuthPending = (authStore.currentUser?.friendRequestsSent || []).includes(userId)
  return isInOutgoing || isSearchPending || isAuthPending
}

async function handleSendFriendRequest(userId, userName) {
  actionLoadingId.value = userId
  try {
    await friendsStore.sendRequest(userId)
    toastStore.showToast(t('friends.request_sent_notif', { name: userName || 'User' }), 'success')
  } catch (err) {
    toastStore.showToast(err.message || t('friends.err_send_request'), 'error')
  } finally {
    actionLoadingId.value = null
  }
}

async function handleAcceptFriendRequest(userId, userName) {
  actionLoadingId.value = userId
  try {
    await friendsStore.acceptRequest(userId)
    toastStore.showToast(t('friends.request_accepted_notif', { name: userName || 'User' }), 'success')
  } catch (err) {
    toastStore.showToast(err.message || t('friends.err_accept_request'), 'error')
  } finally {
    actionLoadingId.value = null
  }
}

async function handleDeclineFriendRequest(userId) {
  actionLoadingId.value = userId
  try {
    await friendsStore.declineRequest(userId)
    toastStore.showToast(t('common.deleted') || 'OK', 'info')
  } catch (err) {
    toastStore.showToast(err.message || t('friends.err_decline_request'), 'error')
  } finally {
    actionLoadingId.value = null
  }
}

async function handleRemoveFriend(userId, userName) {
  if (confirm(t('friends.confirm_remove', { name: userName || 'User' }))) {
    actionLoadingId.value = userId
    try {
      await friendsStore.removeFriend(userId)
      toastStore.showToast(t('friends.removed_success', { name: userName || 'User' }), 'info')
    } catch (err) {
      toastStore.showToast(err.message || t('friends.err_remove_friend'), 'error')
    } finally {
      actionLoadingId.value = null
    }
  }
}

function openQrModal(friend) {
  selectedFriendQr.value = friend
  showQrModal.value = true
}
const suggestedUsers = computed(() => {
  const friendIds = new Set((friendsStore.friends || []).map(f => f.id))
  const sentIds = new Set((authStore.currentUser?.friendRequestsSent || []))
  const allUsers = (authStore.users && authStore.users.length > 0) ? authStore.users : INITIAL_USERS
  return allUsers.filter(u =>
    u.id !== authStore.currentUserId &&
    u.role !== 'admin' &&
    !friendIds.has(u.id) &&
    !sentIds.has(u.id)
  )
})
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Non-blocking top progress bar -->
    <div v-if="friendsStore.isLoading" class="w-full h-1 bg-indigo-500/20 overflow-hidden rounded-full">
      <div class="h-full bg-indigo-500 animate-pulse w-2/3"></div>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {{ t('friends.title') }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {{ t('friends.sub') }}
            </p>
          </div>
        </div>
      </div>

      <button
        @click="showAddFriendModal = true"
        class="glow-button px-5 py-2.5 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform shrink-0"
      >
        <UserPlus class="w-4 h-4" />
        <span>{{ t('friends.btn_add_new') }}</span>
      </button>
    </div>

    <!-- Search & Segmented Filter Bar -->
    <div class="glass-card p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80 flex items-center">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('friends.search_placeholder')"
            class="w-full glass-input text-xs !pl-10 !pr-9"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 z-10"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Segmented 2-Tab Controls -->
        <div class="grid grid-cols-2 gap-1.5 bg-slate-100/90 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            @click="activeTab = 'my_friends'"
            :class="[
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2',
              activeTab === 'my_friends' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm font-extrabold border border-slate-200/60 dark:border-slate-700' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>{{ t('friends.tab_my_friends') }}</span>
            <span class="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black">
              {{ friendsStore.friends.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'requests'"
            :class="[
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative',
              activeTab === 'requests' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm font-extrabold border border-slate-200/60 dark:border-slate-700' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>{{ t('friends.tab_requests') }}</span>
            <span 
              v-if="friendsStore.incomingRequests.length" 
              class="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse shadow-sm shadow-rose-500/30"
            >
              {{ friendsStore.incomingRequests.length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 1: My Friends Grid (Rendered Instantly) -->
    <div v-if="activeTab === 'my_friends'" class="space-y-6">
      <div v-if="myFriendsList.length === 0" class="space-y-6">
        <div class="glass-card p-8 text-center text-slate-500 dark:text-slate-400 space-y-4 border border-dashed border-slate-300 dark:border-slate-800">
          <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-500">
            <Users class="w-7 h-7 stroke-[1.5]" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">{{ t('friends.empty_friends') }}</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">{{ t('friends.empty_friends_sub') }}</p>
          </div>
          <button 
            @click="showAddFriendModal = true" 
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <UserPlus class="w-4 h-4" />
            <span>{{ t('friends.btn_add_new') }}</span>
          </button>
        </div>

        <!-- Suggested Users list -->
        <div v-if="suggestedUsers.length > 0" class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
              <span>ผู้คนที่คุณอาจรู้จัก (Suggested People)</span>
            </h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="user in suggestedUsers"
              :key="user.id"
              class="glass-card p-3.5 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`" class="w-10 h-10 rounded-2xl object-cover shrink-0 border border-indigo-500/30" />
                <div class="min-w-0 space-y-0.5">
                  <p class="text-xs font-extrabold text-slate-900 dark:text-white truncate">{{ user.name }}</p>
                  <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold truncate">@{{ user.username }}</p>
                </div>
              </div>
              <button
                @click="handleSendFriendRequest(user.id, user.name)"
                :disabled="actionLoadingId === user.id"
                class="glow-button px-3 py-1.5 text-xs font-black shrink-0 flex items-center gap-1 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Loader2 v-if="actionLoadingId === user.id" class="w-3.5 h-3.5 animate-spin" />
                <UserPlus v-else class="w-3.5 h-3.5" />
                <span>+ เพิ่มเพื่อน</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="friend in myFriendsList"
          :key="friend.id"
          class="glass-card p-4 border border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between gap-3.5 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="relative shrink-0">
              <img :src="friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`" class="w-12 h-12 rounded-2xl border-2 border-indigo-500/30 object-cover bg-slate-100 dark:bg-slate-800 shadow-sm" />
              <div class="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5 shadow-sm"></div>
            </div>

            <div class="space-y-0.5 min-w-0">
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ friend.name }}
              </h3>
              <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono truncate">
                @{{ friend.username }}
              </p>
              
              <div v-if="friend.email" class="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <Mail class="w-3 h-3 shrink-0" />
                <span class="truncate">{{ friend.email }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="openQrModal(friend)"
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors"
              :title="t('profile.your_qr_title')"
            >
              <QrCode class="w-4 h-4" />
            </button>

            <button
              @click="handleRemoveFriend(friend.id, friend.name)"
              :disabled="actionLoadingId === friend.id"
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-rose-500/10 hover:text-rose-600 text-slate-400 transition-colors disabled:opacity-50"
              :title="t('friends.btn_remove')"
            >
              <Loader2 v-if="actionLoadingId === friend.id" class="w-4 h-4 animate-spin text-rose-500" />
              <UserX v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Incoming Friend Requests -->
    <div v-else-if="activeTab === 'requests'" class="space-y-4">
      <div v-if="incomingRequestsList.length === 0" class="glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 border border-dashed border-slate-300 dark:border-slate-800">
        <Clock class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
        <p class="text-sm font-semibold">{{ t('friends.empty_requests') }}</p>
        <p class="text-xs text-slate-400">{{ t('friends.empty_requests_sub') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="user in incomingRequestsList"
          :key="user.id"
          class="glass-card p-4 border border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 flex items-center justify-between gap-3.5"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <img :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`" class="w-12 h-12 rounded-2xl border-2 border-indigo-500/40 object-cover bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div class="space-y-0.5 min-w-0">
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white truncate">{{ user.name }}</h3>
              <p class="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold truncate">@{{ user.username }}</p>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Clock class="w-3 h-3" />
                <span>{{ t('friends.new_request_label') }}</span>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="handleAcceptFriendRequest(user.id, user.name)"
              :disabled="actionLoadingId === user.id"
              class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
            >
              <Loader2 v-if="actionLoadingId === user.id" class="w-4 h-4 animate-spin" />
              <CheckCircle2 v-else class="w-3.5 h-3.5" />
              <span>{{ t('friends.btn_accept') }}</span>
            </button>

            <button
              @click="handleDeclineFriendRequest(user.id)"
              :disabled="actionLoadingId === user.id"
              class="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-600 text-slate-500 rounded-xl transition-all disabled:opacity-50"
              :title="t('friends.btn_decline')"
            >
              <XCircle class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Add Friend Modal -->
    <Modal :show="showAddFriendModal" :title="t('friends.btn_add_new')" maxWidth="max-w-lg" @close="showAddFriendModal = false">
      <template #icon>
        <UserPlus class="w-5 h-5 text-indigo-500" />
      </template>

      <div class="space-y-4 text-slate-800 dark:text-slate-200">
        <!-- Search Input Box with Submit Button -->
        <form @submit.prevent="handleExecuteModalSearch" class="space-y-1.5">
          <div class="flex gap-2">
            <div class="relative flex-1 flex items-center">
              <Search class="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                v-model="modalSearchQuery"
                type="text"
                autofocus
                :placeholder="t('friends.search_placeholder')"
                class="w-full glass-input text-xs !pl-11 !pr-10 py-3 text-slate-900 dark:text-white font-medium border-slate-300 dark:border-slate-700 focus:border-indigo-500 shadow-sm"
              />
              <button
                v-if="modalSearchQuery"
                type="button"
                @click="modalSearchQuery = ''"
                class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 z-10"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              :disabled="isSearchingModal || !modalSearchQuery.trim()"
              class="glow-button px-5 py-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 shrink-0 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSearchingModal" class="w-4 h-4 animate-spin" />
              <Search v-else class="w-4 h-4" />
              <span>{{ t('friends.btn_search') }}</span>
            </button>
          </div>
        </form>

        <!-- Search Results Section -->
        <div v-if="modalSearchQuery.trim()" class="space-y-2 pt-1">
          <div v-if="modalSearchResults.length > 0" class="max-h-64 overflow-y-auto space-y-2 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <div
              v-for="user in modalSearchResults"
              :key="user.id"
              class="p-3 rounded-2xl flex items-center justify-between gap-3 bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 shadow-sm hover:border-indigo-500/40 transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`" class="w-10 h-10 rounded-2xl object-cover shrink-0 border border-indigo-500/30 shadow-sm" />
                <div class="min-w-0 space-y-0.5">
                  <p class="text-xs font-extrabold text-slate-900 dark:text-white truncate">{{ user.name }}</p>
                  <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold truncate">@{{ user.username }}</p>
                  <p v-if="user.email" class="text-[10px] text-slate-400 truncate">{{ user.email }}</p>
                </div>
              </div>

              <div v-if="isPendingSent(user.id)" class="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Clock class="w-3.5 h-3.5" />
                <span>{{ t('friends.status_pending_sent') }}</span>
              </div>

              <button
                v-else
                @click="handleSendFriendRequest(user.id, user.name)"
                :disabled="actionLoadingId === user.id"
                class="glow-button px-3.5 py-2 text-xs font-black shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Loader2 v-if="actionLoadingId === user.id" class="w-3.5 h-3.5 animate-spin" />
                <UserPlus v-else class="w-3.5 h-3.5" />
                <span>{{ t('friends.btn_add_friend') }}</span>
              </button>
            </div>
          </div>

          <!-- Empty search state -->
          <div v-else class="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/30 dark:bg-slate-900/30">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <SearchX class="w-6 h-6 stroke-[1.5]" />
            </div>
            <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">{{ t('friends.search_not_found_title') }}</p>
            <p class="text-[11px] text-slate-400 max-w-xs mx-auto">
              {{ t('friends.search_not_found_sub', { query: modalSearchQuery }) }}
            </p>
          </div>
        </div>

        <!-- Initial hint when input is empty -->
        <div v-else class="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 bg-slate-50/30 dark:bg-slate-900/30">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-500">
            <Search class="w-6 h-6 stroke-[1.5]" />
          </div>
          <div class="space-y-1">
            <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">{{ t('friends.search_hint_title') }}</p>
            <p class="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              {{ t('friends.search_hint_sub') }}
            </p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-2 flex items-center justify-end">
          <button
            type="button"
            @click="showAddFriendModal = false"
            class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Friend QR Code Preview Modal -->
    <Modal :show="showQrModal" :title="selectedFriendQr?.name || 'QR Bank'" maxWidth="max-w-xs" @close="showQrModal = false">
      <template #icon>
        <QrCode class="w-5 h-5 text-indigo-500" />
      </template>

      <div class="text-center space-y-3 p-2">
        <div class="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-md">
          <img :src="selectedFriendQr?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR'" class="w-48 h-48 object-contain" />
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {{ t('friends.qr_modal_sub', { name: selectedFriendQr?.name }) }}
        </p>
      </div>
    </Modal>
  </div>
</template>
