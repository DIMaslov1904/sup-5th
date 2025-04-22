document.addEventListener('DOMContentLoaded', function () {
  // Элементы
  const urlInput = document.getElementById('urlInput');
  const projectsContainer = document.getElementById('projectsContainer');
  const refreshButtons = document.querySelectorAll('[data-js-refresh]');
  const copyCodeButton = document.getElementById('copyCode');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveSettingsButton = document.getElementById('saveSettings');
  const tabsButton = document.querySelectorAll('[data-js-tab]');
  const tabsList = document.querySelectorAll('.tab');

  // Переменные для хранения данных
  let apiUrl = '';
  let lastResponseData = null;
  let currentTabUrl = '';

  // Загрузка настроек и данных
  loadSettings();
  getCurrentTabUrl();

  // Обработчики событий
  refreshButtons.forEach(item => item.addEventListener('click', fetchData));
  tabsButton.forEach(item => item.addEventListener('click', toggleTab));

  saveSettingsButton.addEventListener('click', saveSettings);
  copyCodeButton.addEventListener('click', copyToClipboard);

  // Функции
  function copyToClipboard(e) {
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
        const originalText = copyCodeButton.textContent;
        copyCodeButton.textContent = 'Скопировано!';
        setTimeout(() => {
          copyCodeButton.textContent = originalText;
        }, 1500);
      })
      .catch(err => {
        console.error('Ошибка копирования: ', err);
      });
  }

  function removeHttpPrefix(url) {
    return url.replace(/^https?:\/\//, '');
  }

  function toggleActiveClass(list = [], fn = () => { }, className = 'active') {
    list.forEach(item => fn(item) ? item.classList.add(className) : item.classList.remove(className))
  }

  function showTab(tabId) {
    toggleActiveClass(tabsButton, item => item.dataset.jsTab === tabId)
    toggleActiveClass(tabsList, item => item.id === tabId)
  }

  function toggleTab(e) {
    showTab(e.target.getAttribute('data-js-tab'))
  }


  function saveSettings() {
    apiUrl = urlInput.value.trim();
    if (!apiUrl) {
      alert('Введите API URL');
      return;
    }

    chrome.storage.sync.set({ apiUrl: apiUrl }, function () {
      showTab("projectsContainer")
      fetchData();
    });
  }

  function loadSettings() {
    chrome.storage.sync.get({ apiUrl: '' }, function (data) {
      apiUrl = data.apiUrl;
      urlInput.value = apiUrl;

      // Загрузка последних полученных данных
      loadLastData();
    });
  }

  function getCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        currentTabUrl = tabs[0].url;

        // Если у нас уже есть данные, обновляем отображение для выделения текущего сайта
        if (lastResponseData) {
          displayProjects(lastResponseData);
        }
      }
    });
  }

  function fetchData() {
    if (!apiUrl) {
      showMessage('Укажите API URL в настройках');
      showTab('settingsPanel');
      return;
    }

    showMessage('Загрузка...');

    // Получение данных с таймаутом в 15 секунд
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        return response.json();
      })
      .then(data => {
        lastResponseData = data;
        displayProjects(data);
        saveLastData(data);
        updateBadgeForCurrentTab();
      })
      .catch(error => {
        clearTimeout(timeoutId);
        showMessage('Error: ' + error.message);
      });
  }

  function displayProjects(data) {
    projectsContainer.innerHTML = '';

    if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
      showMessage('В ответе не найдено ни одного проекта');
      return;
    }

    let hasProjects = false;
    let currentSiteProject = null;
    let otherProjects = [];

    // Первый проход: определение текущего сайта и разделение проектов
    data.result.forEach(project => {
      // Пропускаем пустые проекты (все поля пустые)
      if (project.every(field => field === "")) {
        return;
      }

      hasProjects = true;
      const [name, url, urlAdmin, login, password] = project;

      // Проверяем, соответствует ли этот проект текущему URL вкладки
      if (url && currentTabUrl && currentTabUrl.includes(getDomain(url))) {
        currentSiteProject = project;
      } else {
        otherProjects.push(project);
      }
    });

    // Сначала отображаем текущий сайт, если найден
    if (currentSiteProject) {
      createProjectCard(currentSiteProject, true);
    }

    // Отображаем остальные проекты
    otherProjects.forEach(project => {
      createProjectCard(project, false);
    });

    if (!hasProjects) {
      showMessage('В ответе не найдено ни одного действительного проекта');
    }
  }

  function createProjectCard(project, isCurrentSite) {
    const [name, url, urlAdmin, login, password] = project;

    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    if (isCurrentSite) {
      projectCard.classList.add('current-site');
    }

    // Название проекта
    const titleElement = document.createElement('a');
    titleElement.className = 'project-title';
    titleElement.textContent = `${name} (${removeHttpPrefix(url)})` || 'Без названия';
    titleElement.href = url;
    titleElement.target = '_blank';
    projectCard.appendChild(titleElement);

    const cardContent = document.createElement('div');
    cardContent.className = 'project-content';
    projectCard.appendChild(cardContent);


    // URL админки
    const urlElement = document.createElement('div');
    urlElement.className = 'project-url';
    if (urlAdmin) {
      const urlLink = document.createElement('a');
      urlLink.href = urlAdmin;
      urlLink.textContent = 'Админка';
      urlLink.target = '_blank';
      urlElement.appendChild(urlLink);
    } else {
      urlElement.textContent = 'Нет данных';
    }
    cardContent.appendChild(urlElement);


    // Учетные данные
    const credentialsElement = document.createElement('div');
    credentialsElement.className = 'project-credentials';

    // Логин
    if (login) {
      const loginElement = createCredentialItem('Логин', login);
      credentialsElement.appendChild(loginElement);
    }

    // Пароль
    if (password) {
      const passwordElement = createCredentialItem('Пароль', '******');
      credentialsElement.appendChild(passwordElement);
    }

    cardContent.appendChild(credentialsElement);
    projectsContainer.appendChild(projectCard);
  }

  function createCredentialItem(label, value = '') {
    const container = document.createElement('div');
    container.className = 'credential-item';

    const labelElement = document.createElement('span');
    labelElement.className = 'credential-label';
    labelElement.textContent = label + ':';

    const valueButton = document.createElement('button');
    valueButton.className = 'credential-button';
    valueButton.title = 'Нажмите, чтобы скопировать';
    valueButton.textContent = value;

    valueButton.addEventListener('click', () => {
      navigator.clipboard.writeText(value)
        .then(() => {
          const originalText = valueButton.textContent;
          valueButton.textContent = 'Скопировано!';
          setTimeout(() => {
            valueButton.textContent = originalText;
          }, 1500);
        })
        .catch(err => {
          console.error('Ошибка копирования: ', err);
        });
    })

    container.appendChild(labelElement);
    container.appendChild(valueButton);

    return container;
  }

  function showMessage(message) {
    projectsContainer.innerHTML = `<div class="no-projects">${message}</div>`;
  }

  function saveLastData(data) {
    chrome.storage.local.set({
      lastResponseData: data
    });
  }

  function loadLastData() {
    chrome.storage.local.get({
      lastResponseData: null
    }, function (data) {
      if (data.lastResponseData) {
        lastResponseData = data.lastResponseData;
        displayProjects(data.lastResponseData);
        updateBadgeForCurrentTab();
      } else if (apiUrl) {
        // Если у нас есть API URL, но нет данных, получаем их
        fetchData();
      }
    });
  }

  function updateBadgeForCurrentTab() {
    if (!lastResponseData || !lastResponseData.result || !currentTabUrl) {
      return;
    }

    let isCurrentSiteInProjects = false;

    // Проверяем, есть ли текущий сайт в проектах
    for (const project of lastResponseData.result) {
      if (project.length >= 2) {
        const projectUrl = project[1];
        if (projectUrl && currentTabUrl.includes(getDomain(projectUrl))) {
          isCurrentSiteInProjects = true;
          break;
        }
      }
    }

    // Обновляем значок
    if (isCurrentSiteInProjects) {
      chrome.action.setBadgeText({ text: "★" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }

  // Вспомогательная функция для извлечения домена из URL
  function getDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  }
});
