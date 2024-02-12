import JSONCrush from "jsoncrush";
// I'm including this so that the store can check to see if all apps are included
let appList: Array<streamToolNames> = ['chatter', 'emotedrop'];

import { paramReformat as paramReformatChatter } from "./streamtools/chatter/Chatter";
import { paramReformat as paramReformetEmote } from "./streamtools/emotedrop/EmoteDrop";

import { defaultParams as defaultChatter } from "./streamtools/chatter/Chatter";
import { defaultParams as defaultEmote } from "./streamtools/emotedrop/EmoteDrop";

let reformatting: Record<streamToolNames, Function> = {
  'chatter': paramReformatChatter,
  'emotedrop': paramReformetEmote,
}

const defaults: Record<streamToolNames, streamToolParameters> = {
  'chatter': defaultChatter,
  'emotedrop': defaultEmote,
}

export const compareObjects = (oldObj: Record<string, any>, newObj: Record<string, any>): Record<string, any> => (
  Object.keys(newObj).filter(key => !(key in oldObj)).forEach((key) => {
    oldObj[key] = newObj[key];
    console.log(key + ' has been added');
  }),
  Object.keys(oldObj).filter(key => !(key in newObj)).forEach(key => delete oldObj[key]),
  oldObj
);

// DEFAULT STORAGE CREATION
import { writable, get, type Writable } from "svelte/store";

function generateDefaultStorage() {
  const tempStorage: Partial<streamToolTotalStorage> = {};
  appList.forEach(appKey => {
    tempStorage[appKey] = {
      inProgress: structuredClone(defaults[appKey]),
      0: structuredClone(defaults[appKey]),
      1: structuredClone(defaults[appKey]),
      2: structuredClone(defaults[appKey]),
      reload: 0,
    };
  });
  return tempStorage as streamToolTotalStorage;
}
const defaultStorage = generateDefaultStorage();
export const storage: Writable<streamToolTotalStorage> = writable(structuredClone(defaultStorage));

// URLS
const defaultURLs = appList.reduce((o, key) => Object.assign(o, { [key]: { current: '', base: '' } }), {});
export const urlFill = writable(defaultURLs) as Writable<Record<streamToolNames, { 'current': string, 'base': string }>>;
/////////

export function urlBuild(appName: streamToolNames) {
  // Need to add app name to this so it pulls from storage.
  let toCrush = structuredClone(get(storage)[appName].inProgress);
  let urlCrush = encodeURIComponent(JSONCrush.crush(JSON.stringify(toCrush)));
  let baseURL = get(urlFill)[appName].base
  let replaceURL = baseURL.includes('/app') ? `${baseURL}?data=${urlCrush}` : `${baseURL}/app?data=${urlCrush}`;
  urlFill.update(currentURLs => {
    currentURLs[appName].current = replaceURL;
    return currentURLs
  })
}

export function save(app: streamToolNames, slot: number) {
  console.log('SAVING', app, slot);
  storage.update(currentStorage => {
    currentStorage[app][slot] = structuredClone(currentStorage[app].inProgress);
    console.log(currentStorage);
    return currentStorage;
  })
}

//Updating Standard V1 issues
export function updateURLS(input: streamToolParameters, app: streamToolNames) {
  if (!input.version || input.version === 1) {
    if ('fontsize' in input) {
      input.fontsize = input.fontsize * 5;
      input.nameCustom = input.togglecol;
      input.bgopacity = input.bgopacity * 10;
      input.proOutline = 2;
      input.proColour = input.chatcolour;
      input.proUseCol = false;
    }
  }
  return input;
}

export function uncrush(set: string | null) {
  if (!set) return {};
  return JSON.parse(JSONCrush.uncrush(decodeURIComponent(set)));
}

export async function loadingURLData(input: any, app: streamToolNames) {
  let parsedData = updateURLS(input, app);
  let reformatted = await reformatting[app](parsedData);
  storage.update(currentStorage => {
    currentStorage[app].inProgress = structuredClone(reformatted);
    return currentStorage;
  })
}

export async function runningApp(urlParams: URLSearchParams, app: streamToolNames) {
  let initParams = uncrush(urlParams.get("data"));
  loadingURLData(initParams, app)
}

export async function loadURL(input: string, app: streamToolNames) {
  let uncrushedData = uncrush(input.split("?data=")[1]);
  loadingURLData(uncrushedData, app);
}

//LOADING FROM LOCALSTORAGE
export async function loadSave(app: streamToolNames, slot: number) {
  storage.update(currentStorage => {
    currentStorage[app].inProgress = structuredClone(currentStorage[app][slot]);
    return currentStorage;
  })
}

export function dashReset(app: streamToolNames) {
  storage.update(currentStorage => {
    currentStorage[app].inProgress = structuredClone(defaults[app]);
    return currentStorage;
  })
  urlBuild(app);
}

export async function appInit(toastUpdate: toastUpdate) {
  let existingStorage = window.localStorage.streamTools;
  if (existingStorage) {
    let jsonParsed = JSON.parse(existingStorage);
    appList.forEach(async appName => {
      jsonParsed[appName].inProgress = await reformatting[appName](jsonParsed[appName].inProgress);
      urlBuild(appName);
    })
    storage.set(jsonParsed);
    toastUpdate('Save Data Found!', 'pass');
  }

  // This needs to be here so you don't overwrite the localstorage before checking
  storage.subscribe((value) => {
    window.localStorage.streamTools = JSON.stringify(value);
    appList.forEach(async appName => {
      urlBuild(appName);
    })
  });

  return true;
}