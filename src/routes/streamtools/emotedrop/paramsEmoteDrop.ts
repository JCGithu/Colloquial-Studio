export interface EmoteDropParameters {
  [x: string]: any;
  channel: string;
  blimit: number;
  esize: number;
  bounce:number;
  etime: number;
  sleep: boolean;
  random: boolean;
  modWipe: boolean;
  version: number;
  intro: boolean
}

export const defaultParams:EmoteDropParameters = {
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
//let arrays = [''];
let booleans = ['sleep', 'random'];

//Individual Functions

// Main Reformat
export async function paramReformat(params:EmoteDropParameters, id?:string){
  // If the function is provided an ID it only changes that value then returns nothing
  if (id) {
    if (booleans.includes(id) && typeof params[id] === 'string') params[id] = (params[id] === 'true');
    //console.log (`"${id} reformatted to "${params[id]}"`);
    return params;
  };

  booleans.forEach((b) => {
    if (typeof params[b] === 'string') params[b] = (params[b] === 'true');
  });

  //console.log('Params Reformatted', params);
  return params;
}

