export const defaultParams = {
  channel: false,
  font: "Poppins",
  fontsize: 16,
  align: "flex-start",
  chatcolour: "#262d36",
  chatcolourCalc: "#262d36",
  highcolour: "#525be1",
  bgcolour: "#262d36",
  fontcolour: "#f7f7ff",
  bgopacity: 1,
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
  proFont: "Poppins",
  proOutline: "false",
  proUseCol: "true",
  proColour: "#f7f7ff",
  proBG: "false",
  replies: "false",
  version: 2,
};

let arrays = ['hidebot', 'hidecom'];
let reformattedValues = ['hidebot', 'hidecom', 'chatcolour', 'chatopacity', 'bgopacity', 'bgcolour', 'togglecol', 'badges', 'bttv', 'pronouns', 'emoteonly', 'align'];

export async function paramReformat(params, id){
  if (id && !reformattedValues.includes(id)) return;

  if (params.align === 'left') params.align = 'flex-start';
  if (params.align === 'right') params.align = 'flex-end';

  params.bgopacity = parseInt(params.bgopacity);
  if (params.bgcolour.indexOf('#') < 0) params.bgcolour = '#' + params.bgcolour;

  Object.keys(params).forEach((p) => {
    if (params[p] === "true" || params[p] === "false") params[p] = (params[p] === 'true');
  });

  arrays.forEach((v, i)=>{
    if (typeof params[v] != 'string') return;
    params[v] = params[v].trim().split(',');
  })
  //CHAT COLOUR
  if (params.chatcolour.indexOf('#') < 0){
    params.chatcolourCalc = `rgba(${parseInt(params.chatcolour.slice(-6, -4), 16)},${parseInt(params.chatcolour.slice(-4, -2), 16)},${parseInt(params.chatcolour.slice(-2), 16)},${params.chatopacity / 100})`;
  }
  console.log('Params Reformatted', params);
  if (!id) return params;
  return;
}

