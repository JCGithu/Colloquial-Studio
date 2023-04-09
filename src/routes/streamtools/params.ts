import JSONCrush from "jsoncrush";
// I'm including this so that the store can check to see if all apps are included
let appList:Array<string> = ['chatter', 'emotedrop'];

import { paramReformat as paramReformatChatter } from "./chatter/paramsChatter";
import { paramReformat as paramReformetEmote } from "./emotedrop/paramsEmoteDrop";

import { defaultParams as defaultChatter } from "./chatter/paramsChatter";
import { defaultParams as defaultEmote } from "./emotedrop/paramsEmoteDrop";

let reformatting: {[x:string]:Function} = {
  'chatter': paramReformatChatter,
  'emotedrop': paramReformetEmote
}

let defaults: {[x:string]: standardObject} = {
  'chatter': defaultChatter,
  'emotedrop': defaultEmote
}

// DEFAULT STORAGE CREATION
import { writable, get} from "svelte/store";
const appStorageTemplate:streamToolAppStorage = {
  'inProgress': {},
  'loaded': {},
  0: {},
  1: {},
  2: {},
}
//const defaultStorage = appList.reduce((accumilate,val) => (accumilate[val]='',accumilate),{});
const defaultStorage:streamToolStorage = appList.reduce((ac,a) => ({...ac,[a]:Object.assign({}, appStorageTemplate)}),{});
const defaultURLs:standardObject = {};
appList.forEach(appKey => {
  defaultURLs[appKey] = '';
  Object.keys(appStorageTemplate).forEach(keyKey => defaultStorage[appKey][keyKey] = defaults[appKey]);
});
export const urlFill = writable(defaultURLs);
export const storage = writable(Object.assign({}, defaultStorage));
/////////

export function urlBuild(appName:string) {

  // Need to add app name to this so it pulls from storage.
  let toCrush = Object.assign({}, get(storage)[appName].inProgress);
  let urlCrush = encodeURIComponent(JSONCrush.crush(JSON.stringify(toCrush)));
  let baseURL = get(urlFill).base;
  let replaceURL = `${baseURL}/app?data=${urlCrush}`;
  if (baseURL.includes('/app')) replaceURL = `${baseURL}?data=${urlCrush}`;
  urlFill.update(currentURLs => {
    currentURLs[appName] = replaceURL;
    return currentURLs
  }) 
}

export function save(app:string, slot:number) {
  console.log('SAVING', app, slot);
  storage.update(currentStorage => {
    currentStorage[app][slot] = Object.assign({}, currentStorage[app].inProgress);
    console.log(currentStorage);
    return currentStorage;
  })
  // You can remove params from this?

  // console.log(`Saving params to ${app}:${slot}`);
  // let toSave = Object.assign({}, params);
  // delete toSave.saves;
  // let storage = window.localStorage.getItem(app) || JSON.stringify({0:{},1:{},2:{}});
  // let storageObj = JSON.parse(storage);
  // storageObj[slot] = toSave;
  // window.localStorage.setItem(app, JSON.stringify(storageObj));
  ///  storage.update(state => ({...state, [targetSetting]: value}))
}

export function updateV1URLs(input:standardObject, app:string){
  if (!input.version || input.version === 1){
    if (input.fontsize) input.fontsize = input.fontsize * 5;
  }
  let runningDefault = defaults[app];
  Object.keys(runningDefault).forEach((def)=>{
    if(input[def] === null || input[def] === undefined){
      input[def] = runningDefault[def];
      console.log(def + ' was changed to ' + runningDefault[def]);
    }
  });
  return input;
}

export function uncrush(set:string|null) {
  if (!set) return {};
  let undecode = decodeURIComponent(set);
  let uncrushed = JSONCrush.uncrush(undecode);
  return JSON.parse(uncrushed);
}

export async function runningApp(urlParams:URLSearchParams, app:string) {
  let initParams = uncrush(urlParams.get("data"));
  //console.log(initParams);
  let updatedData = updateV1URLs(initParams, app);
  //return await reformatting[app](updatedData);
  console.log(updatedData);
  let reformatted = await reformatting[app](updatedData);
  storage.update(currentStorage => {
    currentStorage[app]['loaded'] = Object.assign({}, reformatted);
    currentStorage[app]['inProgress'] = Object.assign({}, reformatted);
    return currentStorage;
  })

  // This no longer returns anything
}

