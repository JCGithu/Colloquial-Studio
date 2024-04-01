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
  @use "../../../../css/default.scss" as d;
  @use "../../../../css/colours.scss" as *;

  .cell {
    --size: clamp(30px, 5vh, 60px);
    --borderSize: 3px;
    border-color: var(--cellBorder);
    border-radius: 2px;
    border-style: solid;
    width: var(--size);
    height: var(--size);
    font-size: 2rem;
    display: flex;
    margin-right: 6px;
    text-align: center;
    justify-content: center;
    align-items: center;
    border-width: var(--borderSize);
    transform: scale(0);
    transition: all 0.3s ease-in-out !important;
    animation-name: popIn;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
    animation-delay: var(--delay);
    &:nth-child(5) {
      margin-right: 0px;
    }
  }
  .selected {
    filter: brightness(1.5);
    transform: scale(1.05) translateY(-1px);
  }
  .wrong,
  .correct,
  .maybe {
    border-width: 0;
    height: calc(var(--size) + (var(--borderSize) * 2));
    width: calc(var(--size) + (var(--borderSize) * 2));
  }
  .wrong {
    background-color: var(--cellBackdrop);
    opacity: 0.6;
  }

  .maybe {
    background-color: $twordleOrange;
    color: white;
  }

  .correct {
    background-color: $twordleGreen;
    color: white;
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
