import { writable, get } from 'svelte/store';
import AllWords from "./words/all.txt?raw";
import Movies from "./words/movies.txt?raw";
import Food from "./words/food.txt?raw";
import Games from "./words/games.txt?raw";

//Stores
const blankGrid:Array<Array<string>> = [['','','','',''],['','','','',''],['','','','',''],['','','','',''],['','','','',''],['','','','','']]
const blankStorage:TwordleStorage = {
  play: 0,
  won: 0,
  votes: 0,
  auto: false,
  dark: false,
  keyboard: true,
  volume: 3,
  timer: 25,
  channel: "",
  words: 'all',
}
const blankGame:TwordleGame = {
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

export const language = writable('en');
export const grid = writable(blankGrid);
export const storage = writable(Object.assign({}, blankStorage));
export const currentGame = writable(Object.assign({}, blankGame));

export const languageList:standardObject = {
  "es": "¡Los caracteres españoles son compatibles!",
  "fr": "Les caractères français sont pris en charge!",
  "de": "Deutsche Schriftzeichen werden unterstützt!",
}

export let personalisedUsers:standardObject = {
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


// YOU NEED TO CHANGE THIS SO THAT IT REGENERATES WITH DIFFERENT LANGUAGES
export let emptyPoll:TwordlePoll = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  E: 0,
  F: 0,
  G: 0,
  H: 0,
  I: 0,
  J: 0,
  K: 0,
  L: 0,
  M: 0,
  N: 0,
  O: 0,
  P: 0,
  Q: 0,
  R: 0,
  S: 0,
  T: 0,
  U: 0,
  V: 0,
  W: 0,
  X: 0,
  Y: 0,
  Z: 0
}

export let qwerty:TwordleKeys = {
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

export function characterChecker(input:number){
  if (input >= 65 && input <= 91) return true;
  if (input >= 192 && input <= 221) return true;
  if (input === 338 || input === 7838) return true;
  return false;
}

export function getMax(object:TwordlePoll) {
  return Object.keys(object).filter(x => {
    return object[x] == Math.max.apply(null, Object.values(object));
  }).map(x => x.toUpperCase());
};

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

let wordSelect = {
  'all': AllWords,
  'movies': Movies,
  'food': Food,
  'games': Games
}
export function randomWord(){
  let currentStorage = get(storage);
  let wordCollection = wordSelect[currentStorage.words];
  let TwordleWords = wordCollection.split("\r\n");
  return TwordleWords[getRandomInt(TwordleWords.length)].toUpperCase();;
}

export function incrementStat(targetStat:'play'|'won'|'votes'|'timer', value:number){
  storage.update((prev) => {
    let statUpdate = prev;
    statUpdate[targetStat] += value;
    return statUpdate;
  });
}
export function decrementStat(targetStat:'play'|'won'|'votes'|'timer', value:number){
  storage.update((prev) => {
    let statUpdate = prev;
    statUpdate[targetStat] -= value;
    return statUpdate;
  });
}

export function changeSetting(targetSetting:string, value:any){
  storage.update(state => ({...state, [targetSetting]: value}))
}

// Gameplay

export function gridLetterUpdate(value:string){
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

export function undoMove(){
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

export function updateGame(targetSetting:string, value:any){
  currentGame.update(state => ({...state, [targetSetting]: value}))
}
export function updateGuess(){
  currentGame.update((state) => {
    state.currentGuess = state.guess[state.round].join("");
    return state;
  })
}
export function incrementGame(toAdd:{'round':number, 'letter': number, 'votes': number}){
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
export function changeState(newState:TwordleGame["state"]){
  currentGame.update((state)=>{
    state.state = newState;
    return state;
  })
}