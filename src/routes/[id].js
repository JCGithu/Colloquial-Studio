export async function get({params}){
  console.log(params.id);

  let pages = {
    "twordle": "/wordles/twordle",
    "chatter": "/streamtools/chatter"
  }
  
  let pageArray = Object.keys(pages)

  for (let i = 0; i < pageArray.length; i++ ){
    if (params.id === pageArray[i]){
      return {
        status: 301,
        headers: { Location: pages[pageArray[i]] },
      }
    }
  }

  return {
    headers: { Location: '/' },
    status: 302
  };
}