<template>
  <li class="project-item" tabindex="0" role="button" @click="$emit('setSite')">
    <img v-if="project.isImg" class="project-item__bg" :src="getProjectImg(project.url)" width="579" height="120" loading="lazy">

    <header class="project-item__header">
      <h2 class="project-item__title">{{ project.name }}</h2>
      
      <Button size="l" :href="'https://' + project.url" target="_blank">
        {{ project.url }}
      </Button>

      <Button size="l" :href="getUrlAdminLogin(project.url, project.urlAdmin, project.cms)" target="_blank" title="Админ. раздел">
        <GlobalEditIcon/>
      </Button>
    </header>
    <footer class="project-item__footer">
      <Button size="l" v-if="project.manual" :href="'https://' + project.manual" class="project-item__action project-item__action_manual" target="_blank" title="Инструкция">
        Инструкция
        <BookIcon/>
      </Button>
      <CopyAccess v-if="project.login" :project class="project-item__action project-item__action_access"/>
    </footer>
  </li>
</template>
<script setup lang="ts">
import { getUrlAdminLogin } from '@/utils/cms-api';
import {getProjectImg} from '@/utils/getFiles';
import Button from '@/components/ui/Button.vue';
import GlobalEditIcon from '@/components/icons/GlobalEditIcon.vue';
import BookIcon from '@/components/icons/BookIcon.vue';
import CopyAccess from '@/components/CopyAccess.vue'; 

defineProps<{
  project: Project
}>()

defineEmits < {
  setSite: []
}>()

</script>

<style lang="scss">
.project-item {
  position: relative;
  background-color: var(--color-secondary);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-secondaty-hover);
  box-shadow: 0 0 10px rgba(0 0 0 / .3);
  transition-property: height, box-shadow;
  transition-duration: .2s;
  overflow: hidden;
  height: 76px;
  cursor: pointer;
 

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient( light-dark(#fff, #2e2f38),  light-dark(#ffffff00, #2e2f3800));
    z-index: 1;
  }

  &:hover {
    box-shadow: 0 0 10px rgba(255 255 255 / .3);
    height: 121px;
  }
  &:not(:hover) {
    .project-item__action {
      opacity: 0;
    }
  }
}

.project-item__bg {
  position: absolute;
  inset: 0;
  object-fit: cover;
}

.project-item__header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  margin-bottom: 10px;
}

.project-item__footer {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.project-item__title {
  font-size: 18px;
  line-height: 18px;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.project-item__action {
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: space-between;
  border: 1px solid rgba(255 255 255 / .1);
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &_access {
    grid-column: 2;
  }
}

</style>