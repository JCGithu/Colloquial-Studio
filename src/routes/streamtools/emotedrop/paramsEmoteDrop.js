export const defaultParams = {
  channel: false,
  version: 2,
};

// Put IDs of relevant inputs

// For Array Textboxes
let arrays = [];
// For values that need reformatting from input.
//// Checkboxes, Opacity, Rewording.
let reformattedValues = [];

export async function paramReformat(params, id){
  if (id && !reformattedValues.includes(id)) return;

  Object.keys(params).forEach((p) => {
    if (params[p] === "true" || params[p] === "false") params[p] = (params[p] === 'true');
  });

  arrays.forEach((v, i)=>{
    if (typeof params[v] != 'string') return;
    params[v] = params[v].trim().split(',');
  })

  console.log('Params Reformatted', params);
  if (!id) return params;
  return;
}

