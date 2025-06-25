import './widget.css'

const cmsList: { [key: string]: string } = {
  UMI: 'admin/content/sitetree/',
  EzPro: 'ezpro/',
  Bitrix: 'bitrix/admin/#authorize',
  ABO: 'login.php',
  MODX: 'manager/',
  AdminLTE: 'admin/',
  Joomla: 'administrator/',
}

const getUrlAdminLogin = (urlAdmin: string, cms: CMSName) => {
  switch (cms) {
    case 'Нет':
    case '':
      return '#'
    case 'Своя':
    case 'WordPress':
      return `https://${urlAdmin}`
    case 'Tilda':
      return "https://tilda.ru/login/"
    default:
      return `/${cmsList[cms]}`
  }
}

const getVal = (num: number, attr: {min?: number, max?: number} = {}) : number => {
  if (!num) return 0
  let res = Math.trunc(num)
  if (attr.min !== undefined) res = Math.max(res, attr.min)
  if (attr.max !== undefined) res = Math.min(res, attr.max)
  return res
}

let storage: ProjectStorage | null = null,
currentProject: Project | null = null,
floatingWidget: HTMLElement | null = null

const STORAGE_NAME = "projectsState"

const getProjectImg = (name: string) => { 
  let nameFile = name === 'Своя' ? "cms" : name === 'Нет' ? "hosting" : name.toLowerCase()
  return chrome.runtime.getURL(`/assets/icons/${nameFile}.svg`)
}

const getFromStorage = async () => {
  try {
    const result = await chrome.storage.local.get([STORAGE_NAME])
    if (result[STORAGE_NAME] !== undefined) return JSON.parse(result[STORAGE_NAME])
    return null
  } catch (error) {
    console.error('Ошибка при получении из хранилища:', error)
    return null
  }
}

const setToStorage = async (data: Record<string, any>) => {
  try { await chrome.storage.local.set({ [STORAGE_NAME]: JSON.stringify(data) }) }
  catch (error) { console.error('Ошибка при сохранении в хранилище:', error) }
}

const saveWidgetPosition = async (): Promise<void> => {
  storage = await getFromStorage() as ProjectStorage
  if (!storage) return
  let widgetPosition = undefined
  if (currentProject?.widgetPosition && (currentProject.widgetPosition.x || currentProject.widgetPosition?.y)) widgetPosition = currentProject.widgetPosition
  storage.projects = storage.projects.map((item: any) => (item.url === currentProject?.url) ? { ...item, widgetPosition } : item)
  await setToStorage(storage)
}

const checkCurrentProject = async (): Promise<void> => {
  storage = await getFromStorage() as ProjectStorage
  if (!storage) return
  const currentDomain = new URL(window.location.href).hostname
  currentProject = storage.projects.find(project => project.url ? (project.subdomain ? currentDomain.includes(project.url) : currentDomain===project.url) : false) || null
  if (currentProject) createFloatingWidget()
}

