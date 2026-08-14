<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useDebtCalculator } from '../composables/useDebtCalculator'
import { formatCurrency } from '../utils/currency'
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Receipt,
  Percent,
  Calculator,
  UserCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  Check,
  Users
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const authStore = useAuthStore()

// 1. PARTICIPANTS IN THE MEAL
const people = ref([
  {
    id: authStore.currentUserId || 'u-1',
    name: authStore.currentUser?.name || 'Soke Dev',
    avatar: authStore.currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=soke'
  },
  {
    id: 'u-alice',
    name: 'Alice Vongxay',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'u-bob',
    name: 'Bob Soukthavy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  }
])

// 2. WHO PAID THE TOTAL BILL
const payerId = ref(people.value[0].id)
const currency = ref('LAK')

// 3. TAX & SERVICE CHARGE SETTINGS
const taxPercent = ref(10) // 10% VAT
const serviceChargePercent = ref(5) // 5% Service Fee
const discountPercent = ref(0) // 0% Discount

// 4. ORDERED ITEMS LIST (Itemized Dishes)
const items = ref([
  {
    id: 'item-1',
    name: 'ຕຳໝາກຫຸ່ງ + ໄກ່ປິ້ງ (Papaya Salad & Grilled Chicken)',
    price: 120000,
    sharedBy: ['u-1', 'u-alice', 'u-bob'] // Shared by everyone
  },
  {
    id: 'item-2',
    name: 'ຕົ້ມຍຳກຸ້ງ (Tom Yum Soup)',
    price: 85000,
    sharedBy: ['u-1', 'u-alice'] // Only Soke & Alice ate this
  },
  {
    id: 'item-3',
    name: 'ເບຍລາວ 3 ແກ້ວ (Beerlao 3 Bottles)',
    price: 60000,
    sharedBy: ['u-1', 'u-bob'] // Only Soke & Bob drank this
  },
  {
    id: 'item-4',
    name: 'ນ້ຳໝາກພ້າວປັ່ນ (Coconut Smoothie)',
    price: 35000,
    sharedBy: ['u-alice'] // Solo drink for Alice
  }
])

// 5. ATTACH THE COMPOSABLE
const { debts, userSummaries, summary } = useDebtCalculator({
  people,
  items,
  payerId,
  taxPercent,
  serviceChargePercent,
  discountPercent,
  decimals: computed(() => (currency.value === 'USD' ? 2 : 0))
})

// UI Helper: Add new item
function addNewItem() {
  items.value.push({
    id: `item-${Date.now()}`,
    name: '',
    price: 0,
    sharedBy: people.value.map(p => p.id) // Default shared by all
  })
}

// UI Helper: Remove item
function removeItem(index) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

// UI Helper: Toggle participant on an item
function toggleItemParticipant(item, personId) {
  const idx = item.sharedBy.indexOf(personId)
  if (idx > -1) {
    if (item.sharedBy.length > 1) {
      item.sharedBy.splice(idx, 1)
    }
  } else {
    item.sharedBy.push(personId)
  }
}

// UI Helper: Select all participants for an item
function selectAllForItem(item) {
  item.sharedBy = people.value.map(p => p.id)
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-20">
    
    <!-- Header -->
    <div class="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-2">
      <div class="flex items-center gap-2">
        <span class="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Calculator class="w-5 h-5" />
        </span>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Itemized Custom Split
        </h1>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
        Split dishes by exact consumption. Tax (VAT) and Service Charge are automatically distributed proportionally based on each person's subtotal!
      </p>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT COLUMN: Items & Dish Configuration (7 Cols) -->
      <div class="lg:col-span-7 space-y-5">
        
        <!-- Payer & Currency Configuration Card -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard class="w-4 h-4 text-indigo-500" />
              <span>1. Who paid the bill?</span>
            </h2>
            
            <select
              v-model="currency"
              class="text-xs font-bold py-1.5 px-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="LAK">₭ LAK (ກີບ)</option>
              <option value="THB">฿ THB (ບາດ)</option>
              <option value="USD">$ USD (Dollar)</option>
            </select>
          </div>

          <!-- Payer Selection Radios -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              v-for="p in people"
              :key="p.id"
              type="button"
              @click="payerId = p.id"
              :class="[
                'p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left',
                payerId === p.id
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30 font-black'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              ]"
            >
              <img :src="p.avatar" class="w-6 h-6 rounded-full object-cover shrink-0" />
              <span class="truncate">{{ p.name }}</span>
            </button>
          </div>
        </div>

        <!-- Ordered Dishes List Card -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UtensilsCrossed class="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>2. Dishes & Who Ate Them ({{ items.length }})</span>
            </h2>
            <button
              type="button"
              @click="addNewItem"
              class="glow-button py-1.5 px-3 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add Dish</span>
            </button>
          </div>

          <!-- Items Stack -->
          <div class="space-y-3">
            <div
              v-for="(item, idx) in items"
              :key="item.id || idx"
              class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-all"
            >
              <!-- Top Row: Dish Name & Price -->
              <div class="flex items-center gap-2">
                <input
                  v-model="item.name"
                  type="text"
                  placeholder="Dish name (e.g. Pizza, Salad...)"
                  class="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                
                <div class="relative w-32 sm:w-40 shrink-0">
                  <input
                    v-model.number="item.price"
                    type="number"
                    min="0"
                    placeholder="Price"
                    class="w-full px-3 py-2 text-xs font-black text-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>

                <button
                  type="button"
                  @click="removeItem(idx)"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
                  title="Remove Dish"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <!-- Bottom Row: Multi-participant Tag Toggles -->
              <div class="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-bold text-slate-400 uppercase mr-1">Shared by:</span>
                  <button
                    v-for="person in people"
                    :key="person.id"
                    type="button"
                    @click="toggleItemParticipant(item, person.id)"
                    :class="[
                      'px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border',
                      item.sharedBy.includes(person.id)
                        ? 'bg-brand-500/15 border-brand-500/40 text-brand-700 dark:text-brand-300 font-extrabold shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                    ]"
                  >
                    <img :src="person.avatar" class="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{{ person.name.split(' ')[0] }}</span>
                    <Check v-if="item.sharedBy.includes(person.id)" class="w-3 h-3 text-brand-600" />
                  </button>
                </div>

                <!-- Per Person Share Preview -->
                <span class="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                  {{ formatCurrency(item.price > 0 && item.sharedBy.length ? item.price / item.sharedBy.length : 0, currency, locale) }}/person
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Fees (Tax, Service Charge, Discount) -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h2 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Percent class="w-4 h-4 text-amber-500" />
            <span>3. Tax & Surcharges (Distributed Proportionally)</span>
          </h2>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">VAT / Tax (%)</label>
              <input
                v-model.number="taxPercent"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Service Fee (%)</label>
              <input
                v-model.number="serviceChargePercent"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Discount (%)</label>
              <input
                v-model.number="discountPercent"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Real-Time Results & Debt Owed (5 Cols) -->
      <div class="lg:col-span-5 space-y-5">
        
        <!-- Bill Overview Summary Card -->
        <div class="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-indigo-500/30 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-indigo-300 tracking-wider">Total Bill Calculation</span>
            <Sparkles class="w-4 h-4 text-amber-400" />
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-300">
              <span>Food & Drink Subtotal</span>
              <span class="font-bold text-white">{{ formatCurrency(summary.itemsSubtotal, currency, locale) }}</span>
            </div>

            <div v-if="summary.discountAmount > 0" class="flex justify-between text-emerald-400">
              <span>Discount ({{ discountPercent }}%)</span>
              <span class="font-bold">-{{ formatCurrency(summary.discountAmount, currency, locale) }}</span>
            </div>

            <div v-if="summary.taxAmount > 0" class="flex justify-between text-indigo-300">
              <span>Tax ({{ taxPercent }}%)</span>
              <span class="font-bold">+{{ formatCurrency(summary.taxAmount, currency, locale) }}</span>
            </div>

            <div v-if="summary.serviceChargeAmount > 0" class="flex justify-between text-indigo-300">
              <span>Service Charge ({{ serviceChargePercent }}%)</span>
              <span class="font-bold">+{{ formatCurrency(summary.serviceChargeAmount, currency, locale) }}</span>
            </div>

            <div class="pt-3 border-t border-white/10 flex items-center justify-between text-sm sm:text-base font-black">
              <span>Grand Total</span>
              <span class="text-xl sm:text-2xl text-amber-400">{{ formatCurrency(summary.grandTotal, currency, locale) }}</span>
            </div>
          </div>
        </div>

        <!-- Calculated Debt Output Card -->
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users class="w-4 h-4 text-emerald-500" />
              <span>Who Owes the Payer?</span>
            </h2>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {{ debts.length }} Debts
            </span>
          </div>

          <!-- Debt Items List -->
          <div v-if="debts.length > 0" class="space-y-3">
            <div
              v-for="d in debts"
              :key="d.id"
              class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <img :src="d.debtorAvatar" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h3 class="text-xs font-black text-slate-900 dark:text-white">{{ d.debtorName }}</h3>
                    <p class="text-[10px] font-semibold text-slate-500">
                      Owes {{ d.creditorName }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-sm font-black text-rose-600 dark:text-rose-400">
                    {{ formatCurrency(d.amount, currency, locale) }}
                  </span>
                  <span class="block text-[10px] font-bold text-slate-400">
                    Incl. {{ taxPercent }}% Tax & {{ serviceChargePercent }}% Svc
                  </span>
                </div>
              </div>

              <!-- Consumed Dishes Breakdown -->
              <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 space-y-1">
                <div v-for="(dish, dIdx) in d.consumedItems" :key="dIdx" class="flex justify-between">
                  <span class="truncate pr-2">• {{ dish.itemName }} (1/{{ dish.splitCount }})</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(dish.sharePrice, currency, locale) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-6 text-center text-xs text-slate-500 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
            No external debts generated.
          </div>

          <!-- Payer's Own Personal Share Box -->
          <div class="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs font-bold">
            <span class="text-indigo-800 dark:text-indigo-300">Payer's Own Share:</span>
            <span class="font-black text-indigo-700 dark:text-indigo-400">{{ formatCurrency(summary.payerPersonalShare, currency, locale) }}</span>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>
