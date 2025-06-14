<template>
  <div class="popup-content" :class="{ 'popup-content_fix-height': fixHeight }">
    <slot />
  </div>
</template>

<<script setup lang="ts">
defineProps<{
  fixHeight?: boolean
}>()
</script>

<style lang="scss">

.popup-content {
  width: 604px;
  border-radius: 8px;
  overflow: auto;
  transition: height .3s;
  height: 600px;

  &_fix-height {
    height: 372px;
  }
}
</style>