import { defineStore } from "pinia";
import { ref } from "vue";
import { setToStorage, getFromStorage } from "@/utils/chrome-api";
import { getProjects, getAccess } from "@/utils/projects-api";
import { URL_IMG_PROJECT } from "@/globVars";
import { useNoticeStore } from "./notice";

const STORAGE_NAME = "projectsState";

const defaultState = () => ({
  projects: [],
  isLoading: false,
  isLoadingAccess: false,
  isLoadingIMG: false,
});
const defaultStateOne = (): Project => ({
  name: "",
  url: "",
  subdomain: false,
  urlAdmin: "",
  cms: "Нет",
  login: "",
  password: "",
  manual: "",
  git: "",
  figma: "",
  addDocument: "",
  updateAt: new Date().getTime(),
  isImg: false
});
export const useProjectsStore = defineStore(STORAGE_NAME, () => {
  const state = ref<any>(defaultState());
  let projectUrls: string[] = []


  const edit = (num: number, name: string, data: any) => {
    state.value.projects = state.value.projects.map((item: any) => {
      if (item.id === num) return { ...item, [name]: data };
      return item;
    });
    saveToStorage();
  };

  const checkImg = async (urlProject: string) => {
    try {
      return (
        await fetch(URL_IMG_PROJECT.replace("{}", urlProject), {
          method: "HEAD",
        })
      ).ok;
    } catch (_) {
      return false;
    }
  };

  const add = async (data: Project) => {
    state.value.projects = [
      ...state.value.projects,
      { ...data, isImg: await checkImg(data.url) },
    ];
  };

  const remove = (url: string) => {
    state.value.projects = state.value.projects.filter(
      (el: Project) => el.url !== url
    );
  };

  const getItem = (url: string) => {
    return state.value.projects.findIndex((item: any) => item.url === url);
  };

  const updateItem = async (index: number, data: any) => {
    let isUpdate = false
    state.value.projects = state.value.projects.map((item: any, i: number) => {
      if (i === index) {
        for (const k in data) if (data[k] !== item[k]) isUpdate = true
        if (isUpdate) return { ...item, ...data, updateAt: new Date().getTime()};
      }
      return item;
    });
    return isUpdate
  };

  const updateIsImg = async () => {
    const noticeStore = useNoticeStore();
    let newImg = 0;

    state.value.isLoadingIMG = true;
    state.value.projects = state.value.projects.map(async (item: any) => {
      const isImg = await checkImg(item.url);
      if (!item.isImg && isImg) newImg++;
      return { ...item, isImg };
    });
    state.value.isLoadingIMG = false;
    noticeStore.add("success", `Найдено новых изображений: ${newImg}шт`, 10);
  };

  const cleanUrl = (url: string) => {
    return url.replace("https://", "").replace('http://', '');
  };

  const getHost = (url: string) => { 
    try {
      return new URL('https://' + url).host;
    } catch (_) { 
      return url;
    }
  }

  const update = async () => {
    const noticeStore = useNoticeStore();
    let countUpdate = 0;
    let constAdd = 0;
    const notFounds: string[] = [];

    state.value.isLoading = true;
    state.value.isLoadingIMG = true;
    const res = await getProjects();

    if (res.result.length === 0) {
      noticeStore.add("error", "Проектов не найдено");
      state.value.isLoading = false;
      state.value.isLoadingIMG = false;
      return;
    }

    let indexs =
      state.value.projects.length > 0
        ? [...Array(state.value.projects.length).keys()]
        : [];    

    try {
      for (const item of res.result) {
            const newItem = {
              name: item[0],
              url: getHost(cleanUrl(item[1])),
              subdomain: item[2],
              urlAdmin: cleanUrl(item[4]),
              cms: item[5],
              manual: cleanUrl(item[3]),
              git: cleanUrl(item[6]),
              figma: cleanUrl(item[7]),
              addDocument: cleanUrl(item[8]),
            };
            const indexItem = getItem(newItem.url);
            
            if (indexItem !== -1) {
              indexs = indexs.filter((item: number) => item !== indexItem);
              projectUrls = projectUrls.filter(el => el !== newItem.url)
              if (await updateItem(indexItem, newItem)) { 
                countUpdate++;
              }
            } else {
              constAdd++;
              await add({ ...defaultStateOne(), ...newItem });
            }
          }

          if (indexs.length !== 0)
            indexs.forEach((index: number) =>
              notFounds.push(
                `${state.value.projects[index].name} (${state.value.projects[index].url})`
              )
            );

          noticeStore.add(
            "success",
            "Проекты загружены<br>" +
              (countUpdate > 0 ? `Обновлено проектов: ${countUpdate}шт.<br>` : "") +
              (constAdd > 0 ? `Добавлено проектов: ${constAdd}шт.` : "") +
              (notFounds.length > 0
                ? `<br>Нет в общем списке:<ol><li>${notFounds.join(";</li><li> ")}</li></ol>`
              : ""),
            10
          );

      saveToStorage();
    } catch (e) {
      noticeStore.add("error", "<b>Ошибка загрузки проектов:</b><br>Не верная структура таблицы");
      console.error(e)
    }
    
    state.value.isLoading = false;
    state.value.isLoadingIMG = false;
  };

  const updateAccess = async () => {
    const noticeStore = useNoticeStore();
    let countUpdate = 0;
    const newProjects = [];

    state.value.isLoadingAccess = true;

    const res = await getAccess();

    for (const item of res.result) {
      const newItem = {
        url: getHost(cleanUrl(item[1])),
        login: item[2],
        password: item[3],
      };
      const indexItem = getItem(newItem.url);
      if (indexItem !== -1) {
        projectUrls = projectUrls.filter(el => el !== newItem.url)
        if (await updateItem(indexItem, newItem)) {
          countUpdate++;
        }
      } else {
        newProjects.push(`${item[0]} (${newItem.url})`);
        await add({ ...defaultStateOne(), ...newItem, name: item[0] });
      }
    }

    noticeStore.add(
      "success",
      "Доступы загружены<br>" +
        (countUpdate > 0 ? `Обновлены доступы: ${countUpdate}шт.<br>` : "") +
      (newProjects.length > 0 ? `Добавлено проектов из личного доступа:<ol> <li>${newProjects.join(";</li><li> ")}.</li></ol>` : ""),
      10
    );

    saveToStorage();
    state.value.isLoadingAccess = false;
  };
  const updateAll = async () => {
    const noticeStore = useNoticeStore();

    state.value.projects.forEach((el: Project) => projectUrls.push(el.url))
    await update();
    await updateAccess();

    let deleteProjects = 0

    projectUrls.forEach((url: string) => { 
      remove(url)
      deleteProjects++
    })

    if (deleteProjects > 0) { 
      noticeStore.add(
        "success",
        `Проектов удалено: ${deleteProjects}шт.<br>` +
        `Проекты, которых больше вам не доступны:<ol> <li>${projectUrls.join(";</li><li> ")}.</li></ol>`
      );
    }
    projectUrls = [];
  };

  const saveToStorage = () => setToStorage(STORAGE_NAME, {projects: state.value.projects});

  const loadFromStorage = async () => {
    const result = await getFromStorage(STORAGE_NAME);
    state.value = {
      ...defaultState(),
      projects: result === undefined ? [] : result.projects,
    };
  };

  return {
    state,
    edit,
    update,
    remove,
    updateIsImg,
    updateAccess,
    updateAll,
    loadFromStorage,
  };
});
