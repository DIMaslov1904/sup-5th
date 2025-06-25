<template>
  <div class="current-content">
    <div v-if="project.isImg" class="current-content__bg">
      <img :src="getProjectImg(project.url)" width="660" height="120">
    </div>
    <header class="current-content__header">
      <a :href="getUrlAdminLogin(project.url, project.urlAdmin, project.cms)" target="_blank" class="current-content__cms" :title="project.cms">
        <img v-if="project.cms" :src="getIcon(project.cms === 'Своя' ? 'cms' : project.cms)"/>
        <img v-else :src="getIcon('hosting')"/>
      </a>
      <a class="current-content__name" :href="project.url.includes('http:') ?  project.url.replace('http:', 'http://') : 'https://'  + project.url" target="_blank">
        <h1 >{{ project.name }} ({{ project.url.includes('http:') ?  project.url.replace('http:', '') : project.url }})</h1>
      </a>
    </header>

    <Button v-if="project.git" size="l" :href="`https://${project.git}`"  target="_blank"><img :src="getIcon('gitlab')"/></Button>
    <Button v-if="project.figma" size="l" :href="`https://${project.figma}`"  target="_blank"><img :src="getIcon('figma')"/></Button>
    <Button v-if="project.manual" size="l" :href="`https://${project.manual}`"  target="_blank">Инструкция <BookIcon/></Button>
    <Button v-if="project.addDocument" size="l" :href="`https://${project.addDocument}`"  target="_blank">Доп.Документ</Button>
    <p>{{ project.isGitPull ? 'Настроен скрипт авто git pull' : 'Не настроен скрипт авто git pull' }}</p>
    <CopyText v-if="project.login" :text="project.login" />
    <CopyText v-if="project.password" :text="project.password" hide />
    <CopyAccess v-if="project.login" :project/>
  </div>
</template>

<script setup lang="ts">
import { getIcon, getProjectImg } from '@/utils/getFiles';
import { getUrlAdminLogin } from '@/utils/cms-api';
import Button from '@/components/ui/Button.vue';
import BookIcon from '@/components/icons/BookIcon.vue';
import CopyText from '@/components/ui/CopyText.vue';
import CopyAccess from '@/components/CopyAccess.vue';

defineProps<{
  project: Project;
}>();
</script>
<style lang="scss" >

.current-content {
  position: relative;
  padding: 10px;

  &:has(.current-content__bg) .current-content__header {
    padding-top: 70px;
  }
}

.current-content__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;

  &::after {
    content: '';
    position: absolute;
    inset:0;
    background-image: linear-gradient(light-dark(#ffffff00, #2e2f3800), light-dark(#fff, #2e2f38));
  }
}

.current-content__header {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  align-items: center;
}

.current-content__cms {
 aspect-ratio: 1;
 overflow: hidden;
 padding: 5px;
 background: #fff;
 border-radius: 16%;

 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s;
 }

 &:hover {
  img {
    transform: scale(1.1);
  }
 }
}

.current-content__name {
  color: currentColor;
  text-decoration: none;
}
</style>
