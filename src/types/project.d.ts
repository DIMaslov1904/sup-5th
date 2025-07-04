type Project = {
  name: string
  url: string,
  subdomain: boolean
  urlAdmin: string
  cms: CMSName
  login: string
  password: string
  manual: string
  git: string
  figma: string
  addDocument: string
  updateAt: number
  isImg: boolean,
  widgetPosition?: { x: number; y: number }
}

type ProjectStorage = {
  projects: Project[]
  isLoading: boolean
  isLoadingIMG: boolean
  isLoadingAccess: boolean
}