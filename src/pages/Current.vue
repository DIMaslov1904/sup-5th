<template>
  <p v-if="!project">Сайт на данной вкладке не является проектом 5 измерения</p>
  <CurrentContent v-else :project />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getCurrentTab } from '@/utils/chrome-api';
import CurrentContent from '@/components/CurrentContent.vue';
import { useProjectsStore } from '@/stores';

const projectsStore = useProjectsStore()

const project = ref<Project | null>(null)

onMounted(async () => {
  const curTab = await getCurrentTab()
  if (curTab) { 
    project.value = projectsStore.state.projects.find((el: Project) => el.url ? curTab.url?.includes(el.url) : false)
  }
})
</script>