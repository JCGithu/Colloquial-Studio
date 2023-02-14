import JSONCrush from "jsoncrush";

import { paramReformat as paramReformatChatter } from "./chatter/paramsChatter";
import { paramReformat as paramReformetEmote } from "./emotedrop/paramsEmoteDrop";

import { defaultParams as defaultChatter } from "./chatter/paramsChatter";
import { defaultParams as defaultEmote } from "./emotedrop/paramsEmoteDrop";
import { init } from "svelte/internal";

let reformatting: {[x:string]:Function} = {
  'chatter': paramReformatChatter,
  'emotedrop': paramReformetEmote
}

let defaults: {[x:string]: any} = {
  'chatter': defaultChatter,
  'emotedrop': defaultEmote
}

export function urlBuild(params:standardObject, baseURL:string, channelName:string) {
  let toCrush = Object.assign({}, params);
  delete toCrush.saves;
  toCrush.channel = channelName;
  let urlCrush = encodeURIComponent(JSONCrush.crush(JSON.stringify(toCrush)));
  if (baseURL.includes('/app')) return `${baseURL}?data=${urlCrush}`;
  return `${baseURL}/app?data=${urlCrush}`;
}

export function uncrush(set:string|null) {
  if (!set) return {};
  let undecode = decodeURIComponent(set);
  let uncrushed = JSONCrush.uncrush(undecode);
  return JSON.parse(uncrushed);
}

export function save(params:standardObject, app:string, slot:number) {
  console.log(`Saving params to ${app}:${slot}`);
  let toSave = Object.assign({}, params);
  delete toSave.saves;
  let storage = window.localStorage.getItem(app) || '{0:{},1:{},2:{}}';
  let storageObj = JSON.parse(storage);
  storageObj[slot] = toSave;
  window.localStorage.setItem(app, JSON.stringify(storageObj));
}

export function updateV1URLs(input:standardObject, app:string){
  if (!input.version || input.version === 1){
    if (input.fontsize) input.fontsize = input.fontsize * 8;
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

export async function runningApp(urlParams:URLSearchParams, app:string) {
  let initParams = uncrush(urlParams.get("data"));
  console.log(initParams);
  let updatedData = updateV1URLs(initParams, app);
  return await reformatting[app](updatedData);
}

export async function loadURL(input:string, app:string){
  let splitInput = input.split("?data=");
  let uncrushedData = uncrush(splitInput[1]);
  let parsedData = updateV1URLs(uncrushedData, app);
  return await reformatting[app](parsedData);
}

//LOADING FROM LOCALSTORAGE
export async function loadSave(slot:number, app:string){
  console.log(`Loading params from ${app}:${slot}`);
  let storage = window.localStorage.getItem(app) || '{0:{},1:{},2:{}}';
  let storageObj = JSON.parse(storage);
  let parsedData = Object.assign({}, storageObj[slot]);
  return await reformatting[app](parsedData);
}

export async function appInit(app:string, toastUpdate:Function){
  //Object Assign is a safe way of copying an object, otherwise Svelte reloads
  let initParams = Object.assign({}, defaults[app]);
  let storage = window.localStorage.getItem(app);
  // If there is no save, create one.
  if (storage === null) {
    window.localStorage.setItem(app, '{0:{},1:{},2:{}}');
    return await reformatting[app](initParams);
  }
  // Finding save data
  let parsedData = JSON.parse(storage);
  if (parsedData[0].channel) {
    toastUpdate('Save Data Found!');
    for (let i = 0; i < 3; i++){
      if (parsedData[i].channel) initParams['saves'][i] = true;
    }
  }
  return await reformatting[app](initParams);
}