<template>
  <div class="services__loading" v-if="servicesStore.isLoading">Загрузка</div>
  <div class="services" v-else>
    <header class="services__header">
      <Search v-model="searchComputed" />
      <Button @click="servicesStore.update">Обновить</Button>
    </header>
    <ul class="services__list">

      <li class="services__item services__item_personal">
        <Button v-if="!servicesStore.state.personal">Заполнить сслыку на личную таблицу доступов</Button>
        <a v-else :href="'https://'+servicesStore.state.personal">Личная таблица доступов</a>
      </li>

      <li v-if="servicesStore.state.favourites.url" class="services__item">
        <ServicesItem :services="servicesStore.state.favourites" @setFavorites="servicesStore.chandeFavorites()" />
      </li>

      <li v-for="services in getListSetFilters()" :class="services.url ? 'services__item' : 'services__group'">
        <ServicesItem v-if="services.url" :services
          @setFavorites="servicesStore.chandeFavorites(servicesStore.state.favourites.url === services.url ? null : services)" />
        <div v-else>{{ services.name }}</div>
      </li>

    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import switcher from '@/utils/switcher'
import { useServicesStore } from '@/stores';
import Button from '@/components/ui/Button.vue';
import ServicesItem from '@/components/ServicesItem.vue'
import Search from '@/components/ui/Search.vue'


const servicesStore = useServicesStore()
const search = ref('')
const searchRU = ref('')
const searchEN = ref('')

onMounted(async () => {
  await servicesStore.loadFromStorage()
  servicesStore.state.list.length === 0 && servicesStore.update()
})

const searchComputed = computed({
  get: () =>  search.value,
  set: (newValue: string) => {
    newValue = newValue.toLowerCase()
    searchRU.value = switcher(newValue)
    searchEN.value = searchRU.value === newValue ? switcher(newValue, { type: 'rueng'}) : ''
    search.value = newValue
  }
});

const fitrelServices = (item : ServicesItem | ServicesGroup) => { 
  const name = item.name.toLowerCase()
  const url = 'url' in item ? item.url.toLowerCase() : ''
  if (searchEN.value) return  name.includes(search.value) || url.includes(search.value) || name.includes(searchEN.value) || url.includes(searchEN.value)
  return name.includes(search.value) || url.includes(search.value) || name.includes(searchRU.value)
}

const getListSetFilters = () => search.value ? servicesStore.state.list.filter(fitrelServices) : servicesStore.state.list

</script>

<style lang="scss">
.services__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.services {
  display: grid;
  gap: 10px;
}

.services__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg-body);
  padding: 5px;
}

.services__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  list-style: none;
  padding: 10px;
}

.services__group {
  grid-column: 1/3;
  background-color: rebeccapurple;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-secondaty-hover);
}

.services__item {
  position: relative;
  background-color: var(--color-secondary);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-secondaty-hover);
  box-shadow: 0 0 10px rgba(0 0 0 / .3);
  transition-property: box-shadow;
  transition-duration: .2s;
  overflow: hidden;
  // height: 76px;

  &:hover {
    box-shadow: 0 0 10px rgba(255 255 255 / .3);
  }
}
</style>