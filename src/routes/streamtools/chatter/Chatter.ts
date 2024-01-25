export const defaultParams: ChatterParameters = {
  channel: '',
  font: "Poppins",
  fontsize: 16,
  align: "flex-start",
  chatcolour: "#262d36",
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
  animTime: "0.5",
  animEase: "ease-in-out",
  emoteOnly: false,
  nameCustom: false,
  bubbleCustom: false,
  points: false,
  proFont: "Poppins",
  proOutline: 1,
  proUseCol: true,
  proColour: "#f7f7ff",
  proBG: 1,
  proOutColour: '#ffffff',
  proBGColour: '#ffffff',
  replies: false,
  links: false,
  removeChats: false,
  wideEmotes: false,
  banner: false,
  removeTime: 60,
  version: 2.1,
  intro: false,
  splitLetters: false,
  shrink: false,
  padding: 1
};

let arrays: Array<keyof ChatterParameters> = ['hidebot', 'hidecom'];
let booleans: Array<keyof ChatterParameters> = ['togglecol', 'badges', 'bttv', 'ffz', 'pronouns', 'emoteOnly', 'nameCustom', 'bubbleCustom', 'points', 'proOutline', 'proUseCol', 'replies', 'links', 'removeChats', 'highlight'];

// INDIVIDUAL FUNCTIONS
function alignConvert(params: ChatterParameters) {
  if (params.align === 'left') params.align = 'flex-start';
  if (params.align === 'right') params.align = 'flex-end';
}
function addHashtoColour(input: string) {
  if (input.indexOf('#') < 0) input = '#' + input;
  return input;
}

// FULL REFORMATTER
export async function paramReformat(params: ChatterParameters, id?: keyof ChatterParameters) {
  // If the function is provided an ID it only changes that value then returns nothing
  if (!params.version) params.fontsize = params.fontsize * 16;

  booleans.forEach((b) => {
    if (typeof params[b] === 'string') (params[b] as boolean) = (params[b] === 'true');
  });
  arrays.forEach((v) => {
    if (typeof params[v] === 'string') (params[v] as Array<string>) = params[v].trim().split(',');
  });

  if (params.fontcolour) params.fontcolour = addHashtoColour(params.fontcolour);
  if (params.bgcolour) params.bgcolour = addHashtoColour(params.bgcolour);
  if (params.highcolour) params.highcolour = addHashtoColour(params.highcolour);

  alignConvert(params);
  return params;
}

