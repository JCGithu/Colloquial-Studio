import { get } from 'svelte/store';
import { storage } from "../../toolParams";
import type { ChatUserstate } from "tmi.js";

const cheerTiers = [1, 100, 1000, 5000, 10000, 100000];
const otherCheers = ['cheer', 'biblethump', 'cheerwhal', 'corgo', 'uni', 'showlove', 'party', 'seemsgood', 'pride', 'kappa', 'frankerz', 'heyguys', 'dansgame', 'elegiggle', 'trihard', 'kreygasm', '4head', 'swiftrage', 'notlikethis', 'failfish', 'vohiyo', 'pjsalt', 'mrdestructoid', 'bday', 'ripcheer', 'shamrock'];
const cheerRex = new RegExp(otherCheers.join('\\d+|') + `\\d+`, 'gi');

function checkEmotes(emotes: { [key: number]: Array<string> }, splitText: Array<MessageChunk>, text: string) {
  for (let i in emotes) {
    let emoteArea = emotes[i][0]
    const [start, end] = emoteArea.replace('"', '').split('-').map(Number);
    const emoteString = text.substring(start, end + 1);
    for (let s in splitText) {
      if (splitText[s].text === emoteString) {
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

function checkBits(splitText: Array<MessageChunk>) {
  return splitText.map(chunk => {
    let cheerTest = cheerRex.test(chunk.text.toLowerCase());
    if (!cheerTest) return chunk;
    let title = chunk.text.match(/[a-zA-z]+/g)![0].toLowerCase();
    let num = parseInt(chunk.text.match(/\d+/g)![0]);
    cheerTiers.forEach(rank => {
      if (num >= rank) {
        return {
          code: `https://d3aqoihi2n8ty8.cloudfront.net/actions/${title}/dark/animated/${rank}/2.gif`,
          num,
          text: chunk.text
        }
      }
    })
    return chunk;
  })
}

function checkBTTV(bttvEmoteCache: Map<string, string>, splitText: Array<MessageChunk>) {
  return splitText.map(chunk => ({
    ...chunk,
    code: bttvEmoteCache.has(chunk.text) ? bttvEmoteCache.get(chunk.text) : chunk.code
  }));
}

function checkFFZ(ffzCache: Map<string, string>, splitText: Array<MessageChunk>) {
  return splitText.map(chunk => ({
    ...chunk,
    code: ffzCache.has(chunk.text) ? ffzCache.get(chunk.text) : chunk.code
  }));
}

export function formatEmotes(text: string, splitText: Array<string>, emotes: ChatUserstate['emotes'], bttvEmoteCache: Map<string, string>, ffzCache: Map<string, string>, bits: number | undefined): Array<MessageChunk> {
  let textArray: Array<MessageChunk> = splitText.map(text => ({ code: undefined, text, num: undefined }));
  if (emotes) textArray = checkEmotes(emotes, textArray, text);
  if (bits) textArray = checkBits(textArray);
  let params = get(storage);
  if (bttvEmoteCache && params.chatter.inProgress.bttv) textArray = checkBTTV(bttvEmoteCache, textArray);
  if (ffzCache && params.chatter.inProgress.ffz) textArray = checkFFZ(ffzCache, textArray);
  return textArray;
}