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
  console.log('BITS RECIEVED');
  splitText.forEach(chunk => {
    let cheerTest = cheerRex.test(chunk.text.toLowerCase());
    if (!cheerTest) return;
    console.log('cheerrex success');
    let title = chunk.text.match(/[a-zA-z]+/g)![0];
    title = title.toLowerCase();
    let num = parseInt(chunk.text.match(/\d+/g)![0]);
    console.log(title,num);
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

function checkBTTV(bttvEmoteCache:Array<{ code: string; id: string; }>, splitText:Array<object | string>){
  for (let i in splitText){
    bttvEmoteCache.forEach((BTTVE) => {
      if (splitText[i] === BTTVE.code){
        splitText[i] = {
          code: `https://cdn.betterttv.net/emote/${BTTVE.id}/3x`,
          text: splitText[i],
        };
      }
    });
  }
  return splitText;
}
  
export function formatEmotes(text:string, emotes:Tags['emotes'], bttvEmoteCache:Array<bttvEmoteIndividual>, bits:number|undefined, params:ChatterParameters):Array<MessageChunk> {
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
  return splitText;
}