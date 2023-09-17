export const defaultParams: ChatterParameters = {
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
  fade: false,
  border: 50,
  bttv: false,
  ffz: false,
  hidebot: "",
  hidecom: "",
  pronouns: false,
  direction: "Down",
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
  wideEmotes: false,
  banner: false,
  removeTime: 60,
  version: 2,
  intro: false,
  splitLetters: false,
  shrink: false,
  padding: 1
};

let arrays: Array<keyof ChatterParameters> = ['hidebot', 'hidecom'];
let booleans: Array<keyof ChatterParameters> = ['togglecol', 'badges', 'bttv', 'ffz', 'pronouns', 'emoteOnly', 'nameCustom', 'bubbleCustom', 'points', 'proOutline', 'proUseCol', 'proBG', 'replies', 'links', 'removeChats', 'highlight'];

// INDIVIDUAL FUNCTIONS
function alignConvert(params: ChatterParameters) {
  if (params.align === 'left') params.align = 'flex-start';
  if (params.align === 'right') params.align = 'flex-end';
}
function chatColourCalculation(params: ChatterParameters) {
  params.chatcolourCalc = `rgba(${parseInt(params.chatcolour.slice(-6, -4), 16)},${parseInt(params.chatcolour.slice(-4, -2), 16)},${parseInt(params.chatcolour.slice(-2), 16)},${params.chatopacity / 100})`;
}
function backgroundOpacity(params: ChatterParameters) {
  if (typeof params.bgopacity === 'string') params.bgopacity = parseInt(params.bgopacity);
}
function addHashtoColour(input: string) {
  if (input.indexOf('#') < 0) input = '#' + input;
  return input;
}

// FULL REFORMATTER
export async function paramReformat(params: ChatterParameters, id?: keyof ChatterParameters) {
  // If the function is provided an ID it only changes that value then returns nothing
  if (!params.version) params.fontsize = params.fontsize * 16;
  if (!params["chatcolourCalc"]) params["chatcolourCalc"] = params.chatcolour;

  booleans.forEach((b) => {
    if (typeof params[b] === 'string') (params[b] as boolean) = (params[b] === 'true');
  });
  arrays.forEach((v) => {
    if (typeof params[v] === 'string') (params[v] as Array<string>) = params[v].trim().split(',');
  });

  if (params.fontcolour) params.fontcolour = addHashtoColour(params.fontcolour);
  if (params.bgcolour) params.bgcolour = addHashtoColour(params.bgcolour);
  if (params.highcolour) params.highcolour = addHashtoColour(params.highcolour);

  if (id) {
    //ALIGN
    if (id === 'align') alignConvert(params);
    if (id === 'chatcolour' || id === 'chatopacity') chatColourCalculation(params);
    if (id === 'bgopacity') backgroundOpacity(params);
    return params;
  };

  // Otherwise it changes everything it can and returns params
  alignConvert(params);
  chatColourCalculation(params);
  backgroundOpacity(params);

  //console.log('Params Reformatted', params);
  return params;
}

