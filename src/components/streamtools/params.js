import JSONCrush from "jsoncrush";
import * as paramFunctions from "../../components/streamtools/params";

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

export async function load(input, paramReformat, pastSave){
  let parsedData;
  if (typeof input === 'string'){
    let splitInput = input.split("?data=");
    parsedData = uncrush(splitInput[1]);
  } else {
    parsedData = Object.assign({}, input);
  }
  console.log('loading!', parsedData);
  parsedData.saves = pastSave;
  console.log('loading! 222', parsedData);
  return await paramReformat(parsedData);
}

export async function check(defaultParams, paramReformat, runApp, app, urlParams){
  let initParams;
  if (runApp) {
    initParams = paramFunctions.uncrush(urlParams.get("data"));
    console.log(initParams);
    return await paramReformat(initParams);
  }
  let storage = window.localStorage.getItem(app);
  if (storage === null) {
    initParams = Object.assign({}, defaultParams);
    let defaultSettings = {0:{},1:{},2:{}};
    initParams['saves'] = defaultSettings;
    window.localStorage.setItem(app, JSON.stringify(defaultSettings));
  } else {
    console.log('Saves found!');
    let parsedData = JSON.parse(storage);
    var answer = window.confirm("Save data found, load now?");
    if (answer) {
      let pick = false
      for (let i = 2; i > -1; i--){
        if (parsedData[i].bgcolour) pick = i;
        console.log(parsedData[i]);
        console.log(pick);
      }
      if (pick === false) {
        initParams = Object.assign({}, defaultParams);
      } else {
        initParams = parsedData[pick];
      }
    }
    else {
      initParams = Object.assign({}, defaultParams);
    }
    initParams['saves'] = parsedData;
  }
  return await paramReformat(initParams);
}