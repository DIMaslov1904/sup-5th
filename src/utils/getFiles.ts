import {URL_IMG_PROJECT, URL_IMG_CMS} from '@/globVars'

export const getIcon = (name: string) => chrome.runtime.getURL(URL_IMG_CMS.replace('{}', name.toLowerCase()));
export const getProjectImg = (name: string) => chrome.runtime.getURL(URL_IMG_PROJECT.replace('{}', name));
