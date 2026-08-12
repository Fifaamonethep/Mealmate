<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMealsStore } from '../../stores/meals'
import { useAuthStore } from '../../stores/auth'
import { formatCurrency } from '../../utils/currency'
import { PieChart, TrendingUp, Award, Layers, Sparkles, Coffee, Utensils, Plane, Home, Dumbbell } from 'lucide-vue-next'

const { t, locale } = useI18n()
const mealsStore = useMealsStore()
const authStore = useAuthStore()

// Compute categories breakdown
const categoryStats = computed(() => {
  const categories = [
    { key: 'food', label: t('analytics.cat_food'), icon: Utensils, color: 'bg-rose-500', total: 0 },
    { key: 'drink', label: t('analytics.cat_drink'), icon: Coffee, color: 'bg-amber-500', total: 0 },
    { key: 'travel', label: t('analytics.cat_travel'), icon: Plane, color: 'bg-indigo-500', total: 0 },
    { key: 'home', label: t('analytics.cat_home'), icon: Home, color: 'bg-emerald-500', total: 0 },
    { key: 'sports', label: t('analytics.cat_sports'), icon: Dumbbell, color: 'bg-purple-500', total: 0 }
  ]

  const totalAll = mealsStore.meals.reduce((sum, m) => sum + (Number(m.totalAmount) || 0), 0)

  mealsStore.meals.forEach(m => {
    const title = (m.title || '').toLowerCase()
    const amount = Number(m.totalAmount) || 0

    if (title.includes('ກາເຟ') || title.includes('coffee') || title.includes('ຊາ')) {
      categories[1].total += amount
    } else if (title.includes('ທ່ຽວ') || title.includes('วังเวียง') || title.includes('travel')) {
      categories[2].total += amount
    } else if (title.includes('ຫ້ອງ') || title.includes('room') || title.includes('บ้าน')) {
      categories[3].total += amount
    } else if (title.includes('ບານ') || title.includes('sport') || title.includes('บอล')) {
      categories[4].total += amount
    } else {
      categories[0].total += amount
    }
  })

  return categories.map(c => ({
    ...c,
    percentage: totalAll > 0 ? Math.round((c.total / totalAll) * 100) : 0
  }))
})

// Compute Payer Leaderboard
const payerLeaderboard = computed(() => {
  const payerMap = {}

  mealsStore.meals.forEach(m => {
    const payerId = m.paidById
    if (!payerMap[payerId]) payerMap[payerId] = 0
    payerMap[payerId] += (Number(m.totalAmount) || 0)
  })

  return Object.keys(payerMap)
    .map(userId => {
      const user = authStore.users.find(u => u.id === userId) || { name: 'User', avatar: '' }
      return {
        user,
        amount: payerMap[userId]
      }
    })
    .sort((a, b) => b.amount - a.amount)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- Category Breakdown Card -->
    <div class="glass-card p-6 border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-3xl space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <PieChart class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">{{ t('analytics.category_title') }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('analytics.category_sub') }}</p>
          </div>
        </div>
      </div>

      <!-- Categories Progress Bars -->
      <div class="space-y-4">
        <div v-for="c in categoryStats" :key="c.key" class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <component :is="c.icon" class="w-4 h-4 text-slate-500" />
              <span>{{ c.label }}</span>
            </span>
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 dark:text-white">{{ formatCurrency(c.total, 'LAK', locale) }}</span>
              <span class="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ c.percentage }}%</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <div
              :class="['h-full rounded-full transition-all duration-500', c.color]"
              :style="{ width: `${c.percentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payer Leaderboard Card -->
    <div class="glass-card p-6 border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-3xl space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">{{ t('analytics.top_creditor_title') }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('analytics.top_creditor_sub') }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(p, index) in payerLeaderboard"
          :key="p.user.id"
          class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs"
        >
          <div class="flex items-center gap-3">
            <span
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                index === 0 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              #{{ index + 1 }}
            </span>
            <img :src="p.user.avatar" class="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
            <div>
              <div class="font-extrabold text-slate-900 dark:text-white">{{ p.user.name }}</div>
              <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">@{{ p.user.username }}</div>
            </div>
          </div>

          <div class="text-right">
            <div class="font-black text-amber-600 dark:text-amber-400 text-xs">{{ formatCurrency(p.amount, 'LAK', locale) }}</div>
            <div class="text-[10px] font-bold text-slate-500">{{ t('analytics.advanced_paid') }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
