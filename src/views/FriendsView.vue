<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
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
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const mealsStore = useMealsStore()
const debtsStore = useDebtsStore()
const toastStore = useToastStore()

const activeTab = ref('my_friends') // 'my_friends' | 'requests' | 'suggested'
const searchQuery = ref('')
const showAddFriendModal = ref(false)
const showQrModal = ref(false)
const selectedFriendQr = ref(null)

const newFriend = ref({
  name: '',
  username: '',
  phone: '',
  email: ''
})

const myFriendsList = computed(() => {
  let list = authStore.myFriends
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  }
  return list
})

const incomingRequestsList = computed(() => {
  let list = authStore.incomingFriendRequests
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    )
  }
  return list
})

const suggestedList = computed(() => {
  let list = authStore.suggestedFriends
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  }
  return list
})

function handleSendFriendRequest(userId, userName) {
  authStore.sendFriendRequest(userId)
  toastStore.showToast(t('friends.request_sent_notif', { name: userName }), 'success')
}

function handleAcceptFriendRequest(userId, userName) {
  authStore.acceptFriendRequest(userId)
  toastStore.showToast(t('friends.request_accepted_notif', { name: userName }), 'success')
}

function handleDeclineFriendRequest(userId) {
  authStore.declineFriendRequest(userId)
  toastStore.showToast(t('common.deleted') || 'Đã từ chối lời mời', 'info')
}

function handleRemoveFriend(userId, userName) {
  if (confirm(t('friends.confirm_remove', { name: userName }))) {
    authStore.removeFriend(userId)
    toastStore.showToast(t('friends.removed_success', { name: userName }), 'info')
  }
}

