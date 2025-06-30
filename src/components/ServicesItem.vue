<template>
  <div class="services-item">
    <Button class="services-item__favorite" @click.stop="$emit('setFavorites')">Добавить в избранное</Button>
    <p>{{ services.description }}</p>
    <a class="services-item__link" :href="'https://'+services.url" target="_blank">{{ services.name }}</a>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue';

defineProps<{
  services: ServicesItem
}>()
defineEmits < {
  setFavorites: []
}>()
</script>

<style lang="scss">
.services-item {

}

.services-item__favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;

}

.services-item__link {
  color: currentColor;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }
}
</style>