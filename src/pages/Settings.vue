<template>
  Настройки
  <Input v-model="apiUrl"/>
  <Input v-model="apiAccessUrl"/>

  
  <Button @click="removeFromStorage">
    Сбросить настройки и данные
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMainStore } from '@/stores'
import { removeFromStorage  } from '@/utils/chrome-api'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const mainStore = useMainStore()

const apiUrl = computed({
  get: () =>  mainStore.state.apiUrl,
  set: (val) => mainStore.setApiUrl(val)
})
const apiAccessUrl = computed({
  get: () =>  mainStore.state.apiAccessUrl,
  set: (val) => mainStore.setApiAccessUrl(val)
})
</script>

<style lang="scss">
</style>