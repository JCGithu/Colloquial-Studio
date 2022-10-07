function pullStructure(modules){
  let data = {};
  for (let path in modules) {
    let cleanPath = path.replace(".svelte", "").replace("./", "");
    let split = cleanPath.split("/");
    let name = split[0];
    if (split[1]) {
      if (!data[name]) Object.assign(data, {[name]: { list: [], on: false }});
      data[name].list.push(split[1]);
    }
  }
  return data;
}

export default pullStructure;

