const cheerTiers = [1, 100, 1000, 5000, 10000, 100000];
const otherCheers = ['cheer', 'biblethump', 'cheerwhal', 'corgo', 'uni', 'showlove', 'party', 'seemsgood', 'pride', 'kappa', 'frankerz', 'heyguys', 'dansgame', 'elegiggle', 'trihard', 'kreygasm', '4head', 'swiftrage','notlikethis', 'failfish', 'vohiyo', 'pjsalt', 'mrdestructoid', 'bday', 'ripcheer', 'shamrock'];
const cheerRex = new RegExp(otherCheers.join('\\d+|') + `\\d+`, 'gi');

function checkEmotes(emotes, splitText, text){
  for (let i in emotes){
    let emoteArea = emotes[i][0]
    let parsed = emoteArea.replace('"', '').split('-');
    let emoteString = text.substring(parseInt(parsed[0]), parseInt(parsed[1]) + 1);
    for (let s in splitText){
      if (splitText[s] === emoteString){
        splitText[s] = {
          code: `http://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/3.0`,
          text: emoteString
        }
      }
    }
  }
  return splitText
}

function checkBits(splitText){
  splitText.forEach((chunk, index) => {
    if (!cheerRex.test(chunk)) return;
    let title = chunk.match(/[a-zA-z]+/g)[0];
    title = title.toLowerCase();
    let num = parseInt(chunk.match(/\d+/g)[0]);
    cheerTiers.forEach(rank => {
      if (num < rank) return;
      splitText[index] = {
        code: `https://d3aqoihi2n8ty8.cloudfront.net/actions/${title}/dark/animated/${rank}/2.gif`,
        num: num,
        text: chunk
      }
    })
  })
  return splitText;
}

function checkBTTV(bttvEmoteCache, splitText){
  for (let i in splitText){
    bttvEmoteCache.forEach(el => {
      if (splitText[i] === el.code){
        splitText[i] = {
          code: `https://cdn.betterttv.net/emote/${el.id}/3x`,
          text: splitText[i],
        };
      }
    });
  }
  return splitText;
}
  
export function formatEmotes(text, emotes, bttvEmoteCache, bits, params) {
  var splitText = text.split(' ');
  if (emotes) splitText = checkEmotes(emotes, splitText, text);
  if (bits) splitText = checkBits(splitText);
  if (bttvEmoteCache && params.bttv) splitText = checkBTTV(bttvEmoteCache, splitText);
  return splitText;
}