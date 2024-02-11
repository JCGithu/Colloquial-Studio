<script lang="ts">
  import { getContext, afterUpdate } from "svelte";
  import { grid, currentGame } from "../Twordle";
  import { storage } from "../../../gameParams";

  export let x: number;
  export let y: number;

  let selected = false;
  let correct = false;
  let maybe = false;
  let wrong = false;

  $: letter = $grid[y][x];
  let styleString = getContext("colours");
  let delay = (x + y) * 0.1;
  afterUpdate(() => {
    selected = $currentGame.round === y && $currentGame.letter === x;
    if ($currentGame.round <= y) return;
    correct = $currentGame.guess[y][x] === $currentGame.answer[x];
    maybe = $currentGame.answer.includes($currentGame.guess[y][x]) && !correct;
    wrong = !correct && !maybe;
  });
</script>

<div class="cell {$storage.twordle.settings.dark ? 'twordleDark' : 'twordleLight'}" class:maybe class:correct class:wrong class:selected style="{styleString} --delay:{delay}s;">{letter}</div>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;
  .cell {
    border-color: var(--cellBorder);
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
    background-color: var(--cellBackdrop);
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
