<script lang="ts">
  import { afterUpdate } from "svelte";
  import { qwerty, currentGame } from "../Twordle";
  import { storage } from "../../../gameParams";
  import { slide } from "svelte/transition";

  let keyMap: { [x: string]: Array<string> } = {
    correct: [],
    maybe: [],
    wrong: [],
  };

  afterUpdate(() => {
    if ($currentGame.round <= 0) return;
    let revealRound = $currentGame.round - 1;
    $currentGame.guess[revealRound].forEach((guessLetter, i) => {
      if ($currentGame.guess[revealRound][i] === $currentGame.answer[i]) {
        if (keyMap.correct.includes(guessLetter)) return;
        keyMap.correct.push(guessLetter);
      } else if ($currentGame.answer.includes(guessLetter)) {
        if (keyMap.correct.includes(guessLetter)) return;
        if (keyMap.maybe.includes(guessLetter)) return;
        keyMap.maybe.push(guessLetter);
      } else {
        keyMap.wrong.push(guessLetter);
      }
    });
    keyMap = keyMap;
  });
</script>

<div id="keyboard" class={$storage.twordle.settings.dark ? "twordleDark" : "twordleLight"} transition:slide>
  {#each qwerty[$storage.twordle.settings.language] as row}
    <div class="keyRow">
      {#each row as letter}
        <span class="keyLetter" aria-label={letter} class:correct={keyMap.correct.includes(letter)} class:maybe={keyMap.maybe.includes(letter)} class:wrong={keyMap.wrong.includes(letter)}>{letter}</span>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;
  #keyboard {
    font-size: 13px;
    transition: all 0.5s;
  }

  .keyRow {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 4px;
    height: 40px;
  }

  .keyLetter {
    width: 30px;
    height: 100%;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    --letterMargin: 2px;
    margin: 0px var(--letterMargin);
    &:nth-child(1) {
      margin: 0 var(--letterMargin) 0 0;
    }
    &:last-child {
      margin: 0 0 0 var(--letterMargin);
    }
    border-radius: 0.2rem;
    font-family: "Poppins";
    font-weight: bold;
    background-color: var(--mainDarken10);
    background-color: fade-out(darken($twordleMain, 20), 0.5);
    color: var(--title);
  }

  .wrong {
    opacity: 0.3;
    background-color: gray;
    filter: brightness(0.7);
  }
  .maybe {
    background-color: $twordleOrange;
  }
  .correct {
    background-color: $twordleGreen;
  }
</style>
