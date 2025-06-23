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
    case 'Своя':
    case 'WordPress':
      return `https://${urlAdmin}`
    case 'Тильда':
      return "https://tilda.ru/login/"
    default:
      return `/${cmsList[cms]}`
  }
}

let storage: ProjectStorage | null = null,
currentProject: Project | null = null,
floatingWidget: HTMLElement | null = null

const STORAGE_NAME = "projectsState"

const getProjectImg = (name: string) => chrome.runtime.getURL(`/assets/icons/${name.toLowerCase()}.svg`)

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

const checkCurrentProject = async (): Promise<void> => {
  storage = await getFromStorage() as ProjectStorage
  if (!storage) return
  const currentDomain = new URL(window.location.href).hostname
  currentProject = storage.projects.find(project => project.url ? (project.subdomain ? currentDomain.includes(project.url) : currentDomain===project.url) : false) || null
  if (currentProject) createFloatingWidget()
}

const createFloatingWidget =(): void => {
  floatingWidget = document.createElement('div')
  floatingWidget.id = 'sup-5th-widget'
  floatingWidget.title = currentProject?.cms || 'Проект'
  floatingWidget.innerHTML = `
    <img src="${getProjectImg(currentProject?.cms || 'cms')}" class="widget-icon">
  `

  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    #sup-5th-widget {
      --x: 0;
      --y: 0;
      --width: 0;
      --height: 0;
      --translate: translate(min(max(var(--x), calc((100dvw - var(--width) - 46px) * -1)), 0dvw), min(max(var(--y), calc((100dvh - var(--height) - 46px) * -1)), 0dvh));
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 1000000000000;
      background: rgb(255 255 255 / .9);
      border-radius: 16px;
      padding: 10px;
      user-select: none;
      font-size: 14px;
      transform: var(--translate);
      font-family: Arial, sans-serif;
      box-shadow: 0 0 11px 2px rgb(0 0 0 / .2);
      transition: transform .23s;
      cursor: pointer;
    }
    
    #sup-5th-widget:not(.dragging):hover {
      transform: var(--translate) scale(1.05);
    }
    
    #sup-5th-widget .widget-icon {
      width: 48px;
      pointer-events: none;
    }

    
    #sup-5th-widget.dragging {
      transition: none;
      opacity: 0.8;
      background: #ef3e2c;
      cursor: grabbing;
    }
  `
  document.head.appendChild(styleSheet)

  const position = currentProject?.widgetPosition || { x: 0, y: 0 }
  floatingWidget.style.setProperty("--x", `${position.x}dvw`)
  floatingWidget.style.setProperty("--y", `${position.x}dvh`)
  
  makeDraggable(floatingWidget)

  document.body.appendChild(floatingWidget)
  floatingWidget.style.setProperty("--width", `${floatingWidget.clientWidth}px`)
  floatingWidget.style.setProperty("--height", `${floatingWidget.clientHeight}px`)
}


const makeDraggable = (element: HTMLElement): void => {
  let dragging = false,
  startX = 0,
  startY = 0,
  timer: number | null = null

  const getPropertyXandY = (): { x: number, y: number } => { 
    const style = window.getComputedStyle(element)
    return {
      x: parseInt(style.getPropertyValue('--x')),
      y: parseInt(style.getPropertyValue('--y'))
    }
  }

  element.addEventListener('mousedown', (e) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      dragging = true
      element.classList.add('dragging')
      const { x, y } = getPropertyXandY()
      startX = e.pageX - (x / 100 * window.innerWidth)
      startY = e.pageY - (y / 100 * window.innerHeight) 
    }, 500)
  })

  document.body.addEventListener("mouseup", async (e) => {
    if (timer) {
      clearTimeout(timer)
      if (currentProject && !dragging && e.button === 0) {
        window.open(getUrlAdminLogin(currentProject.urlAdmin, currentProject.cms) || '', '_blank')
      }
    }
    dragging = false
    element.classList.remove('dragging')
    if (!currentProject) return
    currentProject.widgetPosition = getPropertyXandY()
    await saveWidgetPosition()
  })

  document.body.addEventListener('mousemove', (e) => {
    if (!dragging) return
    element.style.setProperty("--x", `${(startX - e.pageX) * -100 / window.innerWidth}dvw`)
    element.style.setProperty("--y", `${(startY - e.pageY) * -100 / window.innerHeight}dvh`)
  })
}

async function saveWidgetPosition(): Promise<void> {
  storage = await getFromStorage() as ProjectStorage
  if (!storage) return
  storage.projects = storage.projects.map((item: any) => (item.url === currentProject?.url) ? { ...item, widgetPosition: currentProject?.widgetPosition } : item)
  await setToStorage(storage)
}

checkCurrentProject()
