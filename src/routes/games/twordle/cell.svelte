<script lang="ts">
  import { getContext, afterUpdate, onMount } from "svelte";
  import { grid } from "./twFunctions";
  export let x: number;
  export let y: number;
  export let currentGame: TwordleGame;

  let selected = false;
  let correct = false;
  let maybe = false;
  let wrong = false;

  $: letter = $grid[y][x];
  let styleString = getContext("colours");
  let delay = (x + y) * 0.1;
  //If current round = y and letter = x make selected true;
  afterUpdate(() => {
    if (currentGame.round === y && currentGame.letter === x) {
      selected = true;
    } else {
      selected = false;
    }
    if (currentGame.round > y) {
      if (currentGame.guess[y][x] === currentGame.answer[x]) {
        correct = true;
      } else if (currentGame.answer.includes(currentGame.guess[y][x])) {
        maybe = true;
      } else {
        wrong = true;
      }
    }
  });
</script>

<div class="cell" class:maybe class:correct class:wrong class:selected style="{styleString} --delay:{delay}s;">{letter}</div>

<style lang="scss">
  @import "../../../css/colours.scss";
  .cell {
    border-color: var(--mainDarken15);
    border-radius: 2px;
    border-style: solid;
    width: 6vh;
    height: 6vh;
    max-width: 60px;
    max-height: 60px;
    font-size: 2rem;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    border-width: 3px;
    transform: scale(0);
    transition: all 0.3s ease-in-out !important;
    animation-name: popIn;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
    animation-delay: var(--delay);
  }
  .selected {
    filter: brightness(1.5);
    transform: scale(1.05) translateY(-1px);
  }
  .wrong {
    background-color: var(--mainDarken5);
    border-width: 0;
    opacity: 0.6;
    width: calc(6vh + 6px);
    height: calc(6vh + 6px);
  }

  .maybe {
    background-color: $twordleOrange;
    border-width: 0;
    width: calc(6vh + 6px);
    height: calc(6vh + 6px);
    color: white;
  }

  .correct {
    background-color: $twordleGreen;
    border-width: 0;
    color: white;
    width: calc(6vh + 6px);
    height: calc(6vh + 6px);
  }
  @keyframes popIn {
    from {
      transform: scale(0) translateY(0px);
    }
    to {
      transform: scale(1) translateY(0px);
    }
  }
</style>
