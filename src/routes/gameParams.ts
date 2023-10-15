import { writable, type Writable } from "svelte/store";
// I'm including this so that the store can check to see if all apps are included
let gameList: Array<gameNames> = ['twordle'];

import { defaultParams as defaultTwordle } from './games/twordle/Twordle';

const defaultSettings: Record<gameNames, gameParameters> = {
  'twordle': defaultTwordle,
}
const defaultStats: Record<gameNames, gameStats> = {
  'twordle': {
    play: 0,
    won: 0,
    votes: 0
  }
}

function generateDefaultStorage() {
  const tempStorage: Partial<gameTotalStorage> = {};
  gameList.forEach(gameKey => {
    tempStorage[gameKey] = {
      settings: structuredClone(defaultSettings[gameKey]),
      stats: structuredClone(defaultStats[gameKey]),
    };
  });
  return tempStorage as gameTotalStorage;
}
const defaultStorage = generateDefaultStorage();
const defaultURLs = gameList.reduce((o, key) => Object.assign(o, { [key]: { current: '', base: '' } }), {});

function makeStore() {
  const { subscribe, set, update } = writable(structuredClone(defaultStorage));
  return {
    subscribe,
    set,
    update,
    incrementStat: (game: gameNames, stat: keyof gameStats, v: number) => update((s) => {
      s[game].stats[stat] += v;
      return s;
    }),
    decrementStat: (game: gameNames, stat: keyof gameStats, v: number) => update((s) => {
      s[game].stats[stat] += v;
      return s;
    }),
  }
}

export const urlFill = writable(defaultURLs) as Writable<Record<streamToolNames, { 'current': string, 'base': string }>>;
//export const storage = writable(structuredClone(defaultStorage));
export const storage = makeStore();
/////////

export async function gameInit(toastUpdate: toastUpdate) {
  let existingStorage = window.localStorage.games;
  if (existingStorage) {
    let jsonParsed = JSON.parse(existingStorage);
    storage.set(jsonParsed);
    toastUpdate('Stats & settings found!', 'pass');
  }

  // Update everything to local storage
  // You don't need to initialise the localstorage connect - this will do that when anything changes;
  storage.subscribe((value) => {
    window.localStorage.games = JSON.stringify(value);
  });

  return true;
}