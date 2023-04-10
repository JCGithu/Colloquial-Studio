export interface ChatterParameters {
  [x: string]: any;
  channel: string;
  font: string;
  fontsize: any;
  align: string;
  chatcolour: string;
  chatcolourCalc: string;
  highcolour: string;
  bgcolour: string;
  fontcolour: string;
  bgopacity: number;
  chatopacity: any;
  togglecol: string | boolean;
  animation: string;
  badges: string | boolean;
  border: any;
  bttv: string | boolean;
  ffz: string | boolean;
  hidebot: any;
  hidecom: any;
  pronouns: string | boolean;
  direction: string;
  customCSS: string;
  animTime: string;
  animEase: string;
  highlight: string | boolean;
  emoteOnly: string | boolean;
  nameCustom: string | boolean;
  bubbleCustom: string | boolean;
  splitLetters: boolean;
  proFont: string;
  proOutline: boolean | string;
  proUseCol: boolean | string;
  proColour: string;
  proBG: any;
  replies: boolean | string;
  links: boolean | string;
  removeChats: boolean | string;
  points: boolean | string;
  removeTime: any;
  version: number;
  intro: boolean;
}

export const defaultParams:ChatterParameters = {
  channel: '',
  font: "Poppins",
  fontsize: 16,
  align: "flex-start",
  chatcolour: "#262d36",
  chatcolourCalc: "#262d36",
  highcolour: "#525be1",
  bgcolour: "#DDD0B6",
  fontcolour: "#f7f7ff",
  bgopacity: 100,
  chatopacity: 90,
  highlight: false,
  togglecol: true,
  animation: "Pop In",
  badges: true,
  border: 50,
  bttv: false,
  ffz: false,
  hidebot: "",
  hidecom: "",
  pronouns: false,
  direction: "Down",
  customCSS: "",
  animTime: "0.5",
  animEase: "ease-in-out",
  emoteOnly: false,
  nameCustom: false,
  bubbleCustom: false,
  points: false,
  proFont: "Poppins",
  proOutline: false,
  proUseCol: true,
  proColour: "#f7f7ff",
  proBG: false,
  replies: false,
  links: false,
  removeChats: false,
  removeTime: 60,
  version: 2,
  intro: false,
  splitLetters: false,
};

let arrays = ['hidebot', 'hidecom'];
let booleans = ['togglecol', 'badges', 'bttv', 'ffz', 'pronouns', 'emoteOnly', 'nameCustom', 'bubbleCustom', 'points', 'proOutline', 'proUseCol', 'proBG', 'replies', 'links', 'removeChats', 'highlight'];

// INDIVIDUAL FUNCTIONS
function alignConvert(params:ChatterParameters){
  if (params.align === 'left') params.align = 'flex-start';
  if (params.align === 'right') params.align = 'flex-end';
}
function chatColourCalculation(params:ChatterParameters){
  params.chatcolourCalc = `rgba(${parseInt(params.chatcolour.slice(-6, -4), 16)},${parseInt(params.chatcolour.slice(-4, -2), 16)},${parseInt(params.chatcolour.slice(-2), 16)},${params.chatopacity / 100})`;
}
function backgroundOpacity(params:ChatterParameters){
  if (typeof params.bgopacity === 'string') params.bgopacity = parseInt(params.bgopacity);
}
function backgroundColour(params:ChatterParameters){
  if (params.bgcolour.indexOf('#') < 0) params.bgcolour = '#' + params.bgcolour;
}

// FULL REFORMATTER
export async function paramReformat(params:ChatterParameters, id?:string){
  // If the function is provided an ID it only changes that value then returns nothing
  if (!params.version) params.fontsize = params.fontsize * 16;
  if (!params["chatcolourCalc"]) params["chatcolourCalc"] = params.chatcolour;

  if (id) {
    //ARRAYS
    if (arrays.includes(id) && typeof params[id] === 'string') params[id] = params[id].trim().split(',');
    //BOOLEANS
    if (booleans.includes(id) && typeof params[id] === 'string') params[id] = (params[id] === 'true');
    //ALIGN
    if (id === 'align') alignConvert(params);
    if (id === 'chatcolour' || id === 'chatopacity') chatColourCalculation(params);
    if (id === 'bgopacity') backgroundOpacity(params);
    if (id === 'bgcolour') backgroundColour(params);
    //console.log (`"${id} reformatted to "${params[id]}"`);
    return params;
  };

  // Otherwise it changes everything it can and returns params
  alignConvert(params);
  chatColourCalculation(params);
  backgroundOpacity(params);
  backgroundColour(params)

  booleans.forEach((b) => {
    if (typeof params[b] === 'string') params[b] = (params[b] === 'true');
  });
  arrays.forEach((v, i)=>{
    if (typeof params[v] != 'string') return;
    params[v] = params[v].trim().split(',');
  });

  //console.log('Params Reformatted', params);
  return params;
}

