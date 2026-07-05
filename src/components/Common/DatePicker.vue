<template>
  <div class="date-picker card">
    <div class="picker-wrapper">
      <label class="picker-label">时间筛选</label>
      <input
        type="date"
        :value="formatDate(selectedDate)"
        :min="minDate"
        :max="maxDate"
        @change="handleDateChange"
        class="date-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const selectedDate = computed(() => dataStore.selectedDate)

// 限制日期范围：只能选择3天内（今天、昨天、前天）
const maxDate = computed(() => {
  const today = new Date()
  return formatDate(today)
})

const minDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() - 2) // 前2天（共3天：今天、昨天、前天）
  return formatDate(today)
})

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function handleDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  const date = new Date(target.value)
  dataStore.setSelectedDate(date)
  console.log('📅 切换日期:', formatDate(date))
}
</script>

<style lang="scss" scoped>
.date-picker {
  padding: 0.12rem 0.15rem;
  min-height: auto;
}

.picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.12rem;
}

.picker-label {
  font-size: 0.14rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.date-input {
  flex: 1;
  padding: 0.08rem 0.12rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(58, 134, 255, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 0.13rem;
  outline: none;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: rgba(58, 134, 255, 0.6);
    background: rgba(255, 255, 255, 0.12);
  }

  &:focus {
    border-color: #3a86ff;
    background: rgba(255, 255, 255, 0.15);
  }

  // 修改日期选择器颜色
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