export async function loadURL(input:string, app:string){
  let splitInput = input.split("?data=");
  let uncrushedData = uncrush(splitInput[1]);
  let parsedData = updateV1URLs(uncrushedData, app);
  let reformatted = await reformatting[app](parsedData);
  storage.update(currentStorage => {
    currentStorage[app]['loaded'] = Object.assign({}, reformatted);
    currentStorage[app]['inProgress'] = Object.assign({}, reformatted);
    return currentStorage;
  })
  // This no longer returns anything
}


//LOADING FROM LOCALSTORAGE
export async function loadSave(app:string, slot:number){
  storage.update(currentStorage => {
    currentStorage[app]['loaded'] = Object.assign({}, currentStorage[app][slot]);
    currentStorage[app]['inProgress'] = Object.assign({}, currentStorage[app][slot]);
    return currentStorage;
  })
  // console.log(`Loading params from ${app}:${slot}`);
  // let storage = window.localStorage.getItem(app) || JSON.stringify({0:{},1:{},2:{}});
  // let storageObj = JSON.parse(storage);
  // let parsedData = Object.assign({}, storageObj[slot]);
  // return await reformatting[app](parsedData);
}

export async function updateValue(app:string, value:any, id:string){
  let unparsedParams = Object.assign({}, get(storage)[app]['inProgress']);
  unparsedParams[id] = value;
  let parsedParams = await reformatting[app](unparsedParams, id);
  storage.update(currentStorage => {
    currentStorage[app].inProgress = parsedParams;
    console.log(currentStorage[app]);
    if(currentStorage[app].inProgress.channel === currentStorage[app].loaded.channel) currentStorage[app].loaded = Object.assign({},currentStorage[app].inProgress)
    return currentStorage;
  })
  urlBuild(app);
}

export async function reloadDashboard(app:string, value?:any, id?:string){
  storage.update(currentStorage => {
    if (id) currentStorage[app]['inProgress'][id] = value;
    currentStorage[app]['loaded'] = Object.assign({}, currentStorage[app]['inProgress']);
    return currentStorage;
  })
}

export function dashReset(app:string){
  storage.update(currentStorage => {
    currentStorage[app].loaded = Object.assign({}, defaults[app]);
    currentStorage[app].inProgress = Object.assign({}, defaults[app]);
    return currentStorage;
  })
}

export async function appInit(app:string, toastUpdate:Function){

  let existingStorage = window.localStorage.streamTools;
  if (existingStorage) {
    let jsonParsed = JSON.parse(existingStorage);
    Object.keys(reformatting).forEach(async appName => {
      let reformatted = await reformatting[appName](jsonParsed[appName]['loaded']);
      jsonParsed[appName]['loaded'] = reformatted;
      jsonParsed[appName]['inProgress'] = reformatted;
    })
    storage.set(jsonParsed);
    toastUpdate('Save Data Found!');
  }
  // This needs to be here so you don't overwrite the localstorage before checking
  storage.subscribe((value) => (window.localStorage.streamTools = JSON.stringify(value)));

  // This no longer returns anything

  // NEXT
  // Emote Drop +page
  // EmoteDrop

  
  // //Object Assign is a safe way of copying an object, otherwise Svelte reloads
  // let initParams = Object.assign({}, defaults[app]);
  // let storage = window.localStorage.getItem(app);
  
  // // If there is no save, create one.
  // if (storage === null) {
  //   window.localStorage.setItem(app, '{"0":{},"1":{},"2":{}}');
  //   return await reformatting[app](initParams);
  // } else {
  //   try {
  //     let parsedData = JSON.parse(storage);
  //     if (parsedData[0].channel) {
  //       toastUpdate('Save Data Found!');
  //       for (let i = 0; i < 3; i++){
  //         if (parsedData[i].channel) initParams['saves'][i] = true;
  //       }
  //     }
  //   } catch(e) {
  //     console.log(e);
  //     window.localStorage.setItem(app, '{"0":{},"1":{},"2":{}}');
  //   }
  // }

  // // Finding save data
  // return await reformatting[app](initParams);
}