<script lang="ts">
  import { grid } from "./twFunctions";
  import Cell from "./cell.svelte";
  export let currentGame: TwordleGame;
</script>

<div id="grid">
  {#each $grid as row, y}
    <div class="row" id={"row" + y} class:rowSelected={y === currentGame.round}>
      {#each row as cell, x}
        <Cell {x} {y} {currentGame} />
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  #grid {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 350px;
  }
  .row {
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    max-height: 70px;
    max-width: calc(70px * 5);
    justify-content: space-between;
    padding: 0.3rem 0rem;
  }
</style>
