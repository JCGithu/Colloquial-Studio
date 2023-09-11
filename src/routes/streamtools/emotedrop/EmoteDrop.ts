export const defaultParams: EmoteDropParameters = {
  channel: '',
  version: 2,
  blimit: 100,
  esize: 2,
  etime: 60,
  bounce: 5,
  random: false,
  sleep: true,
  modWipe: true,
  intro: false,
};

// Put IDs of relevant inputs
//let arrays:Array<keyof EmoteDropParameters> = [''];
let booleans: Array<keyof EmoteDropParameters> = ['sleep', 'random'];

//Individual Functions

// Main Reformat
export async function paramReformat(params: EmoteDropParameters, id: keyof EmoteDropParameters) {
  // If the function is provided an ID it only changes that value then returns nothing

  booleans.forEach((b) => {
    if (typeof params[b] === 'string') (params[b] as boolean) = (params[b] === 'true');
  });
  return params;
}

