import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import AllWords from "./words/all.txt?raw";
import Movies from "./words/movies.txt?raw";
import Food from "./words/food.txt?raw";
import Gaming from "./words/gaming.txt";

//Grid
const blankGrid: Array<Array<string>> = [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']]
export const grid = writable(blankGrid);

//Boot
export const defaultParams: TwordleParameters = {
  auto: false,
  dark: false,
  language: 'en',
  keyboard: true,
  volume: 3,
  timer: 25,
  channel: "",
  mode: 'letters',
  words: 'all',
  version: 2
}
const blankGame: TwordleGame = {
  round: -1,
  letter: -1,
  timer: 0,
  votes: 0,
  menu: 0,
  message: "",
  currentGuess: '',
  guess: [[], [], [], [], [], []],
  answer: "",
  state: "START",
  connected: false,
};
const blankStats: TwordleStats = {
  play: 0,
  votes: 0,
  won: 0
}

export const currentGame = writable(structuredClone(blankGame));

export const languageList: Record<string, string> = {
  "es": "¡Los caracteres españoles son compatibles!",
  "fr": "Les caractères français sont pris en charge!",
  "de": "Deutsche Schriftzeichen werden unterstützt!",
}

export let personalisedUsers: Record<string, string> = {
  //coollike: "https://static-cdn.jtvnw.net/emoticons/v2/305274770/default/light/3.0",
  lbx0: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_44ede65082fb45ef9473c9966c3cd9ea/default/light/3.0",
  colloquialowl: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_607ddb2a873f4606b5397997c33b6bbf/default/light/3.0",
  letsbrock: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_7d127fea0d5d481e886c7161d45b4d78/default/light/3.0",
  arcasian: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_c889ae6320e74a29baa2e46bd6a6d0d6/default/light/3.0",
  certainlylaz: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_0f82cf9b2bcb41d3823ab0273c122208/default/dark/3.0",
  //geo_master: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_46ac106df68b4a5ba4907317b2b0aafa/default/dark/3.0",
  sskarrlett: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_9860c508ac1843f6a7f84345f97b9cd6/default/dark/3.0",
  astoldbyangela: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_7d4f4841c28d472cbb3a88c4b5040c27/default/dark/3.0",
  cozygamerkat: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_75fa29d856ed4c1a979edcfe68c54448/default/light/3.0",
  hellovonnie: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_4020d73b73714c58aa091c82eb71a4b0/default/light/3.0",
  elliotisacoolguy: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_6e7b14137a824c1fa175ff2d54d3414c/default/light/3.0",
  //gamesarehaunted: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_b64a784799524986894c9b6110dee173/default/light/3.0",
};

export let qwerty: Record<string, Array<Array<string>>> = {
  en: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
  es: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
  fr: [
    ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P", "Ü"],
    ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
    ["W", "X", "C", "V", "B", "N"],
  ],
  de: [
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
    ["Y", "X", "C", "V", "B", "N", "M"],
  ]
};

export function characterChecker(inputString: string) {
  for (var i = 0; i < inputString.length; i++) {
    let value = inputString.charCodeAt(i)
    if (value >= 65 && value <= 91) break;
    if (value >= 192 && value <= 221) break;
    if (value === 338 || value === 7838) break;
    return false;
  }
  return true;
}

export function getMax(object: Record<string, number>) {
  return Object.keys(object).filter(x => {
    return object[x] == Math.max.apply(null, Object.values(object));
  }).map(x => x.toUpperCase());
};

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

let wordSelect: Record<TwordleParameters['words'], string> = {
  'all': AllWords,
  'movies': Movies,
  'food': Food,
  'gaming': Gaming
}
export function randomWord(currentWords: TwordleParameters['words']) {
  // I HAVE NO IDEA WHY I NEED TO PUT THIS ''AS'' HERE.
  let wordCollection: string = wordSelect[currentWords];
  let TwordleWords = wordCollection.split("\r\n");
  return TwordleWords[getRandomInt(TwordleWords.length)].toUpperCase();;
}

// Gameplay
export function gridLetterUpdate(value: string) {
  // Updating the Guess
  currentGame.update(state => {
    state.guess[state.round][state.letter] = value;
    return state;
  });
  // Updating the Grid
  grid.update((currGrid) => {
    let currentGameData = get(currentGame);
    currGrid[currentGameData.round][currentGameData.letter] = value;
    return currGrid;
  });
}

export function undoMove() {
  let currentGameData = get(currentGame);
  if (currentGameData.round < 0) return;
  if (currentGameData.guess[currentGameData.round].length === 0) return;
  currentGame.update(state => {
    state.guess[state.round] = state.guess[state.round].slice(0, -1);
    --state.letter;
    return state
  })
  grid.update((currGrid) => {
    currGrid[currentGameData.round][currentGameData.letter] = '';
    return currGrid;
  })
}

export function updateGame(targetSetting: string, value: any) {
  currentGame.update(state => ({ ...state, [targetSetting]: value }))
}
export function updateGuess() {
  currentGame.update((state) => ({ ...state, currentGuess: state.guess[state.round].join("") }))
}
export function incrementGame(toAdd: { 'round': number, 'letter': number, 'votes': number }) {
  currentGame.update((state) => {
    state.round = state.round + toAdd.round;
    if (toAdd.round < 0) state.round = 0;
    state.letter = state.letter + toAdd.letter;
    if (toAdd.letter < 0) state.letter = 0;
    state.votes = state.votes + toAdd.votes;
    if (toAdd.votes < 0) state.votes = 0;
    return state;
  });
  updateGuess();
}
export function changeState(newState: TwordleGame["state"]) {
  currentGame.update((state) => {
    state.state = newState;
    return state;
  })
}