import { writable, get } from 'svelte/store';
import AllWords from "./words/all.txt?raw";
import Movies from "./words/movies.txt?raw";
import Food from "./words/food.txt?raw";
import Gaming from "./words/gaming.txt?raw";

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

export const currentGame = writable(structuredClone(blankGame));

export const languageList: Record<string, string> = {
  "es": "¡Los caracteres españoles son compatibles!",
  "fr": "Les caractères français sont pris en charge!",
  "de": "Deutsche Schriftzeichen werden unterstützt!",
}

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

const wordSelect: Map<TwordleParameters['words'], string> = new Map([
  ["all", AllWords],
  ["movies", Movies],
  ["food", Food],
  ["gaming", Gaming]
])

export function randomWord(currentWords: TwordleParameters['words']) {
  let wordCollection = wordSelect.get(currentWords)!;
  let TwordleWords = wordCollection.split("\r\n");
  let randomWord = TwordleWords[getRandomInt(TwordleWords.length)].toUpperCase();
  return randomWord;
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

export function gridWordUpdate(value: string) {
  for (let i = 0; i < value.length; i++) {
    currentGame.update(state => {
      state.guess[state.round][i] = value[i];
      return state;
    });
    grid.update((currGrid) => {
      let currentGameData = get(currentGame);
      currGrid[currentGameData.round][i] = value[i];
      return currGrid;
    });
  }
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