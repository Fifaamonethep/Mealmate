<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMealsStore } from '../stores/meals'
import { useGroupsStore } from '../stores/groups'
import MealCard from '../components/meals/MealCard.vue'
import CreateMealModal from '../components/meals/CreateMealModal.vue'
import { Plus, Search, Filter, Utensils, Calendar } from 'lucide-vue-next'

const { t } = useI18n()
const mealsStore = useMealsStore()
const groupsStore = useGroupsStore()

const showCreateMeal = ref(false)
const searchQuery = ref('')
const selectedGroupId = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredMeals = computed(() => {
  return mealsStore.meals.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesGroup = !selectedGroupId.value || m.groupId === selectedGroupId.value
    
    let matchesDate = true
    if (startDate.value) {
      matchesDate = matchesDate && new Date(m.createdAt) >= new Date(startDate.value)
    }
    if (endDate.value) {
      const end = new Date(endDate.value)
      end.setHours(23, 59, 59, 999)
      matchesDate = matchesDate && new Date(m.createdAt) <= end
    }

    return matchesSearch && matchesGroup && matchesDate
  })
})
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
          <Utensils class="w-6 h-6 text-brand-400" />
          <span>{{ t('meals.title') }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('meals.sub') }}</p>
      </div>

      <button @click="showCreateMeal = true" class="glow-button text-xs flex items-center gap-1.5 py-2.5">
        <Plus class="w-4 h-4" />
        <span>{{ t('meals.add_meal') }}</span>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="glass-card p-4 space-y-3 border border-slate-700/60">
      
      <!-- Top Row: Search & Group Select -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('meals.search_placeholder')"
            class="w-full glass-input text-xs pl-9"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div class="w-full sm:w-64">
          <select v-model="selectedGroupId" class="w-full glass-input text-xs bg-slate-900">
            <option value="">{{ t('meals.all_groups') }}</option>
            <option v-for="g in groupsStore.groups" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Bottom Row: Date Range Filters -->
      <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
        <span class="text-slate-400 flex items-center gap-1 font-semibold">
          <Calendar class="w-3.5 h-3.5 text-brand-400" /> {{ t('meals.filter_date') }}
        </span>
        <div class="flex items-center gap-2">
          <span class="text-slate-500">{{ t('common.from') }}</span>
          <input v-model="startDate" type="date" class="glass-input text-xs py-1 px-2" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-500">{{ t('common.to') }}</span>
          <input v-model="endDate" type="date" class="glass-input text-xs py-1 px-2" />
        </div>
        <button
          v-if="startDate || endDate"
          @click="startDate = ''; endDate = ''"
          class="text-xs text-rose-400 hover:underline"
        >
          {{ t('meals.clear_date_filter') }}
        </button>
      </div>
    </div>

    <!-- Meals Grid -->
    <div v-if="filteredMeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MealCard v-for="m in filteredMeals" :key="m.id" :meal="m" />
    </div>

    <div v-else class="glass-card p-12 text-center text-slate-400 space-y-3">
      <Utensils class="w-12 h-12 text-slate-600 mx-auto" />
      <p class="text-sm font-semibold">{{ t('meals.empty') }}</p>
      <button @click="showCreateMeal = true" class="glow-button text-xs py-2 px-4 inline-block">
        {{ t('meals.add_meal') }}
      </button>
    </div>

    <!-- Create Meal Modal -->
    <CreateMealModal :show="showCreateMeal" @close="showCreateMeal = false" />
  </div>
</template>
