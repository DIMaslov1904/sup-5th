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
  isGitPull: false,
  updateAt: new Date().getTime(),
  isImg: false
});
export const useProjectsStore = defineStore(STORAGE_NAME, () => {
  const state = ref<any>(defaultState());

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

  // const remove = (num: number) => {
  //   state.value.projects = state.value.projects.filter(
  //     (_: object, i: number) => i !== num
  //   );
  // };

  const getItem = (url: string) => {
    return state.value.projects.findIndex((item: any) => item.url === url);
  };

  const updateItem = async (index: number, data: any) => {
    state.value.projects = state.value.projects.map((item: any, i: number) => {
      if (i === index)
        return { ...item, ...data, updateAt: new Date().getTime() };
      return item;
    });
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
    return url.replace("https://", "");
  };

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
              url: cleanUrl(item[1]).replace("/", ""),
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
              countUpdate++;
              await updateItem(indexItem, newItem);
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
        url: cleanUrl(item[1]).replace("/", ""),
        login: item[2],
        password: item[3],
      };
      const indexItem = getItem(newItem.url);
      if (indexItem !== -1) {
        countUpdate++;
        await updateItem(indexItem, newItem);
      } else {
        newProjects.push(`${item[0]} (${newItem.url})`);
        await add({ ...defaultStateOne(), ...newItem, name: item[0] });
      }
    }

    noticeStore.add(
      "success",
      "Доступы загружены<br>" +
        (countUpdate > 0 ? `Обновлены доступы: ${countUpdate}шт.<br>` : "") +
      (newProjects.length > 0 ? `Добавлено проектов из личного доступа:<ol> <li>${newProjects.join(";</li><li> ").slice(0, -3)}.</li></ol>` : ""),
      10
    );

    saveToStorage();
    state.value.isLoadingAccess = false;
  };

  const updateAll = async () => {
    await update();
    await updateAccess();
  };

  const saveToStorage = () => setToStorage(STORAGE_NAME, state.value);

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
    updateIsImg,
    updateAccess,
    updateAll,
    loadFromStorage,
  };
});
