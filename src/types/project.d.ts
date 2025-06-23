type Project = {
  name: string
  url: string
  urlAdmin: string
  cms: CMSName
  login: string
  password: string
  manual: string
  git: string
  figma: string
  addDocument: string
  isGitPull: boolean
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