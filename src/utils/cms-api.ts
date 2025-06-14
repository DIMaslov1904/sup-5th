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
    case 'Своя':
    case 'WordPress':
      return `https://${urlAdmin}`
    case 'Тильда':
      return "https://tilda.ru/login/"
    default:
      return `https://${url}/${cmsList[cms]}`
  }
}