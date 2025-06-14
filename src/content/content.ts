console.log('Контентный скрипт запущен')

// Слушаем сообщения от popup или background
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log('Сообщение, полученное в скрипте содержимого:', message)
  
  if (message.type === 'GET_PAGE_INFO') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      timestamp: Date.now()
    })
  }
})

// Отправляем сообщение в background при загрузке страницы
chrome.runtime.sendMessage({
  type: 'PAGE_LOADED',
  url: window.location.href,
  title: document.title
})