const createFloatingWidget = async(): Promise<void> => {
  // Добавляем стили
  const styleSheet = document.createElement('link')
  styleSheet.href = chrome.runtime.getURL('widget.css')
  styleSheet.rel = 'stylesheet'
  document.head.appendChild(styleSheet)

  // Сам виджет
  floatingWidget = document.createElement('div')
  floatingWidget.className = 'sup-5th-widget no_anim'

  // Кнопка открытия закрытия виджета с лого cms
  const btnMenu = document.createElement('button')
  btnMenu.className = 'sup-5th-btn sup-5th-menu'
  btnMenu.style = `background-image: url(${getProjectImg(currentProject?.cms || 'cms')})`
  btnMenu.addEventListener('click', () => floatingWidget?.classList.toggle('open'))
  floatingWidget.appendChild(btnMenu)

  // Кнопка админки
  if (currentProject && currentProject.urlAdmin) { 
    const btnAdm = document.createElement('a')
    btnAdm.className = 'sup-5th-btn'
    btnAdm.title = 'Перейти в админку'
    btnAdm.href = getUrlAdminLogin(currentProject.urlAdmin, currentProject.cms)
    btnAdm.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M29.333 16C29.333 8.64 23.36 2.667 16 2.667S2.667 8.64 2.667 16 8.64 29.333 16 29.333"/>
      <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" opacity=".4">
        <path d="M10.666 4H12a37.899 37.899 0 0 0 0 24h-1.333M20 4a38.074 38.074 0 0 1 1.947 12"/>
        <path d="M4 21.333V20a38.074 38.074 0 0 0 12 1.947M4 12a37.899 37.899 0 0 1 24 0"/>
      </g>
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="m25.615 20.987-4.72 4.72c-.187.186-.36.533-.4.786l-.254 1.8c-.093.654.36 1.107 1.014 1.014l1.8-.254c.253-.04.613-.213.786-.4l4.72-4.72c.814-.813 1.2-1.76 0-2.96-1.186-1.186-2.133-.8-2.946.014Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M24.932 21.667c.4 1.44 1.52 2.56 2.96 2.96"/>
    </svg>
    `
    floatingWidget.appendChild(btnAdm)
  }

  // Кнопка инструкции
  if (currentProject && currentProject.manual) { 
    const btnManual = document.createElement('a')
    btnManual.target = '_blank'
    btnManual.className = 'sup-5th-btn'
    btnManual.title = 'Инструкция'
    btnManual.href = 'https://'+currentProject.manual
    btnManual.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M29.333 22.32V6.227c0-1.6-1.306-2.787-2.893-2.653h-.08c-2.8.24-7.053 1.666-9.427 3.16l-.226.146c-.387.24-1.027.24-1.414 0l-.333-.2C12.587 5.2 8.347 3.787 5.547 3.56c-1.587-.133-2.88 1.067-2.88 2.654V22.32c0 1.28 1.04 2.48 2.32 2.64l.386.054c2.894.386 7.36 1.853 9.92 3.253l.054.027c.36.2.933.2 1.28 0 2.56-1.414 7.04-2.894 9.946-3.28l.44-.054c1.28-.16 2.32-1.36 2.32-2.64Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7.32v20m-5.667-16h-3m4 4h-4" opacity=".4"/>
    </svg>
    `
    floatingWidget.appendChild(btnManual)
  }

  // Кнопка доп документа
  if (currentProject && currentProject.addDocument) { 
    const btnAddDocument = document.createElement('a')
    btnAddDocument.target = '_blank'
    btnAddDocument.className = 'sup-5th-btn'
    btnAddDocument.title = 'Доп документ'
    btnAddDocument.href = 'https://'+currentProject.addDocument
    btnAddDocument.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M28 9.333v13.334c0 4-2 6.666-6.667 6.666H10.667C6 29.333 4 26.667 4 22.667V9.333c0-4 2-6.666 6.667-6.666h10.666C26 2.667 28 5.333 28 9.333Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M19.333 6v2.667c0 1.466 1.2 2.666 2.667 2.666h2.667m-14 6H16m-5.333 5.334h10.666" opacity=".4"/>
    </svg>
    `
    floatingWidget.appendChild(btnAddDocument)
  }

  const position = currentProject?.widgetPosition || { x: 0, y: 0 }
  floatingWidget.style.setProperty("--x", `${position.x}dvw`)
  floatingWidget.style.setProperty("--y", `${position.y}dvh`)
  floatingWidget.style.setProperty("flex-direction", `${position.x > -50 ? 'row-reverse' : 'row'}`)
  
  makeDraggable(floatingWidget)

  document.body.appendChild(floatingWidget)

  floatingWidget.style.setProperty("--width-full", `${floatingWidget.childElementCount * 68}px`)
}

const makeDraggable = (element: HTMLElement): void => {
  let dragging = false,
    isClick = false,
    clictX = 0,
    clickY = 0,
    startX = 0,
    startY = 0

  const getPropertyXandY = (): { x: number, y: number } => { 
    const style = window.getComputedStyle(element)
    return {
      x: parseInt(style.getPropertyValue('--x')),
      y: parseInt(style.getPropertyValue('--y'))
    }
  }

  element.addEventListener('mousedown', (e) => {
    isClick = true
    clictX = e.pageX
    clickY = e.pageY
  })

  document.body.addEventListener("mouseup", async () => {
    dragging = false
    element.classList.remove('dragging')
    if (!currentProject) return
    currentProject.widgetPosition = getPropertyXandY()
    await saveWidgetPosition()
  })

  document.body.addEventListener('mousemove', (e) => {
    if (isClick && (Math.abs(clictX - e.pageX) > 2 || Math.abs(clickY - e.pageY) > 2)) { 
      isClick = false
      dragging = true
      element.classList.add('dragging')
      const { x, y } = getPropertyXandY()
      startX = e.pageX - (x / 100 * window.innerWidth)
      startY = e.pageY - (y / 100 * window.innerHeight) 
    }

    if (!dragging) return
    element.style.setProperty("--x", `${getVal(((startX - e.pageX) * -100 / window.innerWidth), {min: -99, max: 0})}dvw`)
    element.style.setProperty("--y", `${getVal(((startY - e.pageY) * -100 / window.innerHeight), {min: -99, max: 0})}dvh`)
  })
}

checkCurrentProject()
