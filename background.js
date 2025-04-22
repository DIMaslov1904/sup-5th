// Функция для проверки, соответствует ли URL текущей вкладки какому-либо проекту
function checkCurrentTab(tabId, changeInfo, tab) {
  // Выполняется только когда вкладка полностью загружена
  if (changeInfo.status !== 'complete') return;

  const currentUrl = tab.url;

  // Получаем сохраненные данные проекта
  chrome.storage.local.get({ lastResponseData: null }, function (data) {
    if (!data.lastResponseData || !data.lastResponseData.result) {
      // Нет доступных данных, очищаем значок
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    let isCurrentSiteInProjects = false;

    // Проверяем, есть ли текущий сайт в проектах
    for (const project of data.lastResponseData.result) {
      if (project.length >= 2) {
        const projectUrl = project[1];
        if (projectUrl && currentUrl?.includes(getDomain(projectUrl))) {
          isCurrentSiteInProjects = true;
          break;
        }
      }
    }

    // Обновляем значок
    if (isCurrentSiteInProjects) {
      chrome.action.setBadgeText({ text: "★", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  });
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

// Отслеживаем обновления вкладок
chrome.tabs.onUpdated.addListener(checkCurrentTab);

// Отслеживаем активацию вкладок (переключение между вкладками)
chrome.tabs.onActivated.addListener(function (activeInfo) {
  try {
    chrome.tabs.get(activeInfo?.tabId, function (tab) {
      try {
        checkCurrentTab(activeInfo?.tabId, { status: 'complete' }, tab);
      } catch (e) {
        return;
      };
    })
  } catch (e) {
    return;
  };
});