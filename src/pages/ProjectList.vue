<template>
  <transition name="fade">
    <SelectProject v-if="selectProjectState.state?.url" :project="selectProjectState.state" @backward="selectProjectState.removeProject" />
  </transition>

  <div v-if="projectsStore.state.projects.length > 0">
    <header class="projects-header">
      <Checkbox label="Есть доступ" v-model="isAccess" />
      <Search v-model="searchComputed" />
    </header>
    <ul class="project-list" >
      <ProjectItem v-for="project in ( isAccess || search ? projectsStore.state.projects.filter(filterProjects) : projectsStore.state.projects)" :key="project.url" :project="project" @setSite="selectProjectState.setProject(project)" />
    </ul>  </div>
  <EmptyProjects v-else />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import switcher from '@/utils/switcher'
import { useProjectsStore, useSelectProjectStore } from '@/stores'
import ProjectItem from '@/components/ProjectItem.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Search from '@/components/ui/Search.vue'
import EmptyProjects from '@/components/EmptyProjects.vue'
import SelectProject from '@/pages/SelectProject.vue';

const projectsStore = useProjectsStore()
const isAccess = ref(false)
const search = ref('')
const searchRU = ref('')
const searchEN = ref('')

const selectProjectState = useSelectProjectStore()

const searchComputed = computed({
  get: () =>  search.value,
  set: (newValue: string) => {
    newValue = newValue.toLowerCase()
    searchRU.value = switcher(newValue)
    searchEN.value = searchRU.value === newValue ? switcher(newValue, { type: 'rueng'}) : ''
    search.value = newValue
  }
});


const searchFilter = (project: Project) => { 
  if (!search.value) return true
  const name = project.name.toLowerCase()
  const url = project.url.toLowerCase()
  if (searchEN.value) return  name.includes(search.value) || url.includes(search.value) || name.includes(searchEN.value) || url.includes(searchEN.value)
  return name.includes(search.value) || url.includes(search.value) || name.includes(searchRU.value)
}
const filterProjects = (project: Project) => { 
  if (isAccess.value) {
    if (search.value) return searchFilter(project) && project.login !== ''
    return project.login !== '' 
  }
  if (search.value) return searchFilter(project)
  return true
}

</script>

<style lang="scss">
.projects-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg-body);
  padding: 5px;
}
.project-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  padding: 10px;
}
</style>