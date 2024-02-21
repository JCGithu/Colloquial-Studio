import { compareObjects } from "../../toolParams";
export const defaultParams: EmoteDropParameters = {
  channel: '',
  version: 2,
  limit: 100,
  scale: 2,
  friction: 10,
  time: 60,
  bounce: 5,
  shape: 1,
  quality: 2,
  gravity: 2,
  animated: false,
  random: false,
  timeon: true,
  modWipe: true,
  suika: false,
  intro: false,
};

// Put IDs of relevant inputs
//let arrays:Array<keyof EmoteDropParameters> = [''];
let booleans: Array<keyof EmoteDropParameters> = ['random', 'timeon', 'modWipe', 'intro', 'animated'];

//Individual Functions

// Main Reformat
export async function paramReformat(params: EmoteDropParameters) {
  // If the function is provided an ID it only changes that value then returns nothing
  if (params.version < defaultParams.version) compareObjects(params, defaultParams);
  booleans.forEach((b) => {
    if (typeof params[b] === 'string') (params[b] as boolean) = (params[b] === 'true');
  });
  return params;
}

