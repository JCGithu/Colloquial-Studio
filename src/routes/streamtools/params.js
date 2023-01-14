import JSONCrush from "jsoncrush";

export function urlBuild(params, baseURL) {
  let toCrush = Object.assign({}, params);
  delete toCrush.saves;
  let urlCrush = encodeURIComponent(JSONCrush.crush(JSON.stringify(toCrush)));
  return `${baseURL}?data=${urlCrush}`;
}
export function uncrush(set) {
  let undecode = decodeURIComponent(set);
  let uncrushed = JSONCrush.uncrush(undecode);
  return JSON.parse(uncrushed);
}
export function save(params, app, slot) {
  console.log(params, app, slot)
  let toSave = Object.assign({}, params);
  delete toSave.saves;
  params['saves'][slot] = toSave;
  window.localStorage.setItem(app, JSON.stringify(params['saves']));
}

export function updateV1URLs(input, defaultParams){
  if (!input.version || input.version === 1){
    if (input.fontsize) input.fontsize = input.fontsize * 8;
  }
  Object.keys(defaultParams).forEach((def)=>{
    if(input[def] === null || input[def] === undefined){
      input[def] = defaultParams[def];
      console.log(def + ' was changed to ' + defaultParams[def]);
    }
  });
  return input;
}

export async function load(input, paramReformat, defaultParams, pastSave){
  let parsedData;
  if (typeof input === 'string'){
    let splitInput = input.split("?data=");
    let uncrushedData = uncrush(splitInput[1]);
    parsedData = updateV1URLs(uncrushedData, defaultParams);
  } else {
    parsedData = Object.assign({}, input);
  }
  parsedData.saves = pastSave;
  return await paramReformat(parsedData);
}

export async function check(defaultParams, paramReformat, runApp, app, urlParams, toastUpdate){
  let initParams;
  if (runApp) {
    initParams = uncrush(urlParams.get("data"));
    let updatedData = updateV1URLs(initParams, defaultParams);
    return await paramReformat(updatedData);
  }
  let storage = window.localStorage.getItem(app);
  if (storage === null) {
    initParams = Object.assign({}, defaultParams);
    let defaultSettings = {0:{},1:{},2:{}};
    initParams['saves'] = defaultSettings;
    window.localStorage.setItem(app, JSON.stringify(defaultSettings));
  } else {
    let parsedData = JSON.parse(storage);
    if (Object.keys(parsedData[0]).length) toastUpdate('Save Data Found!')
    initParams = Object.assign({}, defaultParams);
    initParams['saves'] = parsedData;
  }
  return await paramReformat(initParams);
}