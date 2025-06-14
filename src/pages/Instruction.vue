<template>
    <Content  class="instruction-page">
    <h2>Инструкция по созданию api в гугл таблице</h2>
    <ol>
      <li>Переходим в нашу таблицу доступов</li>
      <li>Проверяем название листа. Должно быть так же "Доступы к сайтам"</li>
      <li>
        Проверяем столбцы
        <ul>
          <li>Название</li>
          <li>Адрес</li>
          <li>Логин</li>
          <li>Пароль</li>
        </ul>
      </li>
      <li>В верхнем меню выбираем &#128073;Расширения &#128073;Apps script</li>
      <li>Копируем код: <Button @click="copyCode">{{ copyCodeText }}</Button></li>
      <li>Вставляем код в редактор, удаляя пустую функцию по умолчанию</li>
      <li>Нажимаем сверху кнопку &#128073;Начать развертывание</li>
      <li>&#128073;Новое развертывание</li>
      <li>Выберите тип, нажимаем шестеренку, выбираем &#128073;Веб-приложение</li>
      <li>У кого есть доступ, ставим - &#128073;Все</li>
      <li>Предоставить доступ, дальше авторизация через гугл</li>
      <li>‼️На странице с восклицательным знаком - &#128073;Advanced &#128073;Go to [название_проекта] (unsafe)</li>
      <li>Копируем URL</li>
      <li>Вставляем в поле &#128073;Url до api с личными доступами&#128072; на предыдущем экране или в разделе настроек в
        дальнейшем</li>
    </ol>
  </Content>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Content from '@/components/Content.vue'

defineEmits(['return'])

const copyCodeText = ref('Скопировать код')

const copyCode = () => {
  navigator.clipboard.writeText(
    `
var ss = SpreadsheetApp.getActiveSpreadsheet(); // spreadsheet

function getData(){
  var sheetName = "Доступы к сайтам"; // название нужного листа
  var s = ss.getSheetByName(sheetName); // получаем конкретный лист по имени
  
  if (!s) {
    throw new Error("Лист 'Доступы к сайтам' не найден");
  }
  
  var result = [],
      range = 'A:E', // диапазон ячеек, который хотим выгружать
      values = s.getRange(range).getValues(),
      last_row = s.getLastRow(); // не нужно parseInt, метод уже возвращает число
    
  // начинаем с 1, чтобы пропустить заголовки (если они есть)
  for (var i = 1; i < last_row; i++) {
      result.push(values[i]);     
  }
  return result; 
}

function doGet() {
  try {
    var data = getData();
    return ContentService.createTextOutput(
      JSON.stringify({'result': data}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({'error': e.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`
  )
    .then(() => {
      copyCodeText.value = 'Скопировано!';
      setTimeout(() => {
        copyCodeText.value = 'Скопировать код';
      }, 1500);
    })
}
</script>

<style lang="scss">
.instruction-page {
  padding: 10px;
}
</style>