const cmsList: { [key: string]: string } = {
  UMI: 'admin/content/sitetree/',
  EzPro: 'ezpro/',
  Bitrix: 'bitrix/admin/#authorize',
  ABO: 'login.php',
  MODX: 'manager/',
  AdminLTE: 'admin/',
  Joomla: 'administrator/',
}

export const getUrlAdminLogin = (url: string, urlAdmin: string, cms: CMSName) => {
  switch (cms) {
    case 'Нет':
    case '':
      return '#'
    case 'Своя':
    case 'WordPress':
      return urlAdmin.includes('http:') ? `${urlAdmin}` : `https://${urlAdmin}`
    case 'Tilda':
      return "https://tilda.ru/login/"
    default:
      return url.includes('http:') ? `http://${url.replace('http:', '')}/${cmsList[cms]}` : `https://${url}/${cmsList[cms]}`
  }
}