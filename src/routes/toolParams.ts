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
const defaultURLs = appList.reduce((o, key) => Object.assign(o, { [key]: { current: '', base: '' } }), {});

export const urlFill = writable(defaultURLs) as Writable<Record<streamToolNames, { 'current': string, 'base': string }>>;
export const storage: Writable<streamToolTotalStorage> = writable(structuredClone(defaultStorage));
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
    currentStorage[app][slot] = Object.assign({}, currentStorage[app].inProgress);
    console.log(currentStorage);
    return currentStorage;
  })
}

export function updateURLS(input: streamToolParameters, app: streamToolNames) {
  //Updating Standard V1 issues
  if (!input.version || input.version === 1) {
    if ('fontsize' in input) {
      input.fontsize = input.fontsize * 5
    }
  }
  // Adding any missing values
  for (const [k, v] of Object.entries(input)) {
    // This weird bit is all because TS sucks
    let newKey = k as keyof streamToolParameters;
    let newInput = input[newKey];
    let newDefault = defaults[app];
    if (v === null || v === undefined) newInput = newDefault[newKey];
  }
  return input;
}

export function uncrush(set: string | null) {
  if (!set) return {};
  return JSON.parse(JSONCrush.uncrush(decodeURIComponent(set)));
}

export async function runningApp(urlParams: URLSearchParams, app: streamToolNames) {
  let initParams = uncrush(urlParams.get("data"));
  let updatedData = updateURLS(initParams, app);
  let reformatted = await reformatting[app](updatedData);
  storage.update(currentStorage => {
    currentStorage[app]['inProgress'] = structuredClone(reformatted);
    return currentStorage;
  })
}

export async function loadURL(input: string, app: streamToolNames) {
  let uncrushedData = uncrush(input.split("?data=")[1]);
  let parsedData = updateURLS(uncrushedData, app);
  let reformatted = await reformatting[app](parsedData);
  storage.update(currentStorage => {
    currentStorage[app].inProgress = Object.assign({}, reformatted);
    return currentStorage;
  })
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
    console.log('App init function running');
    let jsonParsed = JSON.parse(existingStorage);
    appList.forEach(async appName => {
      jsonParsed[appName].inProgress = await reformatting[appName](jsonParsed[appName].inProgress);
      // NEED TO TEST THE FOLLOWING PLEASE
      let appNameDefault = defaults[appName];
      for (const key in appNameDefault) {
        if (!jsonParsed[appName].inProgress.hasOwnProperty(key)) {
          console.log(`${key} is being added to settings`);
          jsonParsed[appName].inProgress[key] = appNameDefault[key];
        }
      }
    })
    storage.set(jsonParsed);
    appList.forEach(async appName => {
      urlBuild(appName)
    })
    toastUpdate('Save Data Found!', 'pass');
  }

  // This needs to be here so you don't overwrite the localstorage before checking
  storage.subscribe((value) => {
    window.localStorage.streamTools = JSON.stringify(value);
  });

  return true;
}