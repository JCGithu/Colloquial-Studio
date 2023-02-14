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
  hidebot: any;
  hidecom: any;
  pronouns: string | boolean;
  direction: string;
  customCSS: string;
  animTime: string;
  animEase: string;
  emoteOnly: string | boolean;
  nameCustom: string | boolean;
  bubbleCustom: string | boolean;
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
  saves:Array<boolean>;
}

export const defaultParams:ChatterParameters = {
  channel: '',
  font: "Poppins",
  fontsize: 16,
  align: "flex-start",
  chatcolour: "#262d36",
  chatcolourCalc: "#262d36",
  highcolour: "#525be1",
  bgcolour: "#262d36",
  fontcolour: "#f7f7ff",
  bgopacity: 3,
  chatopacity: 90,
  togglecol: "true",
  animation: "Pop In",
  badges: "true",
  border: 5,
  bttv: "true",
  hidebot: "",
  hidecom: "",
  pronouns: "false",
  direction: "Down",
  customCSS: "",
  animTime: "0.5",
  animEase: "ease-in-out",
  emoteOnly: "false",
  nameCustom: "false",
  bubbleCustom: "false",
  points: 'false',
  proFont: "Poppins",
  proOutline: "false",
  proUseCol: "true",
  proColour: "#f7f7ff",
  proBG: "false",
  replies: "false",
  links: "false",
  removeChats: 'false',
  removeTime: 60,
  version: 2,
  saves: [false,false,false]
};

let arrays = ['hidebot', 'hidecom'];
let booleans = ['togglecol', 'badges', 'bttv', 'pronouns', 'emoteOnly', 'nameCustom', 'bubbleCustom', 'points', 'proOutline', 'proUseCol', 'proBG', 'replies', 'links', 'removeChats'];

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
export async function paramReformat(params:ChatterParameters, id:string | null){
  // If the function is provided an ID it only changes that value then returns nothing
  if (id) {
    //ARRAYS
    if (arrays.includes(id) && typeof params[id] === 'string') params[id] = params[id].trim().split(',');
    //BOOLEANS
    if (booleans.includes(id) && typeof params[id] === 'string') params[id] = (params[id] === 'true');
    //ALIGN
    if (id === 'align') alignConvert(params);
    if (id === 'chatcolour') chatColourCalculation(params);
    if (id === 'bgopacity') backgroundOpacity(params);
    if (id === 'bgcolour') backgroundColour(params);
    console.log (`"${id} reformatted to "${params[id]}"`);
    return;
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

  console.log('Params Reformatted', params);
  return params;
}