function handleQuickCreateFriend() {
  if (!newFriend.value.name.trim()) return

  const name = newFriend.value.name.trim()
  const username = newFriend.value.username.trim() || name.toLowerCase().replace(/\s+/g, '_')
  const phone = newFriend.value.phone.trim()

  const createdUser = {
    id: `u-${Date.now()}`,
    username,
    name,
    phone,
    email: newFriend.value.email.trim(),
    role: 'user',
    currency: 'LAK',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-${encodeURIComponent(name.toUpperCase())}`,
    friends: [authStore.currentUserId],
    friendRequestsSent: [],
    friendRequestsReceived: []
  }

  authStore.users.push(createdUser)
  authStore.addFriend(createdUser.id)
  authStore.saveUsers()

  toastStore.showToast(t('friends.added_success', { name }), 'success')

  newFriend.value = { name: '', username: '', phone: '', email: '' }
  showAddFriendModal.value = false
}

function openQrModal(friend) {
  selectedFriendQr.value = friend
  showQrModal.value = true
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>{{ t('friends.title') }}</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ t('friends.sub') }}
        </p>
      </div>

      <button
        @click="showAddFriendModal = true"
        class="glow-button px-4 py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
      >
        <UserPlus class="w-4 h-4" />
        <span>{{ t('friends.btn_add_new') }}</span>
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="glass-card p-4 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative w-full lg:w-72">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('friends.search_placeholder')"
            class="w-full glass-input text-xs pl-9"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <!-- Segmented 3-Tab Controls -->
        <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold w-full lg:w-auto">
          <button
            type="button"
            @click="activeTab = 'my_friends'"
            :class="[
              'px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'my_friends' ? 'brand-pill-active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>{{ t('friends.tab_my_friends') }} ({{ authStore.myFriends.length }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'requests'"
            :class="[
              'px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 relative',
              activeTab === 'requests' ? 'brand-pill-active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>{{ t('friends.tab_requests') }}</span>
            <span v-if="authStore.incomingFriendRequests.length" class="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse">
              {{ authStore.incomingFriendRequests.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'suggested'"
            :class="[
              'px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'suggested' ? 'brand-pill-active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>{{ t('friends.tab_suggested') }} ({{ authStore.suggestedFriends.length }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 1: My Friends Grid -->
    <div v-if="activeTab === 'my_friends'" class="space-y-4">
      <div v-if="myFriendsList.length === 0" class="glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <Users class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
        <p class="text-sm font-semibold">{{ t('friends.empty_friends') }}</p>
        <button @click="activeTab = 'suggested'" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          {{ t('friends.view_suggested') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="friend in myFriendsList"
          :key="friend.id"
          class="glass-card p-5 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          <div class="flex items-center gap-3.5">
            <div class="relative shrink-0">
              <img :src="friend.avatar" class="w-12 h-12 rounded-full border-2 border-indigo-500/40 object-cover bg-slate-200 dark:bg-slate-800" />
            </div>

            <div class="space-y-1">
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ friend.name }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">@{{ friend.username }}</p>
              
              <div v-if="friend.phone" class="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Phone class="w-3 h-3" />
                <span>{{ friend.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <button
              @click="openQrModal(friend)"
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-all"
              :title="t('profile.your_qr_title')"
            >
              <QrCode class="w-4 h-4" />
            </button>

            <button
              @click="handleRemoveFriend(friend.id, friend.name)"
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-600 text-slate-400 transition-all"
              :title="t('friends.btn_remove')"
            >
              <UserX class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Incoming Friend Requests -->
    <div v-else-if="activeTab === 'requests'" class="space-y-4">
      <div v-if="incomingRequestsList.length === 0" class="glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <Clock class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
        <p class="text-sm font-semibold">{{ t('friends.empty_requests') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="user in incomingRequestsList"
          :key="user.id"
          class="glass-card p-5 border border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3.5">
            <img :src="user.avatar" class="w-12 h-12 rounded-full border-2 border-indigo-500/40 object-cover bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div class="space-y-0.5">
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">{{ user.name }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">@{{ user.username }}</p>
              <span class="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {{ t('friends.notif_new_request_title') }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="handleAcceptFriendRequest(user.id, user.name)"
              class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ t('friends.btn_accept') }}</span>
            </button>

            <button
              @click="handleDeclineFriendRequest(user.id)"
              class="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-600 text-slate-500 rounded-xl transition-all"
            >
              <XCircle class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Suggested Friends Grid -->
    <div v-else-if="activeTab === 'suggested'" class="space-y-4">
      <div v-if="suggestedList.length === 0" class="glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <UserCheck class="w-12 h-12 mx-auto text-emerald-500 stroke-[1.5]" />
        <p class="text-sm font-semibold">{{ t('friends.all_added') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="user in suggestedList"
          :key="user.id"
          class="glass-card p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3.5">
            <img :src="user.avatar" class="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 object-cover bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div class="space-y-0.5">
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">{{ user.name }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">@{{ user.username }}</p>
            </div>
          </div>

          <!-- If already sent friend request -->
          <div v-if="authStore.outgoingFriendRequests.some(u => u.id === user.id)">
            <span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ t('friends.status_pending_sent') }}</span>
            </span>
          </div>

          <!-- Else Send Request Button -->
          <button
            v-else
            @click="handleSendFriendRequest(user.id, user.name)"
            class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all shrink-0 whitespace-nowrap"
          >
            <UserPlus class="w-4 h-4 shrink-0 text-white" />
            <span class="whitespace-nowrap">{{ t('friends.btn_send_request') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Create Friend Modal -->
    <Modal :show="showAddFriendModal" :title="t('friends.btn_add_new')" maxWidth="max-w-md" @close="showAddFriendModal = false">
      <template #icon>
        <UserPlus class="w-5 h-5 text-indigo-500" />
      </template>

      <form @submit.prevent="handleQuickCreateFriend" class="space-y-4 text-slate-800 dark:text-slate-200">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('auth.name') }} *</label>
          <input v-model="newFriend.name" type="text" required placeholder="Alice Vongxay" class="w-full glass-input text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('auth.phone') }}</label>
          <input v-model="newFriend.phone" type="text" placeholder="2055667788" class="w-full glass-input text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t('auth.username') }}</label>
          <input v-model="newFriend.username" type="text" placeholder="alice_v" class="w-full glass-input text-xs" />
        </div>
      </form>

      <template #footer>
        <button @click="showAddFriendModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500">
          {{ t('common.cancel') }}
        </button>
        <button @click="handleQuickCreateFriend" class="glow-button text-xs flex items-center gap-2 py-2">
          <UserPlus class="w-4 h-4" />
          <span>{{ t('groups.btn_add') }}</span>
        </button>
      </template>
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
