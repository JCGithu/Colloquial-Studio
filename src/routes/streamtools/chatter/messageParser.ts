import type { ChatterParameters } from "./paramsChatter";

const cheerTiers = [1, 100, 1000, 5000, 10000, 100000];
const otherCheers = ['cheer', 'biblethump', 'cheerwhal', 'corgo', 'uni', 'showlove', 'party', 'seemsgood', 'pride', 'kappa', 'frankerz', 'heyguys', 'dansgame', 'elegiggle', 'trihard', 'kreygasm', '4head', 'swiftrage','notlikethis', 'failfish', 'vohiyo', 'pjsalt', 'mrdestructoid', 'bday', 'ripcheer', 'shamrock'];
const cheerRex = new RegExp(otherCheers.join('\\d+|') + `\\d+`, 'gi');

function checkEmotes(emotes:{[key:number]:Array<string>}, splitText:Array<MessageChunk>, text:string){
  for (let i in emotes){
    let emoteArea = emotes[i][0]
    let parsed = emoteArea.replace('"', '').split('-');
    let emoteString = text.substring(parseInt(parsed[0]), parseInt(parsed[1]) + 1);
    for (let s in splitText){
      if (splitText[s].text === emoteString){
        splitText[s] = {
          code: `http://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/3.0`,
          text: emoteString,
          num: undefined
        }
      }
    }
  }
  return splitText
}

function checkBits(splitText:Array<MessageChunk>){
  splitText.forEach(chunk => {
    let cheerTest = cheerRex.test(chunk.text.toLowerCase());
    if (!cheerTest) return;
    let title = chunk.text.match(/[a-zA-z]+/g)![0];
    title = title.toLowerCase();
    let num = parseInt(chunk.text.match(/\d+/g)![0]);
    cheerTiers.forEach(rank => {
      if (num < rank) return;
      chunk = {
        code: `https://d3aqoihi2n8ty8.cloudfront.net/actions/${title}/dark/animated/${rank}/2.gif`,
        num: num,
        text: chunk.text
      }
    })
  })
  return splitText;
}

function checkBTTV(bttvEmoteCache:Array<bttvEmote>, splitText:Array<MessageChunk>){
  for (let i in splitText){
    bttvEmoteCache.forEach((BTTVE) => {
      if (splitText[i].text === BTTVE.code){
        splitText[i] = {
          code: `https://cdn.betterttv.net/emote/${BTTVE.id}/3x`,
          text: splitText[i].text,
        };
      }
    });
  }
  return splitText;
}

function checkFFZ(ffzCache:Array<ffzEmote>, splitText:Array<MessageChunk>){
  for (let i in splitText){
    ffzCache.forEach((FFZE) => {
      if (splitText[i].text === FFZE.name){
        splitText[i] = {
          code: FFZE.urls[Object.keys(FFZE.urls).length-1],
          text: splitText[i].text,
        };
        console.log(splitText[i]);
      }
    });
  }
  return splitText;
}

  
export function formatEmotes(text:string, emotes:Tags['emotes'], bttvEmoteCache:Array<bttvEmote>, ffzCache:Array<ffzEmote>, bits:number|undefined, params:ChatterParameters):Array<MessageChunk> {
  var splitText:Array<any> = text.split(' ');
  for (let i in splitText){
    splitText[i] = {
      code: null,
      text: splitText[i],
      num: undefined
    }
  }
  if (emotes) splitText = checkEmotes(emotes, splitText, text);
  if (bits) splitText = checkBits(splitText);
  if (bttvEmoteCache && params.bttv) splitText = checkBTTV(bttvEmoteCache, splitText);
  if (ffzCache && params.ffz) splitText = checkFFZ(ffzCache, splitText); 
  return splitText;
}