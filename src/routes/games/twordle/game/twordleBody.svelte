<script lang="ts">
  import { grid, currentGame } from "../Twordle";
  import { storage } from "../../../gameParams";
  import Cell from "./cell.svelte";
  import { slide } from "svelte/transition";
  import DashTab from "../../../../components/DashTab.svelte";
  import HowTo from "./howTo.svelte";
  import Settings from "./settings.svelte";
  import Keyboard from "./keyboard.svelte";
  import EventBox from "./eventBox.svelte";
  let showSettings = false;
  let currentMenu = 1;
</script>

<button class="settingsShow" on:click={() => (showSettings = !showSettings)}>Help & Settings</button>
<div id="grid" class={$storage.twordle.settings.dark ? "twordleDark" : "twordleLight"}>
  {#if showSettings}
    <section id="settings" transition:slide>
      <DashTab
        id="OverlayMenus"
        center={true}
        customClass="inputBlockTab"
        bind:value={currentMenu}
        options={{
          Help: { icon: "help", value: 1 },
          Settings: { icon: "cog", value: 2 },
          Stats: { icon: "stats", value: 3 },
        }}
      />
      {#if currentMenu === 1}
        <HowTo />
      {:else if currentMenu === 2}
        <Settings />
      {:else}
        <h4>Total Votes</h4>
        {$storage.twordle.stats.votes}
        <h4>Games Played</h4>
        {$storage.twordle.stats.play}
        <h4>Games Won</h4>
        {$storage.twordle.stats.won}
      {/if}
    </section>
  {/if}
  {#each $grid as row, y}
    <div class="row" class:fade={showSettings} id={"row" + y} class:rowSelected={y === $currentGame.round}>
      {#each row as cell, x}
        <Cell {x} {y} />
      {/each}
    </div>
  {/each}
  {#if $storage.twordle.settings.keyboard}
    <div class:fade={showSettings}>
      <Keyboard />
    </div>
  {/if}
  <div id="bottom" class:fade={showSettings}>
    <EventBox on:buttonPress />
  </div>
</div>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;

  #grid {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 350px;
  }
  div {
    transition: opacity 0.3s;
  }
  .row {
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: clamp(30px, 5vh, 60px);
    max-width: calc(70px * 5);
    justify-content: center;
    padding: 6px 0rem;
  }
  #row5 {
    margin-bottom: 10px;
  }
  button {
    border: 0;
    font-family: "Poppins";
    color: $white;
    background-color: $twordlePurple;
    padding: 0 1rem;
    border-radius: 0.2rem;
    cursor: pointer;
    margin-bottom: 0.2rem;
  }
  .settingsShow {
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
  }
  #settings {
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--mainDarken20);
    z-index: 1;
    border-radius: 0.5rem;
    --padding: 30px;
    width: calc(100% - 2 * var(--padding));
    padding: 0.5rem var(--padding);
    margin: 0;
    margin-top: 0.3rem;
    height: calc(100% - 3rem);
    display: flex;
    flex-direction: column;
    justify-content: baseline;
    align-items: center;
    overflow-x: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      visibility: hidden;
      width: 0px;
    }
  }
  :global(.TwordleDashButton) {
    border-color: $twordlePurple !important;
    background-color: $twordleDark;
    &:hover {
      font-weight: normal !important;
      transform: none !important;
      border-color: $white;
      box-shadow: none !important;
    }
  }
  h4 {
    margin: 0.2rem;
  }
  .fade {
    opacity: 0;
  }
  :global(.inputBlockTab) {
    padding: 0 !important;
    z-index: 10;
    transition: transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1) !important;
    &:hover,
    &:has(:focus-visible) {
      background-color: transparent !important;
      transform: translateY(24px) scale(1.1);
    }
    :global(.radioGroup) {
      background-color: darken($twordleMain, 10) !important;
      padding: 0.2rem;
    }
    :global(.radioOption) {
      background-color: darken($twordleMain, 40) !important;
      &:has(.TabChecked) {
        opacity: 1;
        background-color: $twordlePurple;
      }
    }
  }
  #bottom {
    position: relative;
    bottom: 0%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: max-content;
    @media only screen and (max-height: "830px") {
      flex-direction: row;
    }
  }
</style>
